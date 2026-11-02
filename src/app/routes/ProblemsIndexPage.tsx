import { ChevronDown, Dumbbell } from 'lucide-react'
import { useId, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router'
import { DifficultyBadge } from '@/components/content/LevelBadges'
import { Meter, PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { manifest } from '@/content/registry'
import { ProblemStatusBadge } from '@/features/practice/ProblemStatusBadge'
import {
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  STATUSES,
  STATUS_LABELS,
  allTags,
  filterProblems,
  hasActiveFilters,
  parseProblemFilters,
  withFilter,
  type ProblemFilters,
} from '@/features/practice/problemFilters'
import { problemStatus } from '@/features/progress/progressOps'
import { useProgress } from '@/features/progress/useProgress'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { cn } from '@/lib/utils'

const TAGS = allTags(manifest.problems)

/** A native select styled as a pill: the label is for screen readers, the "All …" option says what it filters. */
function FilterPill({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string | null) => void; children: ReactNode }) {
  const id = useId()
  return (
    <div className="filter-pill" data-active={value !== ''}>
      <label htmlFor={id} className="sr-only">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value || null)}>
        {children}
      </select>
      <ChevronDown aria-hidden className="size-3.5" />
    </div>
  )
}

export default function ProblemsIndexPage() {
  useDocumentTitle('Practice problems')
  const { progress } = useProgress()
  const [params, setParams] = useSearchParams()
  const filters = parseProblemFilters(params, TAGS)
  const statusOf = (id: string) => problemStatus(progress, id)
  const shown = filterProblems(manifest.problems, filters, statusOf)
  const setFilter = (key: keyof ProblemFilters) => (value: string | null) => setParams(withFilter(params, key, value), { replace: true })
  const total = manifest.problems.length
  const solved = manifest.problems.filter((p) => statusOf(p.id) === 'solved').length

  return (
    <div className="tone-practice space-y-5">
      <PageHeader tone="practice" icon={Dumbbell} title="Practice problems">
        <div className="space-y-1.5">
          <p className="text-sm">
            <span className="font-semibold tabular-nums">{solved}</span> of {total} solved on the samples
          </p>
          <Meter value={solved} max={total} label="Problems solved on the samples" />
        </div>
      </PageHeader>

      <section aria-label="Filters" className="space-y-3">
        <div className="grid grid-cols-3 gap-2 sm:max-w-xl">
          <FilterPill label="Difficulty" value={filters.difficulty ?? ''} onChange={setFilter('difficulty')}>
            <option value="">All levels</option>
            {DIFFICULTIES.map((d) => <option key={d} value={d}>{DIFFICULTY_LABELS[d]}</option>)}
          </FilterPill>
          <FilterPill label="Topic" value={filters.tag ?? ''} onChange={setFilter('tag')}>
            <option value="">All topics</option>
            {TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
          </FilterPill>
          <FilterPill label="My progress" value={filters.status ?? ''} onChange={setFilter('status')}>
            <option value="">Any status</option>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </FilterPill>
        </div>
        <div className="flex min-h-10 items-center justify-between gap-3">
          <p aria-live="polite" className="text-sm text-muted-foreground">
            Showing {shown.length} of {total} problems
          </p>
          {hasActiveFilters(filters) && (
            <Button type="button" variant="ghost" className="h-10" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
              Clear filters
            </Button>
          )}
        </div>
      </section>

      {shown.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">No problems match these filters.</p>
      ) : (
        <Card className="gap-0 py-0">
          <ul className="divide-y">
            {shown.map((p) => (
              <li key={p.id}>
                <Link
                  to={p.url}
                  className={cn(
                    'row-stripe flex flex-col gap-2 p-4 pl-5 outline-ring hover:bg-muted/50 focus-visible:outline-2 focus-visible:-outline-offset-2',
                    `difficulty-${p.difficulty}`,
                  )}
                >
                  <span className="flex flex-wrap items-center gap-2 font-medium">
                    {p.title}
                    <ProblemStatusBadge status={statusOf(p.id)} />
                  </span>
                  <span className="flex flex-wrap items-center gap-1.5">
                    <DifficultyBadge difficulty={p.difficulty} />
                    {p.topicTags.map((t) => (
                      <Badge key={t} variant="outline" className="text-muted-foreground">{t}</Badge>
                    ))}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
