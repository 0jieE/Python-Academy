import { describe, expect, it } from 'vitest'
import type { RunRequest, RunResult } from '@/types/runner'
import { allPassed, runSamples } from './runSamples'

/** Fake runner: maps stdin → result, records calls. */
function fakeRunner(byStdin: Record<string, Partial<RunResult>>) {
  const calls: RunRequest[] = []
  return {
    calls,
    run: async (req: RunRequest): Promise<RunResult> => {
      calls.push(req)
      return { status: 'finished', stdout: '', stderr: '', durationMs: 5, truncated: false, ...byStdin[req.stdin] }
    },
  }
}

const opts = { timeLimitMs: 2000, maxOutputChars: 1000 }

describe('runSamples', () => {
  it('passes when output matches, even with CRLF-pasted expected output', async () => {
    const runner = fakeRunner({ '3 4\n': { stdout: '7\n' }, '1 1\n': { stdout: '2\n' } })
    const out = await runSamples(runner, 'code', [
      { input: '3 4\n', expectedOutput: '7\r\n' },
      { input: '1 1\n', expectedOutput: '2\r\n\r\n' },
    ], opts)
    expect(out.map((o) => o.verdict)).toEqual(['pass', 'pass'])
    expect(allPassed(out)).toBe(true)
  })

  it('marks a timeout as TLE and keeps running the next samples', async () => {
    const runner = fakeRunner({ a: { status: 'timeout', durationMs: 2000 }, b: { stdout: 'ok\n' } })
    const out = await runSamples(runner, 'code', [
      { input: 'a', expectedOutput: 'x' },
      { input: 'b', expectedOutput: 'ok' },
    ], opts)
    expect(out.map((o) => o.verdict)).toEqual(['tle', 'pass'])
    expect(runner.calls).toHaveLength(2)
    expect(allPassed(out)).toBe(false)
  })

  it('reports wrong answers with the first differing line, and runtime errors', async () => {
    const runner = fakeRunner({ a: { stdout: '1\n9\n' }, b: { status: 'error', stderr: 'ZeroDivisionError' } })
    const out = await runSamples(runner, 'code', [
      { input: 'a', expectedOutput: '1\n2\n' },
      { input: 'b', expectedOutput: '0' },
    ], { ...opts, compareMode: 'exact' })
    expect(out[0]).toMatchObject({ verdict: 'fail', compare: { firstDiffLine: 2, expectedLine: '2', actualLine: '9' } })
    expect(out[1]).toMatchObject({ verdict: 'error', stderr: 'ZeroDivisionError' })
  })

  it('skips the remaining samples after Stop', async () => {
    const runner = fakeRunner({ a: { status: 'stopped' } })
    const seen: string[] = []
    const out = await runSamples(runner, 'code', [
      { input: 'a', expectedOutput: '' },
      { input: 'b', expectedOutput: '' },
    ], { ...opts, onOutcome: (o) => seen.push(o.verdict) })
    expect(out.map((o) => o.verdict)).toEqual(['stopped', 'skipped'])
    expect(seen).toEqual(['stopped', 'skipped'])
    expect(runner.calls).toHaveLength(1)
  })

  it('passes the time limit and output cap to the runner', async () => {
    const runner = fakeRunner({})
    await runSamples(runner, 'print(1)', [{ input: 'x', expectedOutput: '' }], { timeLimitMs: 1234, maxOutputChars: 99 })
    expect(runner.calls[0]).toEqual({ code: 'print(1)', stdin: 'x', timeLimitMs: 1234, maxOutputChars: 99 })
  })
})
