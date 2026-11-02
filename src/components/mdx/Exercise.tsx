import { PencilLine } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * A practice task. Put the question in the body and the solution in <Answer>,
 * which stays collapsed until the student opens it.
 *
 *   <Exercise title="Largest number">
 *   Read N, then N integers, and print the largest.
 *   <Answer>…</Answer>
 *   </Exercise>
 */
export function Exercise({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="my-6 rounded-lg border px-4 py-3 [&>:last-child]:mb-0">
      <p className="not-prose mb-1 flex items-center gap-2 font-semibold">
        <PencilLine aria-hidden className="size-4 text-emerald-700 dark:text-emerald-400" />
        {title ? `Exercise: ${title}` : 'Exercise'}
      </p>
      {children}
    </section>
  )
}

/** Collapsible answer for an <Exercise>. Native <details>: keyboard + screen reader friendly, no JS. */
export function Answer({ label = 'Show answer', children }: { label?: string; children: ReactNode }) {
  return (
    <details className="group mt-3 rounded-md bg-muted/50 [&_.shiki]:my-2">
      <summary className="not-prose flex min-h-10 cursor-pointer items-center rounded-md px-3 font-medium select-none hover:bg-muted">
        <span className="group-open:hidden">{label}</span>
        <span className="hidden group-open:inline">Hide answer</span>
      </summary>
      <div className="px-3 pb-3">{children}</div>
    </details>
  )
}
