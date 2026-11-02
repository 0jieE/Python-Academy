import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type CalloutType = 'note' | 'tip' | 'warning' | 'todo'

const styles: Record<CalloutType, string> = {
  note: 'border-sky-500/50 bg-sky-500/5',
  tip: 'border-emerald-500/50 bg-emerald-500/5',
  warning: 'border-amber-500/60 bg-amber-500/5',
  todo: 'border-fuchsia-500/50 bg-fuchsia-500/5',
}

const labels: Record<CalloutType, string> = { note: 'Note', tip: 'Tip', warning: 'Watch out', todo: 'To do' }

export function Callout({ type = 'note', children }: { type?: CalloutType; children: ReactNode }) {
  return (
    <aside role="note" className={cn('not-prose my-6 rounded-lg border-l-4 px-4 py-3 text-sm', styles[type])}>
      <p className="mb-1 font-semibold">{labels[type]}</p>
      <div className="[&_p]:my-1">{children}</div>
    </aside>
  )
}
