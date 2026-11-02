import { useCallback, useRef, useState, useSyncExternalStore } from 'react'
import type { RunResult } from '@/types/runner'
import { RUN_DEFAULTS } from './config'
import { appendChunk, inputLinesRead, replayView, toInputLines, type ConsoleLog } from './consoleLog'
import { normalizeStdin } from './runnerUtils'
import { getRunner } from './useRunner'

/**
 * idle → running → (waiting ⇄ running)* → done
 * "waiting": the program asked for input; send() / endInput() continue it.
 */
export type SessionPhase = 'idle' | 'running' | 'waiting' | 'done'

interface Job {
  code: string
  stdin: string
  eof: boolean
  seed: number
}

interface SessionState {
  log: ConsoleLog
  phase: SessionPhase
  result: RunResult | null
  /** A replay after send()/endInput() is running (the input sheet stays open). */
  continuing: boolean
  /** Counts start() calls: a new run, as opposed to a continuation. */
  runCount: number
}

const initial: SessionState = { log: [], phase: 'idle', result: null, continuing: false, runCount: 0 }

/**
 * One console: run a program interactively. When it reads more input than was
 * typed, the phase becomes 'waiting'; the input sheet calls send(), and the
 * program is replayed from the start with the longer stdin (see RunRequest.interactive).
 */
export function useRunSession({ timeLimitMs = RUN_DEFAULTS.timeLimitMs }: { timeLimitMs?: number } = {}) {
  const runner = getRunner()
  const status = useSyncExternalStore(
    useCallback((listener: () => void) => runner.subscribe(listener), [runner]),
    () => runner.status,
  )
  const [state, setState] = useState<SessionState>(initial)
  const logRef = useRef<ConsoleLog>([])
  const job = useRef<Job | null>(null)
  const seq = useRef(0)

  const execute = useCallback(
    async (pendingInput: string, replay: boolean) => {
      const j = job.current
      if (!j) return
      const id = ++seq.current
      const previous = logRef.current
      const linesBefore = inputLinesRead(previous)
      let live: ConsoleLog = []
      const show = (log: ConsoleLog) => {
        if (seq.current !== id) return
        logRef.current = log
        setState((s) => ({ ...s, log }))
      }
      const add = (kind: 'out' | 'err' | 'in') => (text: string) => {
        live = appendChunk(live, kind, text)
        show(replay ? replayView(previous, pendingInput, live, linesBefore) : live)
      }

      setState((s) => ({ ...s, phase: 'running', result: null, continuing: replay }))
      show(replay ? appendChunk(previous, 'in', pendingInput) : [])
      const result = await runner.run(
        { code: j.code, stdin: j.stdin, timeLimitMs, maxOutputChars: RUN_DEFAULTS.maxOutputChars, interactive: { eof: j.eof, seed: j.seed } },
        { onStdout: add('out'), onStderr: add('err'), onStdin: add('in') },
      )
      if (seq.current !== id) return
      // Load failures arrive only in the result (nothing was streamed).
      if (!live.length && result.stderr) live = appendChunk(live, 'err', result.stderr)
      show(live)
      setState((s) => ({ ...s, phase: result.status === 'needs-input' ? 'waiting' : 'done', result, continuing: false }))
    },
    [runner, timeLimitMs],
  )

  /** Run `code` from the start. `stdin` is fed first; `eof` ends the input after it (no prompts). */
  const start = useCallback(
    (code: string, { stdin = '', eof = false }: { stdin?: string; eof?: boolean } = {}) => {
      // Fed input ends with a newline, so its echo doesn't run into the next output.
      const fed = normalizeStdin(stdin)
      job.current = { code, stdin: fed && !fed.endsWith('\n') ? fed + '\n' : fed, eof, seed: Math.floor(Math.random() * 2 ** 31) }
      setState((s) => ({ ...s, runCount: s.runCount + 1 }))
      void execute('', false)
    },
    [execute],
  )

  /** Answer the prompt with a line (or several pasted lines). */
  const send = useCallback(
    (typed: string) => {
      if (!job.current) return
      const lines = toInputLines(typed).join('')
      job.current.stdin += lines
      void execute(lines, true)
    },
    [execute],
  )

  /** End of input (Ctrl+D): the next read gets EOF. */
  const endInput = useCallback(() => {
    if (!job.current) return
    job.current.eof = true
    void execute('', true)
  }, [execute])

  const stop = useCallback(() => {
    if (state.phase === 'running') {
      runner.stop()
      return
    }
    if (state.phase === 'waiting') {
      seq.current++
      setState((s) => ({ ...s, phase: 'done', continuing: false, result: s.result && { ...s.result, status: 'stopped' } }))
    }
  }, [runner, state.phase])

  const clear = useCallback(() => {
    seq.current++
    job.current = null
    logRef.current = []
    setState((s) => ({ ...initial, runCount: s.runCount }))
  }, [])

  return {
    ...state,
    status,
    loadError: runner.loadError,
    pythonVersion: runner.pythonVersion,
    start,
    send,
    endInput,
    stop,
    clear,
    warmUp: useCallback(() => void runner.warmUp().catch(() => {}), [runner]),
  }
}

export type RunSession = ReturnType<typeof useRunSession>
