/// <reference lib="webworker" />
/**
 * TICKET T9 — Python execution worker.
 *
 * Load Pyodide from the CDN (not bundled):
 *   const { loadPyodide } = await import(/* @vite-ignore *\/ `${indexURL}pyodide.mjs`)
 *   pyodide = await loadPyodide({ indexURL })
 *
 * stdin (competition style — all input is known before the run):
 *   const lines = request.stdin.replace(/\r\n?/g, '\n').split('\n'); let i = 0
 *   pyodide.setStdin({ stdin: () => (i < lines.length ? lines[i++] : undefined) })
 *   → input() returns each line; past the end Python raises EOFError, like a judge.
 *   → sys.stdin.read() also works through the same callback.
 *
 * stdout/stderr: pyodide.setStdout({ batched }) / setStderr({ batched }); post
 *   chunks to the UI, stop forwarding after maxOutputChars and set truncated.
 *
 * Per-run isolation: run user code in a fresh globals dict
 *   (pyodide.globals.get('dict')()) so variables don't leak between runs.
 *
 * Errors: catch PythonError, post its message as stderr; trim Pyodide's
 *   internal frames so the traceback starts at "File \"<exec>\"".
 */
import type { ToWorker } from '@/types/runner'

self.onmessage = (event: MessageEvent<ToWorker>) => {
  // Not implemented yet — see header comment.
  self.postMessage({ type: 'init-error', message: `python.worker: "${event.data.type}" not implemented (T9)` })
}
