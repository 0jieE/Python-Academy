import type { CompareMode, SampleTest } from '@/types/content'
import type { CodeRunner, RunResult } from '@/types/runner'
import { compareOutput, type CompareResult } from './compareOutput'

/**
 * pass / fail = output compared with the sample (NOT an official verdict).
 * error = Python raised; tle = time limit; stopped = user pressed Stop;
 * skipped = not run because an earlier sample was stopped.
 */
export type SampleVerdict = 'pass' | 'fail' | 'error' | 'tle' | 'stopped' | 'skipped'

export interface SampleOutcome {
  index: number
  name: string
  verdict: SampleVerdict
  input: string
  expected: string
  actual: string
  stderr: string
  compare?: CompareResult
  durationMs: number
  truncated: boolean
}

export interface RunSamplesOptions {
  timeLimitMs: number
  maxOutputChars: number
  compareMode?: CompareMode
  /** Called after each sample finishes (for live progress). */
  onOutcome?: (outcome: SampleOutcome) => void
}

function verdictFor(result: RunResult, compare: CompareResult): SampleVerdict {
  switch (result.status) {
    case 'timeout':
      return 'tle'
    case 'stopped':
      return 'stopped'
    case 'error':
      return 'error'
    case 'finished':
      return compare.passed ? 'pass' : 'fail'
  }
}

/** Run every sample one after another. A TLE or error on one sample does not stop the rest; Stop does. */
export async function runSamples(
  runner: Pick<CodeRunner, 'run'>,
  code: string,
  samples: SampleTest[],
  { timeLimitMs, maxOutputChars, compareMode = 'tokens-per-line', onOutcome }: RunSamplesOptions,
): Promise<SampleOutcome[]> {
  const outcomes: SampleOutcome[] = []
  let stopped = false
  for (const [index, sample] of samples.entries()) {
    const base = { index, name: sample.name ?? `Sample ${index + 1}`, input: sample.input, expected: sample.expectedOutput }
    let outcome: SampleOutcome
    if (stopped) {
      outcome = { ...base, verdict: 'skipped', actual: '', stderr: '', durationMs: 0, truncated: false }
    } else {
      const result = await runner.run({ code, stdin: sample.input, timeLimitMs, maxOutputChars })
      const compare = compareOutput(sample.expectedOutput, result.stdout, compareMode)
      const verdict = verdictFor(result, compare)
      if (verdict === 'stopped') stopped = true
      outcome = {
        ...base,
        verdict,
        actual: result.stdout,
        stderr: result.stderr,
        compare: result.status === 'finished' ? compare : undefined,
        durationMs: result.durationMs,
        truncated: result.truncated,
      }
    }
    outcomes.push(outcome)
    onOutcome?.(outcome)
  }
  return outcomes
}

export const allPassed = (outcomes: SampleOutcome[]) => outcomes.length > 0 && outcomes.every((o) => o.verdict === 'pass')
