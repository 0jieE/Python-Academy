/**
 * TICKET T9 — CodeRunner backed by a Web Worker running Pyodide.
 *
 * Design (keep this when implementing):
 *  - Create the worker lazily on first warmUp()/run():
 *      new Worker(new URL('../../workers/python.worker.ts', import.meta.url), { type: 'module' })
 *  - One run at a time. Each run gets a runId; ignore messages from old runIds.
 *  - Timeout: setTimeout(timeLimitMs) on the UI side → worker.terminate(),
 *    resolve { status: 'timeout' }, then respawn the worker in the background.
 *  - stop(): same as timeout but status 'stopped'. (Pyodide's interrupt buffer
 *    needs SharedArrayBuffer + COOP/COEP headers — deferred, see PLAN §1.)
 *  - Respawn cost: Pyodide re-init from HTTP cache is usually 1–3 s; show
 *    status 'loading' so students understand the pause.
 */
import type { CodeRunner, RunCallbacks, RunRequest, RunResult, RunnerStatus } from '@/types/runner'

export class PyodideRunner implements CodeRunner {
  status: RunnerStatus = 'idle'

  async warmUp(): Promise<void> {
    throw new Error('PyodideRunner.warmUp not implemented (T9)')
  }

  async run(_request: RunRequest, _callbacks?: RunCallbacks): Promise<RunResult> {
    throw new Error('PyodideRunner.run not implemented (T9)')
  }

  stop(): void {}

  dispose(): void {}
}
