import { BookOpen, ChevronRight, NotebookTabs } from 'lucide-react'
import { Link } from 'react-router'
import { LevelBadge } from '@/components/content/LevelBadges'
import { Meter, PageHeader } from '@/components/layout/PageHeader'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CATEGORY_TITLES, lessonsByCategory } from '@/content/registry'
import { DoneMark } from '@/features/progress/LessonProgress'
import { useProgress } from '@/features/progress/useProgress'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const sections = (['fundamentals', 'algorithms'] as const).map((category) => ({
  category,
  title: CATEGORY_TITLES[category],
  lessons: lessonsByCategory(category),
}))
const allLessons = sections.flatMap((s) => s.lessons)

export default function LearnIndexPage() {
  useDocumentTitle('Lessons')
  const { progress } = useProgress()
  const done = (id: string) => progress.completedLessonIds.includes(id)
  const doneCount = allLessons.filter((l) => done(l.id)).length

  return (
    <div className="tone-learn space-y-8">
      <PageHeader tone="learn" icon={BookOpen} title="Lessons">
        <div className="space-y-1.5">
          <p className="text-sm">
            <span className="font-semibold tabular-nums">{doneCount}</span> of {allLessons.length} lessons done
          </p>
          <Meter value={doneCount} max={allLessons.length} label="Lessons done" />
        </div>
      </PageHeader>

      <Link
        to="/cheat-sheets"
        className="tone-sheets flex items-center gap-3 rounded-2xl border p-3 pr-4 outline-ring hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <span className="page-icon size-10 rounded-xl" aria-hidden>
          <NotebookTabs className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-medium">Cheat sheets</span>
          <span className="block text-sm text-muted-foreground">One-page reviewers: fast input, strings, sorting, standard library.</span>
        </span>
        <ChevronRight aria-hidden className="size-5 shrink-0 text-muted-foreground" />
      </Link>

      {sections.map((s) => (
        <section key={s.category} id={s.category} aria-labelledby={`${s.category}-heading`} className="scroll-mt-20 space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id={`${s.category}-heading`} className="text-lg font-semibold">{s.title}</h2>
            {s.lessons.length > 0 && (
              <span className="text-sm text-muted-foreground tabular-nums">
                {s.lessons.filter((l) => done(l.id)).length}/{s.lessons.length}
              </span>
            )}
          </div>
          {s.lessons.length === 0 ? (
            <p className="text-sm text-muted-foreground">No lessons published yet.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {s.lessons.map((l) => (
                <li key={l.id}>
                  <Link to={l.url} className="group block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                    <Card className="h-full transition-shadow group-hover:ring-(--tone)/60">
                      <CardHeader>
                        <CardTitle>{l.title}</CardTitle>
                        <CardDescription>{l.summary}</CardDescription>
                      </CardHeader>
                      <CardFooter className="mt-auto border-t-0 bg-transparent pt-0">
                        <LevelBadge level={l.level} />
                        <DoneMark done={done(l.id)} className="ml-auto" />
                      </CardFooter>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}
