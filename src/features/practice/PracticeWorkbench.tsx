import { ListChecks, Play, Square } from 'lucide-react'
import { useCallback, useEffect, useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CodeEditor } from '@/features/playground/CodeEditor'
import { RUN_DEFAULTS } from '@/features/playground/config'
import { OutputPanel } from '@/features/playground/OutputPanel'
import { getRunner, useRunner } from '@/features/playground/useRunner'
import type { ProblemEntry } from '@/types/content'
import { allPassed, runSamples, type SampleOutcome } from './runSamples'
import { SampleResults } from './SampleResults'

interface Attempt {
  code: string
  stdin: string
}

const attemptKey = (problemId: string) => `pyacademy:attempt:${problemId}`

function loadAttempt(problem: ProblemEntry): Attempt {
  try {
    const raw = sessionStorage.getItem(attemptKey(problem.id))
    if (raw) {
      const a = JSON.parse(raw) as Partial<Attempt>
      if (typeof a.code === 'string' && typeof a.stdin === 'string') return { code: a.code, stdin: a.stdin }
    }
  } catch {
    // Blocked or corrupt storage → start from the starter code.
  }
  return { code: problem.starterCode ?? '', stdin: problem.sampleTests[0]?.input ?? '' }
}

function saveAttempt(problemId: string, attempt: Attempt) {
  try {
    sessionStorage.setItem(attemptKey(problemId), JSON.stringify(attempt))
  } catch {
    // Storage blocked: the attempt lives until the tab closes.
  }
}

export interface PracticeWorkbenchProps {
  problem: ProblemEntry
  /** Called after "Run samples" finishes (T11 records attempted / solved-sample). */
  onSamplesChecked?: (allPassed: boolean) => void
}

export function PracticeWorkbench({ problem, onSamplesChecked }: PracticeWorkbenchProps) {
  const [attempt, setAttempt] = useState<Attempt>(() => loadAttempt(problem))
  const [tab, setTab] = useState<'samples' | 'custom'>('samples')
  const [outcomes, setOutcomes] = useState<SampleOutcome[]>([])
  const [checking, setChecking] = useState(false)
  const { status, stdout, stderr, result, run, stop, warmUp, loadError } = useRunner()
  const stdinId = useId()
  const timeLimitMs = problem.timeLimitMs ?? RUN_DEFAULTS.timeLimitMs
  const busy = checking || status === 'running'

  useEffect(() => saveAttempt(problem.id, attempt), [problem.id, attempt])

  const onRunCustom = useCallback(() => {
    if (busy) return
    setTab('custom')
    void run(attempt.code, attempt.stdin, timeLimitMs)
  }, [busy, run, attempt.code, attempt.stdin, timeLimitMs])

  const onRunSamples = useCallback(async () => {
    if (busy) return
    setTab('samples')
    setChecking(true)
    setOutcomes([])
    try {
      const results = await runSamples(getRunner(), attempt.code, problem.sampleTests, {
        timeLimitMs,
        maxOutputChars: RUN_DEFAULTS.maxOutputChars,
        compareMode: problem.compareMode,
        onOutcome: (o) => setOutcomes((prev) => [...prev, o]),
      })
      onSamplesChecked?.(allPassed(results))
    } finally {
      setChecking(false)
    }
  }, [busy, attempt.code, problem.sampleTests, problem.compareMode, timeLimitMs, onSamplesChecked])

  const resetCode = () => setAttempt((a) => ({ ...a, code: problem.starterCode ?? '' }))

  return (
    <section aria-label="Code editor" className="min-w-0 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => void onRunSamples()} disabled={busy} className="h-10 px-4">
          <ListChecks aria-hidden /> Run samples
        </Button>
        <Button onClick={onRunCustom} disabled={busy} variant="secondary" className="h-10 px-4">
          <Play aria-hidden /> Run
        </Button>
        <Button onClick={stop} disabled={!busy} variant="outline" className="h-10 px-4">
          <Square aria-hidden /> Stop
        </Button>
        <Button onClick={resetCode} disabled={busy} variant="ghost" className="ml-auto h-10 px-3 text-muted-foreground">
          Reset code
        </Button>
      </div>

      <CodeEditor
        label={`Your solution for ${problem.title}`}
        value={attempt.code}
        onChange={(code) => setAttempt((a) => ({ ...a, code }))}
        onRun={() => void onRunSamples()}
        onFocus={warmUp}
      />
      <p className="text-xs text-muted-foreground">
        Ctrl/⌘ + Enter runs the samples · Time limit {timeLimitMs / 1000} s (in your browser — Python here is slower than on a judge).
      </p>

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'samples' | 'custom')}>
        <TabsList className="group-data-horizontal/tabs:h-10">
          <TabsTrigger value="samples" className="px-3">Sample results</TabsTrigger>
          <TabsTrigger value="custom" className="px-3">Custom input</TabsTrigger>
        </TabsList>
        <TabsContent value="samples" className="pt-3">
          <SampleResults outcomes={outcomes} total={problem.sampleTests.length} running={checking} />
        </TabsContent>
        <TabsContent value="custom" className="space-y-3 pt-3">
          <div className="space-y-1">
            <label htmlFor={stdinId} className="text-sm font-semibold">
              Input (stdin)
            </label>
            <textarea
              id={stdinId}
              value={attempt.stdin}
              onChange={(e) => setAttempt((a) => ({ ...a, stdin: e.target.value }))}
              onFocus={warmUp}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault()
                  onRunCustom()
                }
              }}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              wrap="off"
              rows={4}
              className="block w-full resize-y rounded-lg border bg-background p-3 font-mono text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:text-sm"
            />
          </div>
          <OutputPanel status={status} stdout={stdout} stderr={stderr} result={result} loadError={loadError} />
        </TabsContent>
      </Tabs>

      <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200">
        Passing samples ≠ accepted by the judge. A real judge also runs hidden tests that are bigger and trickier.
      </p>
    </section>
  )
}
