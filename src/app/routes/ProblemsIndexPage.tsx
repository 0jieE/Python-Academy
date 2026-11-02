import { useId } from 'react'
import { Link, useSearchParams } from 'react-router'
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

const TAGS = allTags(manifest.problems)
const selectClass =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-ring focus-visible:outline-2 focus-visible:outline-offset-2 sm:w-48'

export default function ProblemsIndexPage() {
  useDocumentTitle('Practice problems')
  const { progress } = useProgress()
  const [params, setParams] = useSearchParams()
  const filters = parseProblemFilters(params, TAGS)
  const statusOf = (id: string) => problemStatus(progress, id)
  const shown = filterProblems(manifest.problems, filters, statusOf)
  const setFilter = (key: keyof ProblemFilters, value: string | null) => setParams(withFilter(params, key, value), { replace: true })
  const topicId = useId()
  const statusId = useId()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Practice problems</h1>

      <section aria-label="Filters" className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div role="group" aria-labelledby={`${topicId}-difficulty`} className="space-y-1.5">
          <p id={`${topicId}-difficulty`} className="text-sm font-medium">Difficulty</p>
          <div className="flex flex-wrap gap-1.5">
            {[null, ...DIFFICULTIES].map((d) => (
              <Button
                key={d ?? 'all'}
                type="button"
                variant={filters.difficulty === d ? 'default' : 'outline'}
                aria-pressed={filters.difficulty === d}
                className="h-10 px-3"
                onClick={() => setFilter('difficulty', d)}
              >
                {d ? DIFFICULTY_LABELS[d] : 'All'}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <label htmlFor={topicId} className="block text-sm font-medium">Topic</label>
          <select id={topicId} className={selectClass} value={filters.tag ?? ''} onChange={(e) => setFilter('tag', e.target.value || null)}>
            <option value="">All topics</option>
            {TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor={statusId} className="block text-sm font-medium">My progress</label>
          <select id={statusId} className={selectClass} value={filters.status ?? ''} onChange={(e) => setFilter('status', e.target.value || null)}>
            <option value="">Any</option>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </div>
        {hasActiveFilters(filters) && (
          <Button type="button" variant="ghost" className="h-10 self-start sm:self-auto" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
            Clear filters
          </Button>
        )}
      </section>

      <p aria-live="polite" className="text-sm text-muted-foreground">
        Showing {shown.length} of {manifest.problems.length} problems
      </p>

      {shown.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">No problems match these filters.</p>
      ) : (
        <Card className="gap-0 py-0">
          <ul className="divide-y">
            {shown.map((p) => (
              <li key={p.id}>
                <Link to={p.url} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 p-4 outline-ring hover:bg-muted/50 focus-visible:outline-2 focus-visible:-outline-offset-2">
                  <span className="flex flex-wrap items-center gap-2 font-medium">
                    {p.title}
                    <ProblemStatusBadge status={statusOf(p.id)} />
                  </span>
                  <span className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="secondary">{DIFFICULTY_LABELS[p.difficulty]}</Badge>
                    {p.topicTags.map((t) => (
                      <Badge key={t} variant="outline">{t}</Badge>
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
