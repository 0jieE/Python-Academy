/// <reference lib="webworker" />
/**
 * Python execution worker (Pyodide, loaded from the CDN — never bundled).
 *
 * Protocol: see `src/types/runner.ts`. One run at a time; the UI enforces
 * time limits and Stop by terminating this worker (no SharedArrayBuffer).
 *
 * - stdin: competition style, the whole text is known up front. Served through
 *   setStdin({ read }) so input() reads line by line, sys.stdin.read() gets
 *   everything, and reading past the end raises EOFError.
 * - stdout/stderr: raw byte writers (exact newlines), capped and batched by
 *   OutputLimiter before being posted.
 * - Each run gets fresh globals; tracebacks are trimmed to the student's file
 *   ("main.py") with source lines shown.
 */
import type { PyodideInterface } from 'pyodide'
import { createStdinReader, OutputLimiter, type StreamName } from '@/features/playground/runnerUtils'
import type { FromWorker, RunRequest, RunResult, ToWorker } from '@/types/runner'

declare const self: DedicatedWorkerGlobalScope

const HELPER = `
import builtins, linecache, sys, traceback

FILENAME = "main.py"

def run(code):
    linecache.cache[FILENAME] = (len(code), None, code.splitlines(True), FILENAME)
    g = {"__name__": "__main__", "__builtins__": builtins, "__file__": FILENAME}
    status = "finished"
    try:
        exec(compile(code, FILENAME, "exec"), g)
    except SystemExit as e:
        if e.code not in (None, 0):
            status = "error"
            if not isinstance(e.code, int):
                print(e.code, file=sys.stderr)
    except BaseException as e:
        status = "error"
        tb = e.__traceback__
        while tb is not None and tb.tb_frame.f_code.co_filename != FILENAME:
            tb = tb.tb_next
        traceback.print_exception(type(e), e, tb)
    finally:
        sys.stdout.flush()
        sys.stderr.flush()
        g.clear()
    return status
`

let pyodide: PyodideInterface | null = null
let runInPython: ((code: string) => string) | null = null

const post = (message: FromWorker) => self.postMessage(message)

async function init(indexURL: string) {
  try {
    const { loadPyodide } = (await import(/* @vite-ignore */ `${indexURL}pyodide.mjs`)) as typeof import('pyodide')
    pyodide = await loadPyodide({ indexURL })
    const ns = pyodide.globals.get('dict')()
    pyodide.runPython(HELPER, { globals: ns })
    runInPython = ns.get('run')
    const version = pyodide.runPython('import sys; sys.version.split()[0]') as string
    post({ type: 'ready', pythonVersion: version })
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err)
    post({ type: 'init-error', message: `Could not load Python from ${indexURL} — ${reason}` })
  }
}

function run(runId: string, request: RunRequest) {
  if (!pyodide || !runInPython) {
    post({ type: 'done', runId, result: { status: 'error', stdout: '', stderr: 'Python is not loaded.', durationMs: 0, truncated: false } })
    return
  }
  const limiter = new OutputLimiter(request.maxOutputChars, (stream: StreamName, chunk: string) => post({ type: stream, runId, chunk }))
  const writer = (stream: StreamName) => {
    const decoder = new TextDecoder()
    return {
      isatty: false,
      write: (buffer: Uint8Array) => {
        limiter.write(stream, decoder.decode(buffer, { stream: true }))
        return buffer.length
      },
    }
  }
  pyodide.setStdin({ read: createStdinReader(request.stdin), isatty: false })
  pyodide.setStdout(writer('stdout'))
  pyodide.setStderr(writer('stderr'))

  const start = performance.now()
  let status: RunResult['status'] = 'error'
  let fatal = false
  try {
    status = runInPython(request.code) === 'finished' ? 'finished' : 'error'
  } catch (err) {
    // A JS-level failure (e.g. WebAssembly stack overflow from deep recursion).
    // The interpreter may be unusable now, so ask the UI to restart the worker.
    fatal = true
    const reason = err instanceof Error ? err.message : String(err)
    limiter.write('stderr', `\nPython crashed: ${reason}\n(Very deep recursion is a common cause. Python will restart for the next run.)\n`)
  }
  limiter.flush()
  post({
    type: 'done',
    runId,
    fatal,
    result: { status, stdout: '', stderr: '', durationMs: Math.round(performance.now() - start), truncated: limiter.truncated },
  })
}

self.onmessage = (event: MessageEvent<ToWorker>) => {
  const msg = event.data
  if (msg.type === 'init') void init(msg.indexURL)
  else if (msg.type === 'run') run(msg.runId, msg.request)
}
