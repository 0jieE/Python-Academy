import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import { cn } from '@/lib/utils'

export interface Crumb {
  label: string
  /** Omit for the current page (last item) or a crumb with no page of its own. */
  to?: string
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-1.5 text-sm text-muted-foreground">
        {items.map((c, i) => (
          <li key={c.to ?? c.label} className="inline-flex items-center gap-1.5">
            {i > 0 && <ChevronRight aria-hidden className="size-3.5" />}
            {c.to ? (
              <Link to={c.to} className="inline-flex min-h-10 items-center underline-offset-4 hover:text-foreground hover:underline">
                {c.label}
              </Link>
            ) : (
              <span aria-current={i === items.length - 1 ? 'page' : undefined} className={cn(i === items.length - 1 && 'text-foreground')}>
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
