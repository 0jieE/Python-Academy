import { Check, ChevronDown, Copy, FilePlus, Play, Square } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { Button } from '@/components/ui/button'
import { KeyBar } from '@/features/editor/KeyBar'
import type { EditorHandle } from '@/features/editor/types'
import { cn } from '@/lib/utils'
import { CodeEditor } from './CodeEditor'
import { RunConsole } from './RunConsole'
import { decodePlaygroundHash } from './urlState'
import { useRunSession } from './useRunSession'

interface IdeState {
  code: string
  /** Input that came with "Open in IDE" (offered in the input sheet). */
  example: string
}

const STORAGE_KEY = 'pyacademy:ide'
const OLD_SESSION_KEY = 'pyacademy:playground'
const DEFAULT_STATE: IdeState = {
  code: 'name = input("What is your name? ")\nprint(f"Hello, {name}!")\n',
  example: '',
}

function parse(raw: string | null): IdeState | null {
  if (!raw) return null
  const s = JSON.parse(raw) as { code?: unknown; example?: unknown; stdin?: unknown }
  if (typeof s.code !== 'string') return null
  const example = typeof s.example === 'string' ? s.example : typeof s.stdin === 'string' ? s.stdin : ''
  return { code: s.code, example }
}

function loadSaved(): IdeState {
  try {
    return parse(localStorage.getItem(STORAGE_KEY)) ?? parse(sessionStorage.getItem(OLD_SESSION_KEY)) ?? DEFAULT_STATE
  } catch {
    return DEFAULT_STATE // storage blocked or corrupt → start fresh
  }
}

function save(state: IdeState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage blocked: the code lives until the tab closes.
  }
}

/** The pocket IDE: editor + console. Input is asked for while the program runs. */
export function Playground() {
  const location = useLocation()
  const navigate = useNavigate()
  // Code from an "Open in IDE" link (URL hash) wins over the saved file.
  const [state, setState] = useState<IdeState>(() => {
    const fromUrl = decodePlaygroundHash(location.hash)
    return fromUrl.code !== undefined ? { code: fromUrl.code, example: fromUrl.stdin ?? '' } : loadSaved()
  })
  const session = useRunSession()
  const editor = useRef<EditorHandle>(null)
  const [consoleOpen, setConsoleOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => save(state), [state])
  useEffect(() => {
    if (location.hash) navigate({ pathname: location.pathname, hash: '' }, { replace: true })
  }, [location.hash, location.pathname, navigate])

  const busy = session.phase === 'running' || session.phase === 'waiting'
  const { start, stop } = session
  const onRun = useCallback(() => {
    setConsoleOpen(true)
    start(state.code)
  }, [start, state.code])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(state.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard blocked: nothing to do.
    }
  }

  const runButton = (className: string) => (
    <Button onClick={busy ? stop : onRun} variant={busy ? 'outline' : 'run'} className={cn('run-button', className)}>
      {busy ? <Square aria-hidden className="size-3.5 fill-current" /> : <Play aria-hidden />}
      {busy ? 'Stop' : 'Run'}
    </Button>
  )

  return (
    <div className="ide">
      <section aria-label="Code" className="ide-code">
        <div className="ide-toolbar">
          <h1 className="text-base font-semibold">IDE</h1>
          <span className="font-mono text-sm text-muted-foreground">main.py</span>
          <div className="ml-auto flex items-center">
            <Button variant="ghost" size="icon" className="size-10" aria-label="New file (clears the code; Undo brings it back)" title="New file" onClick={() => setState((s) => ({ ...s, code: '' }))}>
              <FilePlus className="size-5" />
            </Button>
            <Button variant="ghost" size="icon" className="size-10" aria-label={copied ? 'Copied' : 'Copy code'} title="Copy code" onClick={() => void copy()}>
              {copied ? <Check className="size-5" /> : <Copy className="size-5" />}
            </Button>
            <div className="md:hidden">
              <ThemeToggle />
            </div>
            {runButton('ml-2 hidden h-10 px-4 md:inline-flex')}
          </div>
        </div>
        <div className="ide-editor">
          <CodeEditor
            label="Python code"
            value={state.code}
            onChange={(code) => setState((s) => ({ ...s, code }))}
            onRun={onRun}
            onFocus={session.warmUp}
            editorRef={editor}
            className="h-full"
          />
        </div>
        <KeyBar editor={editor} className="md:hidden">
          {runButton('h-10 shrink-0 px-4')}
        </KeyBar>
      </section>

      <RunConsole
        session={session}
        examples={state.example ? [{ label: 'Example input', text: state.example }] : undefined}
        className={cn('ide-console', consoleOpen && 'is-open')}
        placeholder="Output appears here. When your program calls input(), you'll be asked to type it."
        actions={
          <Button
            variant="ghost"
            size="icon"
            className="console-toggle size-10 md:hidden"
            aria-label={consoleOpen ? 'Collapse console' : 'Expand console'}
            aria-expanded={consoleOpen}
            onClick={() => setConsoleOpen((o) => !o)}
          >
            <ChevronDown className={cn('size-5 transition-transform motion-reduce:transition-none', !consoleOpen && 'rotate-180')} />
          </Button>
        }
      />
    </div>
  )
}
