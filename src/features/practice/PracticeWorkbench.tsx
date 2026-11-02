import { ListChecks, Play, RotateCcw, Square } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { KeyBar } from '@/features/editor/KeyBar'
import type { EditorHandle } from '@/features/editor/types'
import { CodeEditor } from '@/features/playground/CodeEditor'
import { RUN_DEFAULTS } from '@/features/playground/config'
import { RunConsole } from '@/features/playground/RunConsole'
import { getRunner } from '@/features/playground/useRunner'
import { useRunSession } from '@/features/playground/useRunSession'
import type { ProblemEntry } from '@/types/content'
import { allPassed, runSamples, type SampleOutcome } from './runSamples'
import { SampleResults } from './SampleResults'

const attemptKey = (problemId: string) => `pyacademy:attempt:${problemId}`

function loadAttempt(problem: ProblemEntry): string {
  try {
    const raw = sessionStorage.getItem(attemptKey(problem.id))
    if (raw) {
      const a = JSON.parse(raw) as { code?: unknown }
      if (typeof a.code === 'string') return a.code
    }
  } catch {
    // Blocked or corrupt storage → start from the starter code.
  }
  return problem.starterCode ?? ''
}

function saveAttempt(problemId: string, code: string) {
  try {
    sessionStorage.setItem(attemptKey(problemId), JSON.stringify({ code }))
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
  const [code, setCode] = useState(() => loadAttempt(problem))
  const [tab, setTab] = useState<'samples' | 'console'>('samples')
  const [outcomes, setOutcomes] = useState<SampleOutcome[]>([])
  const [checking, setChecking] = useState(false)
  const timeLimitMs = problem.timeLimitMs ?? RUN_DEFAULTS.timeLimitMs
  const session = useRunSession({ timeLimitMs })
  const editor = useRef<EditorHandle>(null)
  const consoleBusy = session.phase === 'running' || session.phase === 'waiting'
  const busy = checking || consoleBusy

  useEffect(() => saveAttempt(problem.id, code), [problem.id, code])

  const { start } = session
  const onRun = useCallback(() => {
    if (busy) return
    setTab('console')
    start(code)
  }, [busy, start, code])

  const onRunSamples = useCallback(async () => {
    if (busy) return
    setTab('samples')
    setChecking(true)
    setOutcomes([])
    try {
      const results = await runSamples(getRunner(), code, problem.sampleTests, {
        timeLimitMs,
        maxOutputChars: RUN_DEFAULTS.maxOutputChars,
        compareMode: problem.compareMode,
        onOutcome: (o) => setOutcomes((prev) => [...prev, o]),
      })
      onSamplesChecked?.(allPassed(results))
    } finally {
      setChecking(false)
    }
  }, [busy, code, problem.sampleTests, problem.compareMode, timeLimitMs, onSamplesChecked])

  const stop = () => (checking ? getRunner().stop() : session.stop())
  const resetCode = () => setCode(problem.starterCode ?? '')
  const examples = problem.sampleTests.map((t, i) => ({ label: t.name ?? `Sample ${i + 1}`, text: t.input }))

  return (
    <section aria-label="Code editor" className="min-w-0 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="run" onClick={() => void onRunSamples()} disabled={busy} className="h-10 px-4">
          <ListChecks aria-hidden /> Run samples
        </Button>
        <Button onClick={onRun} disabled={busy} variant="secondary" className="h-10 px-4">
          <Play aria-hidden /> Run
        </Button>
        <Button onClick={stop} disabled={!busy} variant="outline" className="size-10 px-0 sm:w-auto sm:px-4" aria-label="Stop">
          <Square aria-hidden className="size-3.5 fill-current" />
          <span aria-hidden className="hidden sm:inline">Stop</span>
        </Button>
        <Button onClick={resetCode} disabled={busy} variant="ghost" className="ml-auto size-10 px-0 text-muted-foreground sm:w-auto sm:px-3" aria-label="Reset code" title="Reset code">
          <RotateCcw aria-hidden />
          <span aria-hidden className="hidden sm:inline">Reset code</span>
        </Button>
      </div>

      <div className="flex h-[min(62dvh,26rem)] flex-col overflow-hidden rounded-xl border">
        <div className="min-h-0 flex-1">
          <CodeEditor
            label={`Your solution for ${problem.title}`}
            value={code}
            onChange={setCode}
            onRun={() => void onRunSamples()}
            onFocus={session.warmUp}
            editorRef={editor}
            className="h-full"
          />
        </div>
        <KeyBar editor={editor} className="md:hidden" />
      </div>
      <p className="text-xs text-muted-foreground">
        <span className="hidden md:inline">Ctrl/⌘ + Enter runs the samples. </span>
        Time limit {timeLimitMs / 1000} s. Python in the browser is slower than on a judge.
      </p>

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'samples' | 'console')}>
        <TabsList className="group-data-horizontal/tabs:h-10">
          <TabsTrigger value="samples" className="px-3">Sample results</TabsTrigger>
          <TabsTrigger value="console" className="px-3">Console</TabsTrigger>
        </TabsList>
        <TabsContent value="samples" className="pt-3">
          <SampleResults outcomes={outcomes} total={problem.sampleTests.length} running={checking} />
        </TabsContent>
        <TabsContent value="console" forceMount className="pt-3 data-[state=inactive]:hidden">
          <RunConsole
            session={session}
            examples={examples}
            bodyClassName="max-h-80"
            placeholder="Run your code here and type the input yourself, or pick a sample's input when it asks."
          />
        </TabsContent>
      </Tabs>

      <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200">
        Passing samples ≠ accepted by the judge. A real judge also runs hidden tests that are bigger and trickier.
      </p>
    </section>
  )
}
