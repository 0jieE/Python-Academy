import { Link, useParams } from 'react-router'
import { DifficultyBadge } from '@/components/content/LevelBadges'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { MdxContent } from '@/components/mdx/MdxContent'
import { Badge } from '@/components/ui/badge'
import { findLessonById, findProblem } from '@/content/registry'
import { PracticeWorkbench } from '@/features/practice/PracticeWorkbench'
import { Editorial, Hints } from '@/features/practice/ProblemHelp'
import { ProblemStatusBadge } from '@/features/practice/ProblemStatusBadge'
import { DoneMark } from '@/features/progress/LessonProgress'
import { problemStatus, recordSampleRun } from '@/features/progress/progressOps'
import { useProgress } from '@/features/progress/useProgress'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { cn } from '@/lib/utils'
import NotFoundPage from './NotFoundPage'

// Focusable so long lines can be scrolled with the keyboard.
const samplePreClass =
  'flex-1 overflow-x-auto bg-muted px-3 pt-1 pb-2.5 font-mono text-[0.8125rem] leading-snug outline-ring focus-visible:outline-2 focus-visible:-outline-offset-2'

export default function ProblemPage() {
  const problem = findProblem(useParams().slug)
  useDocumentTitle(problem?.title ?? 'Page not found')
  const { progress, update } = useProgress()
  if (!problem) return <NotFoundPage />
  const status = problemStatus(progress, problem.id)
  const relatedLessons = (problem.relatedLessonIds ?? []).map(findLessonById).filter((l) => l !== undefined)
  const specs = [
    ['Input', problem.inputSpec],
    ['Output', problem.outputSpec],
  ] as const

  return (
    <div className="tone-practice grid gap-8 lg:grid-cols-2">
      <article className="min-w-0 space-y-5">
        <Breadcrumbs
          className="hidden md:block"
          items={[{ label: 'Home', to: '/' }, { label: 'Problems', to: '/problems' }, { label: problem.title }]}
        />
        <header className={cn('page-header row-stripe space-y-2.5 py-4', `difficulty-${problem.difficulty}`)}>
          <h1 className="text-2xl leading-tight font-bold tracking-tight">{problem.title}</h1>
          <div className="flex flex-wrap items-center gap-1.5">
            <DifficultyBadge difficulty={problem.difficulty} />
            {problem.topicTags.map((t) => (
              <Badge key={t} variant="outline" className="bg-background/60 text-muted-foreground">{t}</Badge>
            ))}
            <ProblemStatusBadge status={status} />
          </div>
        </header>

        <MdxContent sourcePath={problem.statementPath} />

        <dl className="divide-y rounded-xl border text-sm">
          {specs.map(([term, text]) => (
            <div key={term} className="grid gap-0.5 px-3.5 py-2.5">
              <dt className="font-semibold">{term}</dt>
              <dd className="text-muted-foreground">{text}</dd>
            </div>
          ))}
          <div className="grid gap-0.5 px-3.5 py-2.5">
            <dt className="font-semibold">Constraints</dt>
            <dd>
              <ul className="flex flex-wrap gap-1.5 pt-1">
                {problem.constraints.map((c) => (
                  <li key={c} className="rounded-md bg-muted px-2 py-0.5 font-mono text-[0.8125rem]">{c}</li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>

        <section aria-labelledby="samples-heading" className="space-y-2.5">
          <h2 id="samples-heading" className="font-semibold">Samples</h2>
          {problem.sampleTests.map((t, i) => {
            const name = t.name ?? `Sample ${i + 1}`
            return (
              <div key={i} className="overflow-hidden rounded-xl border">
                <p className="px-3 py-1.5 text-xs font-semibold">{name}</p>
                <div className="grid grid-cols-2 gap-px border-t bg-border">
                  {(
                    [
                      ['Input', 'input', t.input],
                      ['Output', 'expected output', t.expectedOutput],
                    ] as const
                  ).map(([label, aria, text]) => (
                    <div key={label} className="flex min-w-0 flex-col bg-muted">
                      <span aria-hidden className="px-3 pt-1.5 text-xs text-foreground/70">{label}</span>
                      <pre tabIndex={0} role="region" aria-label={`${name} ${aria}`} className={samplePreClass}>{text.replace(/\n$/, '')}</pre>
                    </div>
                  ))}
                </div>
                {t.explanation && <p className="border-t px-3 py-2 text-xs text-muted-foreground">{t.explanation}</p>}
              </div>
            )
          })}
        </section>

        <div className="divide-y rounded-xl border">
          <Hints hints={problem.hints} />
          {problem.editorialPath && <Editorial sourcePath={problem.editorialPath} />}
        </div>

        {relatedLessons.length > 0 && (
          <section aria-labelledby="related-heading" className="space-y-2">
            <h2 id="related-heading" className="font-semibold">Related lessons</h2>
            <ul className="flex flex-wrap gap-2">
              {relatedLessons.map((l) => (
                <li key={l.id}>
                  <Link
                    to={l.url}
                    className="tone-learn inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm outline-ring hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    {l.title}
                    <DoneMark done={progress.completedLessonIds.includes(l.id)} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        {problem.source && <p className="text-xs text-muted-foreground">Source: {problem.source}</p>}
      </article>
      <div className="min-w-0">
        <PracticeWorkbench
          key={problem.id}
          problem={problem}
          onSamplesChecked={(passed) => update((p) => recordSampleRun(p, problem.id, passed))}
        />
      </div>
    </div>
  )
}
