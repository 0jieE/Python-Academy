import { Keyboard, Square, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { RunConsole } from './RunConsole'
import { useRunSession } from './useRunSession'

export interface InlineRunProps {
  code: string
  /** Example input: fed first, then end of input. Without it the program asks interactively. */
  stdin?: string
  /** Changes on every Run press (re-runs). */
  token: number
  onClose: () => void
}

/** The console under a lesson code block (lazy chunk: only loads after Run). */
export default function InlineRun({ code, stdin, token, onClose }: InlineRunProps) {
  const session = useRunSession()
  const { start } = session
  const started = useRef(0)

  useEffect(() => {
    if (started.current === token) return
    started.current = token
    start(code, stdin ? { stdin, eof: true } : {})
  }, [token, code, stdin, start])

  const busy = session.phase === 'running' || session.phase === 'waiting'
  return (
    <RunConsole
      session={session}
      examples={stdin ? [{ label: 'Example input', text: stdin }] : undefined}
      bodyClassName="max-h-80"
      footer={
        stdin && (
          <Button variant="ghost" className="h-10 px-3" onClick={() => start(code)}>
            <Keyboard aria-hidden /> Type my own input
          </Button>
        )
      }
      actions={
        <>
          {busy && (
            <Button variant="ghost" className="h-10 px-3" onClick={session.stop}>
              <Square aria-hidden className="size-3.5 fill-current" /> Stop
            </Button>
          )}
          <Button variant="ghost" size="icon" className="size-10" aria-label="Close output" onClick={onClose}>
            <X className="size-4.5" />
          </Button>
        </>
      }
    />
  )
}
