import { CheckCircle2, CircleSlash, Clock, OctagonX, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { SampleOutcome, SampleVerdict } from './runSamples'

const verdictInfo: Record<SampleVerdict, { label: string; className: string; Icon: typeof CheckCircle2 }> = {
  pass: { label: 'Passed', className: 'text-emerald-700 dark:text-emerald-400', Icon: CheckCircle2 },
  fail: { label: 'Wrong output', className: 'text-destructive', Icon: XCircle },
  error: { label: 'Runtime error', className: 'text-destructive', Icon: OctagonX },
  tle: { label: 'Time limit', className: 'text-amber-700 dark:text-amber-400', Icon: Clock },
  stopped: { label: 'Stopped', className: 'text-muted-foreground', Icon: CircleSlash },
  skipped: { label: 'Not run', className: 'text-muted-foreground', Icon: CircleSlash },
}

/** Show invisible differences: trailing spaces and empty lines. */
const visible = (line: string | undefined) => (line === undefined ? '' : line === '' ? '(empty line)' : line)

export function SampleResults({ outcomes, total, running }: { outcomes: SampleOutcome[]; total: number; running: boolean }) {
  const passed = outcomes.filter((o) => o.verdict === 'pass').length
  const done = outcomes.length === total && !running
  return (
    <div className="space-y-4">
      <p role="status" aria-live="polite" className="text-sm font-medium">
        {running
          ? `Running sample ${Math.min(outcomes.length + 1, total)} of ${total}…`
          : done
            ? passed === total
              ? `All ${total} samples passed.`
              : `${passed} of ${total} samples passed.`
            : 'Press “Run samples” to test your code on the examples.'}
      </p>
      {outcomes.length > 0 && (
        <table className="w-full text-sm">
          <caption className="sr-only">Sample results</caption>
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th scope="col" className="py-2 pr-2 font-medium">Sample</th>
              <th scope="col" className="py-2 pr-2 font-medium">Result</th>
              <th scope="col" className="py-2 text-right font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {outcomes.map((o) => {
              const { label, className, Icon } = verdictInfo[o.verdict]
              return (
                <tr key={o.index} className="border-b last:border-0">
                  <th scope="row" className="py-2 pr-2 text-left font-normal">
                    {o.name}
                  </th>
                  <td className={cn('py-2 pr-2 font-medium', className)}>
                    <span className="inline-flex items-center gap-1.5">
                      <Icon aria-hidden className="size-4" />
                      {label}
                    </span>
                  </td>
                  <td className="py-2 text-right tabular-nums text-muted-foreground">{o.verdict === 'skipped' ? '—' : `${o.durationMs} ms`}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      {outcomes
        .filter((o) => o.verdict === 'fail' || o.verdict === 'error' || o.verdict === 'tle')
        .map((o) => (
          <section key={o.index} aria-label={`${o.name} details`} className="space-y-2 rounded-lg border p-3 text-sm">
            <p className="flex flex-wrap items-center gap-2 font-medium">
              {o.name}
              <Badge variant="outline">{verdictInfo[o.verdict].label}</Badge>
            </p>
            {o.verdict === 'fail' && o.compare?.firstDiffLine && (
              <p>
                First difference on line {o.compare.firstDiffLine}: expected <code className="rounded bg-muted px-1">{visible(o.compare.expectedLine)}</code>, got{' '}
                <code className="rounded bg-muted px-1">{visible(o.compare.actualLine)}</code>
              </p>
            )}
            {o.verdict === 'tle' && <p>Your program ran longer than the time limit. Look for an infinite loop or a slower-than-needed algorithm.</p>}
            <div className="grid gap-2 sm:grid-cols-2">
              <OutputBox title="Expected output" text={o.expected} />
              <OutputBox title="Your output" text={o.actual} note={o.truncated ? '(cut off)' : undefined} />
            </div>
            {o.stderr && <OutputBox title="Errors (stderr)" text={o.stderr} error />}
          </section>
        ))}
    </div>
  )
}

function OutputBox({ title, text, note, error }: { title: string; text: string; note?: string; error?: boolean }) {
  return (
    <div className="min-w-0">
      <p className={cn('mb-1 text-xs font-semibold', error ? 'text-destructive' : 'text-muted-foreground')}>
        {title} {note}
      </p>
      <pre className={cn('max-h-48 overflow-auto rounded border p-2 font-mono text-xs', error ? 'border-destructive/40 bg-destructive/5 text-destructive' : 'bg-muted/40')}>
        {text || ' '}
      </pre>
    </div>
  )
}
