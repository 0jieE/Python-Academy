import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type Tone = 'home' | 'learn' | 'sheets' | 'practice' | 'progress'

/** Top of a section page: the section's colour and icon, the title, and a live summary. */
export function PageHeader({
  tone,
  icon: Icon,
  title,
  children,
  className,
}: {
  tone: Tone
  icon: LucideIcon
  title: string
  /** Summary line(s), meters, actions. */
  children?: ReactNode
  className?: string
}) {
  return (
    <header className={cn('page-header space-y-4', `tone-${tone}`, className)}>
      <div className="flex items-center gap-3">
        <span className="page-icon" aria-hidden>
          <Icon className="size-5.5" strokeWidth={2} />
        </span>
        <h1 className="text-2xl leading-tight font-bold tracking-tight">{title}</h1>
      </div>
      {children}
    </header>
  )
}

/** A thin progress bar in the surrounding section colour. */
export function Meter({ value, max, label, className }: { value: number; max: number; label: string; className?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} className={cn('meter', className)}>
      {pct > 0 && <div className="meter-fill" style={{ width: `${pct}%` }} />}
    </div>
  )
}
