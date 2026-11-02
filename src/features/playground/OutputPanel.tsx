import { cn } from '@/lib/utils'
import type { RunResult, RunnerStatus } from '@/types/runner'
import { RUN_DEFAULTS } from './config'
import { describeRun } from './describeRun'

export function OutputPanel({
  status,
  stdout,
  stderr,
  result,
  loadError,
}: {
  status: RunnerStatus
  stdout: string
  stderr: string
  result: RunResult | null
  loadError: string | null
}) {
  const failed = result?.status === 'error' || result?.status === 'timeout'
  return (
    <section aria-label="Output" className="space-y-3">
      <p role="status" aria-live="polite" className={cn('text-sm font-medium', failed ? 'text-destructive' : 'text-muted-foreground')}>
        {describeRun(status, result, loadError)}
      </p>
      <div>
        <p className="mb-1 text-xs font-semibold text-muted-foreground">Output (stdout)</p>
        <pre aria-label="Program output" className="max-h-80 min-h-16 overflow-auto rounded-lg border bg-muted/40 p-3 font-mono text-sm">{stdout}</pre>
      </div>
      {(stderr || (!result && loadError)) && (
        <div>
          <p className="mb-1 text-xs font-semibold text-destructive">Errors (stderr)</p>
          <pre aria-label="Program errors" className="max-h-80 overflow-auto rounded-lg border border-destructive/40 bg-destructive/5 p-3 font-mono text-sm text-destructive">
            {stderr || loadError}
          </pre>
        </div>
      )}
      {result?.truncated && (
        <p className="text-xs text-muted-foreground">Output was cut at {RUN_DEFAULTS.maxOutputChars.toLocaleString()} characters.</p>
      )}
    </section>
  )
}
