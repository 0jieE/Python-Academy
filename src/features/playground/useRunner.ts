import { useCallback, useRef, useState, useSyncExternalStore } from 'react'
import type { RunResult } from '@/types/runner'
import { RUN_DEFAULTS } from './config'
import { PyodideRunner } from './PyodideRunner'

// One runner for the whole app: Python stays loaded when moving between the
// playground and problem pages.
let shared: PyodideRunner | null = null
export function getRunner(): PyodideRunner {
  shared ??= new PyodideRunner()
  return shared
}

interface Output {
  stdout: string
  stderr: string
  result: RunResult | null
}

const empty: Output = { stdout: '', stderr: '', result: null }

/** Runner status + streamed output for one editor. */
export function useRunner() {
  const runner = getRunner()
  const status = useSyncExternalStore(
    useCallback((listener: () => void) => runner.subscribe(listener), [runner]),
    () => runner.status,
  )
  const [output, setOutput] = useState<Output>(empty)
  const seq = useRef(0)

  const run = useCallback(
    async (code: string, stdin: string, timeLimitMs: number = RUN_DEFAULTS.timeLimitMs) => {
      const id = ++seq.current
      const mine = (fn: (o: Output) => Output) => setOutput((o) => (seq.current === id ? fn(o) : o))
      setOutput(empty)
      const result = await runner.run(
        { code, stdin, timeLimitMs, maxOutputChars: RUN_DEFAULTS.maxOutputChars },
        {
          onStdout: (chunk) => mine((o) => ({ ...o, stdout: o.stdout + chunk })),
          onStderr: (chunk) => mine((o) => ({ ...o, stderr: o.stderr + chunk })),
        },
      )
      // Load failures arrive only in the result (nothing was streamed).
      mine(() => ({ stdout: result.stdout, stderr: result.stderr, result }))
      return result
    },
    [runner],
  )

  return {
    status,
    ...output,
    run,
    stop: useCallback(() => runner.stop(), [runner]),
    warmUp: useCallback(() => void runner.warmUp().catch(() => {}), [runner]),
    loadError: runner.loadError,
    pythonVersion: runner.pythonVersion,
  }
}
