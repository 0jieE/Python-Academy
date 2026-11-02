import { Lightbulb } from 'lucide-react'
import type { ReactNode } from 'react'

/** The one thing to remember from a section. Use at most one or two per lesson. */
export function KeyIdea({ title = 'Key idea', children }: { title?: string; children: ReactNode }) {
  return (
    <aside
      aria-label={title}
      className="not-prose my-6 rounded-lg border border-emerald-600/30 bg-emerald-500/5 px-4 py-3 text-sm [&_p]:my-1"
    >
      <p className="mb-1 flex items-center gap-2 font-semibold text-emerald-800 dark:text-emerald-300">
        <Lightbulb aria-hidden className="size-4" />
        {title}
      </p>
      {children}
    </aside>
  )
}
