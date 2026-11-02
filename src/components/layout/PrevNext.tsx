import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { cn } from '@/lib/utils'

interface Target {
  title: string
  url: string
}

const cardLink =
  'group flex flex-col gap-1 rounded-xl border p-4 transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'

export function PrevNext({ prev, next, label = 'Lesson navigation' }: { prev?: Target; next?: Target; label?: string }) {
  if (!prev && !next) return null
  return (
    <nav aria-label={label} className="grid gap-3 border-t pt-6 sm:grid-cols-2">
      {prev && (
        <Link to={prev.url} rel="prev" className={cardLink}>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowLeft aria-hidden className="size-3.5" /> Previous
          </span>
          <span className="font-medium">{prev.title}</span>
        </Link>
      )}
      {next && (
        <Link to={next.url} rel="next" className={cn(cardLink, 'sm:col-start-2 sm:items-end sm:text-right')}>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            Next <ArrowRight aria-hidden className="size-3.5" />
          </span>
          <span className="font-medium">{next.title}</span>
        </Link>
      )}
    </nav>
  )
}
