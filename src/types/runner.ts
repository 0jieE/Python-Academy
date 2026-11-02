/**
 * Message protocol between the UI thread and `src/workers/python.worker.ts`,
 * plus the `CodeRunner` abstraction the UI talks to.
 *
 * The UI never imports Pyodide directly. A future backend judge can implement
 * `CodeRunner` (RemoteRunner) without touching the playground UI.
 */

export type RunnerStatus =
  | 'idle' // worker not created yet
  | 'loading' // downloading / initializing Pyodide
  | 'ready'
  | 'running'
  | 'finished'
  | 'error' // Python raised, or runtime failed to load
  | 'stopped' // user pressed Stop
  | 'timeout' // time limit hit; worker was terminated
  | 'needs-input' // interactive run read past the input typed so far

export interface RunRequest {
  code: string
  /** Entire stdin, supplied up front (competition style). input() reads line by line. */
  stdin: string
  timeLimitMs: number
  /** Cap on captured stdout+stderr characters, to protect the UI. */
  maxOutputChars: number
  /**
   * Console mode. When the program reads past the end of `stdin` and `eof` is
   * false, the run ends early with status 'needs-input' (no EOFError). The UI
   * asks for a line and runs the program again from the start with the longer
   * stdin ("replay" — works without SharedArrayBuffer / COOP+COEP).
   * `seed` seeds `random` so every replay makes the same choices.
   */
  interactive?: { eof: boolean; seed: number }
}

export interface RunResult {
  status: Extract<RunnerStatus, 'finished' | 'error' | 'stopped' | 'timeout' | 'needs-input'>
  stdout: string
  stderr: string
  /** Wall-clock ms inside the worker (excludes Pyodide load). */
  durationMs: number
  /** True when output was cut at `maxOutputChars`. */
  truncated: boolean
}

// ---- Worker messages -------------------------------------------------------

export type ToWorker =
  | { type: 'init'; indexURL: string }
  | { type: 'run'; runId: string; request: RunRequest }

export type FromWorker =
  | { type: 'ready'; pythonVersion: string }
  | { type: 'init-error'; message: string }
  | { type: 'stdout'; runId: string; chunk: string }
  | { type: 'stderr'; runId: string; chunk: string }
  /** Interactive runs: a line of stdin the program just read, in order with the output chunks. */
  | { type: 'stdin'; runId: string; chunk: string }
  /**
   * Output already arrived as stdout/stderr chunks, so `result.stdout/stderr`
   * are empty here. `fatal`: the interpreter crashed — restart the worker.
   */
  | { type: 'done'; runId: string; result: RunResult; fatal?: boolean }

// ---- UI-facing abstraction -------------------------------------------------

export interface RunCallbacks {
  onStatus?: (status: RunnerStatus) => void
  onStdout?: (chunk: string) => void
  onStderr?: (chunk: string) => void
  /** Interactive runs only: input the program consumed (for echoing in a console). */
  onStdin?: (chunk: string) => void
}

export interface CodeRunner {
  readonly status: RunnerStatus
  /** Start loading the runtime early (e.g. when the editor gets focus). */
  warmUp(): Promise<void>
  run(request: RunRequest, callbacks?: RunCallbacks): Promise<RunResult>
  /** Terminate the current run. MVP strategy: terminate the worker and respawn. */
  stop(): void
  dispose(): void
}
