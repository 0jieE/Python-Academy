import { Keyboard } from 'lucide-react'
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { RUN_DEFAULTS } from './config'
import { currentPrompt } from './consoleLog'
import { describeRun } from './describeRun'
import { InputSheet, type InputExample } from './InputSheet'
import type { RunSession } from './useRunSession'

type Tone = 'idle' | 'busy' | 'waiting' | 'ok' | 'bad'

function toneOf(session: RunSession): Tone {
  if (session.phase === 'running' || session.status === 'loading') return 'busy'
  if (session.phase === 'waiting') return 'waiting'
  const s = session.result?.status
  if (s === 'finished') return 'ok'
  if (s === 'error' || s === 'timeout') return 'bad'
  return 'idle'
}

export interface RunConsoleProps {
  session: RunSession
  /** Buttons on the right of the console header. */
  actions?: ReactNode
  /** Suggested input for the sheet (e.g. a lesson's example or a problem's samples). */
  examples?: InputExample[]
  className?: string
  /** Size of the scrolling output area. */
  bodyClassName?: string
  /** Shown in an empty console before the first run. */
  placeholder?: ReactNode
  /** Row under the output once a run has ended (e.g. "Type my own input"). */
  footer?: ReactNode
}

/**
 * A terminal-style console: program output, errors in red, and the student's
 * input highlighted where the program read it. Owns the input sheet.
 */
export function RunConsole({ session, actions, examples, className, bodyClassName, placeholder, footer }: RunConsoleProps) {
  const { log, phase, result, status, loadError, continuing, runCount } = session
  const body = useRef<HTMLPreElement>(null)
  const stick = useRef(true)
  // Closing the sheet hides it for this run only; the next run asks again.
  const [dismissedRun, setDismissedRun] = useState(-1)
  const dismissed = dismissedRun === runCount
  const setDismissed = (value: boolean) => setDismissedRun(value ? runCount : -1)
  const tone = toneOf(session)

  // Follow the output while the student is at the bottom.
  useLayoutEffect(() => {
    const el = body.current
    if (el && stick.current) el.scrollTop = el.scrollHeight
  }, [log, phase])

  const message = phase === 'idle' && status !== 'loading' ? 'Press Run to start' : describeRun(status, result, loadError)
  const empty = log.length === 0

  return (
    <section aria-label="Output" data-tone={tone} className={cn('console', className)}>
      <div className="console-bar">
        <span aria-hidden className="console-dot" />
        <p role="status" aria-live="polite" className="min-w-0 flex-1 truncate">
          {message}
        </p>
        {actions}
      </div>
      <pre
        ref={body}
        role="region"
        aria-label="Program output"
        tabIndex={0}
        onScroll={(e) => {
          const el = e.currentTarget
          stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 32
        }}
        className={cn('console-body', bodyClassName)}
      >
        {log.map((chunk, i) =>
          chunk.kind === 'in' ? (
            <mark key={i} className="console-in">
              {chunk.text}
            </mark>
          ) : (
            <span key={i} className={chunk.kind === 'err' ? 'console-err' : undefined}>
              {chunk.text}
            </span>
          ),
        )}
        {phase === 'waiting' && <span aria-hidden className="console-caret" />}
        {empty && phase === 'done' && result?.status === 'finished' && <span className="console-muted">(no output)</span>}
        {empty && phase === 'idle' && placeholder && <span className="console-muted">{placeholder}</span>}
      </pre>
      {result?.truncated && <p className="console-note">Output was cut at {RUN_DEFAULTS.maxOutputChars.toLocaleString()} characters.</p>}
      {phase === 'done' && footer && <div className="console-note flex items-center gap-2 py-1 pl-1.5">{footer}</div>}
      {phase === 'waiting' && dismissed && (
        <div className="console-note flex items-center gap-2">
          <Button onClick={() => setDismissed(false)} className="console-input-btn h-10 px-4">
            <Keyboard aria-hidden /> Type input
          </Button>
          <Button variant="ghost" onClick={session.stop} className="h-10 px-3 text-inherit hover:bg-white/10 hover:text-inherit">
            Stop
          </Button>
        </div>
      )}

      <InputSheet
        open={(phase === 'waiting' || continuing) && !dismissed}
        onOpenChange={(open) => setDismissed(!open)}
        prompt={currentPrompt(log)}
        busy={continuing}
        examples={examples}
        onSend={session.send}
        onEndInput={session.endInput}
        onStop={() => {
          session.stop()
          setDismissed(true)
        }}
      />
    </section>
  )
}
