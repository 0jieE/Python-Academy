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
 * - Console mode (`request.interactive`): stdin is served one line per read and
 *   each line is echoed as a 'stdin' message between the output chunks. Reading
 *   past the typed input (before the student ends it) stops the run with status
 *   'needs-input': later output is dropped and a same-thread KeyboardInterrupt
 *   ends programs that catch the EOFError and keep going. The UI then replays
 *   the program with one more line; `random` is seeded so replays match.
 * - stdout/stderr: raw byte writers (exact newlines), capped and batched by
 *   OutputLimiter before being posted.
 * - Each run gets fresh globals; tracebacks are trimmed to the student's file
 *   ("main.py") with source lines shown.
 */
import type { PyodideInterface } from 'pyodide'
import { createLineReader, createStdinReader, OutputLimiter, type StreamName } from '@/features/playground/runnerUtils'
import type { FromWorker, RunRequest, RunResult, ToWorker } from '@/types/runner'

declare const self: DedicatedWorkerGlobalScope

const HELPER = `
import builtins, linecache, sys, traceback

FILENAME = "main.py"

def run(code, seed=None):
    if seed is not None:
        import random
        random.seed(seed)
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
let runInPython: ((code: string, seed?: number) => string) | null = null
/** Same-thread interrupt flag (no SharedArrayBuffer needed): 2 = SIGINT → KeyboardInterrupt. */
const interrupt = new Int32Array(1)

const post = (message: FromWorker) => self.postMessage(message)

async function init(indexURL: string) {
  try {
    const { loadPyodide } = (await import(/* @vite-ignore */ `${indexURL}pyodide.mjs`)) as typeof import('pyodide')
    pyodide = await loadPyodide({ indexURL })
    const ns = pyodide.globals.get('dict')()
    pyodide.runPython(HELPER, { globals: ns })
    runInPython = ns.get('run')
    try {
      pyodide.setInterruptBuffer(interrupt)
    } catch {
      // Without it, a program that catches EOFError simply runs to its end.
    }
    const version = pyodide.runPython('import sys; sys.version.split()[0]') as string
    post({ type: 'ready', pythonVersion: version })
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err)
    post({ type: 'init-error', message: `Could not load Python from ${indexURL}: ${reason}` })
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
  let needsInput = false
  const { interactive } = request
  const read = interactive
    ? createLineReader(request.stdin, interactive.eof, {
        onLine: (chunk) => {
          limiter.flush() // output printed before this input() goes first
          post({ type: 'stdin', runId, chunk })
        },
        onExhausted: () => {
          needsInput = true
          limiter.close() // keep the prompt, drop the EOFError traceback
          interrupt[0] = 2
        },
      })
    : createStdinReader(request.stdin)
  pyodide.setStdin({ read, isatty: false })
  pyodide.setStdout(writer('stdout'))
  pyodide.setStderr(writer('stderr'))

  interrupt[0] = 0
  const start = performance.now()
  let status: RunResult['status'] = 'error'
  let fatal = false
  try {
    status = runInPython(request.code, interactive?.seed) === 'finished' ? 'finished' : 'error'
  } catch (err) {
    // The KeyboardInterrupt raised for needs-input may escape the helper; that
    // is expected. Anything else is a JS-level failure (e.g. WebAssembly stack
    // overflow from deep recursion): the interpreter may be unusable now, so
    // ask the UI to restart the worker.
    if (!needsInput) {
      fatal = true
      const reason = err instanceof Error ? err.message : String(err)
      limiter.write('stderr', `\nPython crashed: ${reason}\n(Very deep recursion is a common cause. Python will restart for the next run.)\n`)
    }
  }
  interrupt[0] = 0
  if (needsInput) status = 'needs-input'
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
