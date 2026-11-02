import { Link, useParams } from 'react-router'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { MdxContent } from '@/components/mdx/MdxContent'
import { Badge } from '@/components/ui/badge'
import { findLessonById, findProblem } from '@/content/registry'
import { PracticeWorkbench } from '@/features/practice/PracticeWorkbench'
import { Editorial, Hints } from '@/features/practice/ProblemHelp'
import { DIFFICULTY_LABELS } from '@/features/practice/problemFilters'
import { DoneMark } from '@/features/progress/LessonProgress'
import { problemStatus, recordSampleRun } from '@/features/progress/progressOps'
import { useProgress } from '@/features/progress/useProgress'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import NotFoundPage from './NotFoundPage'

// Focusable so long lines can be scrolled with the keyboard.
const samplePreClass = 'overflow-x-auto rounded bg-muted p-2 text-sm outline-ring focus-visible:outline-2 focus-visible:outline-offset-2'

export default function ProblemPage() {
  const problem = findProblem(useParams().slug)
  useDocumentTitle(problem?.title ?? 'Page not found')
  const { progress, update } = useProgress()
  if (!problem) return <NotFoundPage />
  const status = problemStatus(progress, problem.id)
  const relatedLessons = (problem.relatedLessonIds ?? []).map(findLessonById).filter((l) => l !== undefined)

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <article className="min-w-0 space-y-6">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Problems', to: '/problems' }, { label: problem.title }]} />
        <header className="space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary">{DIFFICULTY_LABELS[problem.difficulty]}</Badge>
            {problem.topicTags.map((t) => (
              <Badge key={t} variant="outline">{t}</Badge>
            ))}
          </div>
          <h1 className="text-2xl font-bold">{problem.title}</h1>
          {status !== 'new' && (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <DoneMark done={status === 'solved'} label="Solved" />
              {status === 'solved' ? 'You passed all samples (saved in this browser).' : 'Attempted — not all samples passed yet.'}
            </p>
          )}
        </header>
        <MdxContent sourcePath={problem.statementPath} />
        <section className="space-y-4 text-sm">
          <div>
            <h2 className="font-semibold">Input</h2>
            <p>{problem.inputSpec}</p>
          </div>
          <div>
            <h2 className="font-semibold">Output</h2>
            <p>{problem.outputSpec}</p>
          </div>
          <div>
            <h2 className="font-semibold">Constraints</h2>
            <ul className="list-disc pl-5">{problem.constraints.map((c) => <li key={c}>{c}</li>)}</ul>
          </div>
        </section>
        <section aria-labelledby="samples-heading" className="space-y-3">
          <h2 id="samples-heading" className="font-semibold">Samples</h2>
          {problem.sampleTests.map((t, i) => (
            <div key={i} className="space-y-2">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold">{t.name ?? `Sample ${i + 1}`} · input</p>
                  <pre tabIndex={0} role="region" aria-label={`${t.name ?? `Sample ${i + 1}`} input`} className={samplePreClass}>{t.input}</pre>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold">expected output</p>
                  <pre tabIndex={0} role="region" aria-label={`${t.name ?? `Sample ${i + 1}`} expected output`} className={samplePreClass}>{t.expectedOutput}</pre>
                </div>
              </div>
              {t.explanation && <p className="text-sm text-muted-foreground">{t.explanation}</p>}
            </div>
          ))}
        </section>
        <Hints hints={problem.hints} />
        {relatedLessons.length > 0 && (
          <section aria-labelledby="related-heading" className="space-y-2">
            <h2 id="related-heading" className="font-semibold">Related lessons</h2>
            <ul className="space-y-1">
              {relatedLessons.map((l) => (
                <li key={l.id}>
                  <Link to={l.url} className="inline-flex min-h-10 items-center gap-2 text-sm underline underline-offset-4">
                    {l.title}
                    <DoneMark done={progress.completedLessonIds.includes(l.id)} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        {problem.editorialPath && <Editorial sourcePath={problem.editorialPath} />}
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
