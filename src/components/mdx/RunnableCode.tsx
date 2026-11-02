import { Check, Copy, Play, SquareArrowOutUpRight } from 'lucide-react'
import { createContext, lazy, Suspense, useContext, useLayoutEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { playgroundUrl } from '@/features/playground/urlState'

// The runner (console, input sheet, Pyodide worker) loads only on the first Run.
const InlineRun = lazy(() => import('@/features/playground/InlineRun'))

/** Set inside a runnable block so its own <pre> isn't wrapped again. */
const InsideRunnable = createContext(false)

const readCode = (el: HTMLElement | null) => (el?.querySelector('pre')?.textContent ?? '').replace(/\n+$/, '') + '\n'

export interface RunnableCodeProps {
  children: ReactNode
  /** Examples get a header with a title; plain code blocks get a slim bar underneath. */
  title?: string
  /** Example input: fed to the program (then end of input). */
  stdin?: string
  /** False for fragments that aren't whole programs: Copy and Edit in IDE only. */
  runnable?: boolean
}

/**
 * A build-time highlighted code block that runs right where it is: Run opens a
 * console under the code; input() pops up the input sheet. Nothing heavy loads
 * until Run is pressed.
 */
export function RunnableCode({ children, title, stdin, runnable = true }: RunnableCodeProps) {
  const codeRef = useRef<HTMLDivElement>(null)
  const [code, setCode] = useState('')
  const [runs, setRuns] = useState(0)
  const [copied, setCopied] = useState(false)

  // The raw code is the text of the highlighted <pre>; read it after render.
  useLayoutEffect(() => setCode(readCode(codeRef.current)), [children])

  const run = () => {
    setCode(readCode(codeRef.current))
    setRuns((n) => n + 1)
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard blocked.
    }
  }

  const runButton = (
    <Button variant="run" onClick={run} className="h-10 px-4">
      <Play aria-hidden /> Run
    </Button>
  )
  const editLink = (
    <Button asChild variant="ghost" size="icon" className="size-10" aria-label="Edit in IDE" title="Edit in IDE">
      <Link to={playgroundUrl({ code, stdin })}>
        <SquareArrowOutUpRight className="size-4.5" />
      </Link>
    </Button>
  )

  return (
    <div className="code-run not-prose">
      {title !== undefined && (
        <div className="code-run-bar code-run-head">
          <span className="min-w-0 flex-1 truncate pl-2 text-sm font-medium">{title}</span>
          {editLink}
          {runnable && runButton}
        </div>
      )}
      <InsideRunnable value={true}>
        <div ref={codeRef}>{children}</div>
      </InsideRunnable>
      {stdin && (
        <div className="code-run-input text-sm">
          <p className="text-xs font-medium text-muted-foreground">Example input</p>
          <pre className="overflow-x-auto font-mono">{stdin.replace(/\n$/, '')}</pre>
        </div>
      )}
      {title === undefined && (
        <div className="code-run-bar">
          <Button variant="ghost" size="icon" className="size-10" aria-label={copied ? 'Copied' : 'Copy code'} title="Copy code" onClick={() => void copy()}>
            {copied ? <Check className="size-4.5" /> : <Copy className="size-4.5" />}
          </Button>
          {editLink}
          <span className="flex-1" />
          {runnable && runButton}
        </div>
      )}
      {runs > 0 && (
        <Suspense fallback={<ConsoleLoading />}>
          <InlineRun code={code} stdin={stdin} token={runs} onClose={() => setRuns(0)} />
        </Suspense>
      )}
    </div>
  )
}

function ConsoleLoading() {
  return (
    <div className="console">
      <p role="status" className="console-bar">
        Loading the console…
      </p>
    </div>
  )
}

/** MDX `pre`: Python blocks become runnable (unless marked `norun`); other languages stay as they are. */
export function CodeBlock({ 'data-norun': norun, ...props }: ComponentProps<'pre'> & { 'data-language'?: string; 'data-norun'?: string }) {
  const inside = useContext(InsideRunnable)
  if (inside || props['data-language'] !== 'python') return <pre {...props} />
  return (
    <RunnableCode runnable={norun === undefined}>
      <pre {...props} />
    </RunnableCode>
  )
}
