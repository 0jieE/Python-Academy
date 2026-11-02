import { Play, Square } from 'lucide-react'
import { useCallback, useEffect, useId, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { CodeEditor } from './CodeEditor'
import { OutputPanel } from './OutputPanel'
import { decodePlaygroundHash, type PlaygroundState } from './urlState'
import { useRunner } from './useRunner'

const STORAGE_KEY = 'pyacademy:playground'
const DEFAULT_STATE: PlaygroundState = {
  code: '# Read two numbers from one line and print their sum\na, b = map(int, input().split())\nprint(a + b)\n',
  stdin: '3 4\n',
}

function loadSaved(): PlaygroundState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) {
      const s = JSON.parse(raw) as Partial<PlaygroundState>
      if (typeof s.code === 'string' && typeof s.stdin === 'string') return { code: s.code, stdin: s.stdin }
    }
  } catch {
    // Storage blocked or corrupt → start fresh.
  }
  return DEFAULT_STATE
}

function save(state: PlaygroundState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage blocked: work is kept only until the tab closes.
  }
}

export function Playground() {
  const location = useLocation()
  const navigate = useNavigate()
  // Code from an "Open in Playground" link (URL hash) wins over the saved session.
  const [state, setState] = useState<PlaygroundState>(() => {
    const fromUrl = decodePlaygroundHash(location.hash)
    return fromUrl.code !== undefined ? { code: fromUrl.code, stdin: fromUrl.stdin ?? '' } : loadSaved()
  })
  const { status, stdout, stderr, result, run, stop, warmUp, loadError } = useRunner()
  const stdinId = useId()

  // Save every edit so a refresh keeps the work; drop the (possibly long) hash once imported.
  useEffect(() => save(state), [state])
  useEffect(() => {
    if (location.hash) navigate({ pathname: location.pathname, hash: '' }, { replace: true })
  }, [location.hash, location.pathname, navigate])

  const running = status === 'running'
  const onRun = useCallback(() => {
    if (!running) void run(state.code, state.stdin)
  }, [running, run, state.code, state.stdin])

  const runOnCtrlEnter = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      onRun()
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section aria-label="Code" className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">Code</h2>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground sm:inline">Ctrl/⌘ + Enter</span>
            <Button onClick={onRun} disabled={running} className="h-10 px-4">
              <Play aria-hidden /> Run
            </Button>
            <Button onClick={stop} disabled={!running} variant="outline" className="h-10 px-4">
              <Square aria-hidden /> Stop
            </Button>
          </div>
        </div>
        <CodeEditor
          label="Python code"
          value={state.code}
          onChange={(code) => setState((s) => ({ ...s, code }))}
          onRun={onRun}
          onFocus={warmUp}
        />
      </section>

      <div className="min-w-0 space-y-4">
        <div className="space-y-2">
          <label htmlFor={stdinId} className="font-semibold">
            Input (stdin)
          </label>
          <p className="text-xs text-muted-foreground">Type all input before pressing Run — like a contest judge, the program reads it from here.</p>
          <textarea
            id={stdinId}
            value={state.stdin}
            onChange={(e) => setState((s) => ({ ...s, stdin: e.target.value }))}
            onFocus={warmUp}
            onKeyDown={runOnCtrlEnter}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            wrap="off"
            rows={5}
            className="block w-full resize-y rounded-lg border bg-background p-3 font-mono text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:text-sm"
          />
        </div>
        <OutputPanel status={status} stdout={stdout} stderr={stderr} result={result} loadError={loadError} />
      </div>
    </div>
  )
}
