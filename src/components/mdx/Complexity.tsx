import { Badge } from '@/components/ui/badge'

/**
 * Big-O badges, e.g. <Complexity time="O(N log N)" space="O(N)" />.
 * Write N, M, log as plain text — no LaTeX.
 */
export function Complexity({ time, space }: { time?: string; space?: string }) {
  return (
    <span className="not-prose inline-flex flex-wrap items-center gap-1.5 align-middle">
      {time && (
        <Badge variant="secondary" className="font-mono">
          <span className="font-sans text-muted-foreground">time</span> {time}
        </Badge>
      )}
      {space && (
        <Badge variant="outline" className="font-mono">
          <span className="font-sans text-muted-foreground">space</span> {space}
        </Badge>
      )}
    </span>
  )
}
