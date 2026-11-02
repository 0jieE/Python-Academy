/**
 * CodeRunner backed by a Web Worker running Pyodide.
 *
 * Design:
 *  - The worker is created lazily on the first warmUp()/run().
 *  - One run at a time. Each run gets a runId; messages from old runIds are ignored.
 *  - Timeout: setTimeout(timeLimitMs) on the UI side → worker.terminate(),
 *    resolve { status: 'timeout' }, then respawn the worker in the background.
 *  - stop(): same as timeout but status 'stopped'. (Pyodide's interrupt buffer
 *    needs SharedArrayBuffer + COOP/COEP headers — deferred, see PLAN §1.)
 *  - Respawn cost: Pyodide re-init from HTTP cache is usually 1–3 s; status
 *    'loading' tells students why the next run waits.
 */
import type { CodeRunner, FromWorker, RunCallbacks, RunRequest, RunResult, RunnerStatus } from '@/types/runner'
import { PYODIDE_INDEX_URL } from './config'

interface ActiveRun {
  runId: string
  callbacks?: RunCallbacks
  resolve: (result: RunResult) => void
  timer: ReturnType<typeof setTimeout>
  startedAt: number
  stdout: string
  stderr: string
}

export class PyodideRunner implements CodeRunner {
  status: RunnerStatus = 'idle'
  /** Python version once loaded, e.g. "3.14.2". */
  pythonVersion: string | null = null
  /** Last load failure (CDN blocked, offline…), shown to the student. */
  loadError: string | null = null

  private worker: Worker | null = null
  private ready: Promise<void> | null = null
  private current: ActiveRun | null = null
  private nextRunId = 0
  private listeners = new Set<(status: RunnerStatus) => void>()
  private readonly indexURL: string

  constructor(indexURL: string = PYODIDE_INDEX_URL) {
    this.indexURL = indexURL
  }

  /** Subscribe to status changes (including background respawns). */
  subscribe(listener: (status: RunnerStatus) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  warmUp(): Promise<void> {
    return this.ready ?? this.spawn()
  }

  async run(request: RunRequest, callbacks?: RunCallbacks): Promise<RunResult> {
    if (this.current) this.abort('stopped')
    try {
      await this.warmUp()
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return { status: 'error', stdout: '', stderr: `${message}\n\nCheck your connection, or ask your coach whether the school network blocks cdn.jsdelivr.net.`, durationMs: 0, truncated: false }
    }
    const worker = this.worker
    if (!worker) return { status: 'error', stdout: '', stderr: 'Python is not available.', durationMs: 0, truncated: false }

    const runId = String(++this.nextRunId)
    return new Promise<RunResult>((resolve) => {
      this.current = {
        runId,
        callbacks,
        resolve,
        startedAt: performance.now(),
        stdout: '',
        stderr: '',
        timer: setTimeout(() => this.abort('timeout'), request.timeLimitMs),
      }
      this.setStatus('running')
      worker.postMessage({ type: 'run', runId, request })
    })
  }

  stop(): void {
    this.abort('stopped')
  }

  dispose(): void {
    this.abort('stopped', false)
    this.worker?.terminate()
    this.worker = null
    this.ready = null
    this.listeners.clear()
  }

  private setStatus(status: RunnerStatus) {
    this.status = status
    this.current?.callbacks?.onStatus?.(status)
    this.listeners.forEach((l) => l(status))
  }

  private spawn(): Promise<void> {
    this.loadError = null
    this.setStatus('loading')
    const worker = new Worker(new URL('../../workers/python.worker.ts', import.meta.url), { type: 'module', name: 'python' })
    this.worker = worker
    const ready = new Promise<void>((resolve, reject) => {
      worker.onmessage = (event: MessageEvent<FromWorker>) => this.onMessage(worker, event.data, resolve, reject)
      worker.onerror = (event) => {
        event.preventDefault()
        reject(new Error(`The Python worker failed to start${event.message ? `: ${event.message}` : ''}.`))
      }
      worker.postMessage({ type: 'init', indexURL: this.indexURL })
    })
    this.ready = ready
    ready.then(
      () => {
        if (this.worker === worker && !this.current) this.setStatus('ready')
      },
      (err: unknown) => {
        if (this.worker !== worker) return
        worker.terminate()
        this.worker = null
        this.ready = null // next warmUp()/run() retries
        this.loadError = err instanceof Error ? err.message : String(err)
        this.setStatus('error')
      },
    )
    return ready
  }

  private onMessage(worker: Worker, msg: FromWorker, resolveReady: () => void, rejectReady: (e: Error) => void) {
    if (worker !== this.worker) return
    switch (msg.type) {
      case 'ready':
        this.pythonVersion = msg.pythonVersion
        resolveReady()
        return
      case 'init-error':
        rejectReady(new Error(msg.message))
        return
    }
    const run = this.current
    if (!run || msg.runId !== run.runId) return
    if (msg.type === 'stdout') {
      run.stdout += msg.chunk
      run.callbacks?.onStdout?.(msg.chunk)
    } else if (msg.type === 'stderr') {
      run.stderr += msg.chunk
      run.callbacks?.onStderr?.(msg.chunk)
    } else if (msg.type === 'done') {
      clearTimeout(run.timer)
      this.current = null
      run.resolve({ ...msg.result, stdout: run.stdout, stderr: run.stderr })
      this.setStatus(msg.result.status)
      if (msg.fatal) this.restart()
    }
  }

  private abort(status: 'stopped' | 'timeout', respawn = true) {
    const run = this.current
    if (!run) return
    clearTimeout(run.timer)
    this.current = null
    run.resolve({
      status,
      stdout: run.stdout,
      stderr: run.stderr,
      durationMs: Math.round(performance.now() - run.startedAt),
      truncated: false,
    })
    this.setStatus(status)
    if (respawn) this.restart()
  }

  /** Kill the worker (it may be stuck in a loop) and load a fresh one in the background. */
  private restart() {
    this.worker?.terminate()
    this.worker = null
    this.ready = null
    this.spawn().catch(() => {
      // Reported through status 'error' + loadError.
    })
  }
}
