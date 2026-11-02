import type { RunResult, RunnerStatus } from '@/types/runner'

/** One-line, human status for the run (announced via aria-live). */
export function describeRun(status: RunnerStatus, result: RunResult | null, loadError: string | null): string {
  if (status === 'running') return 'Running…'
  const restarting = status === 'loading' && result ? ' · Restarting Python…' : ''
  if (result) {
    switch (result.status) {
      case 'finished':
        return `Finished in ${result.durationMs} ms${restarting}`
      case 'error':
        return loadError ? 'Python could not start' : `Finished with an error (see below)${restarting}`
      case 'timeout':
        return `Time limit exceeded — stopped after ${(result.durationMs / 1000).toFixed(1)} s${restarting}`
      case 'stopped':
        return `Stopped${restarting}`
    }
  }
  if (status === 'loading') return 'Starting Python… (first time only, about 6 MB)'
  if (status === 'error' && loadError) return 'Python could not start'
  if (status === 'ready') return 'Python is ready'
  return 'Python loads when you first press Run.'
}
