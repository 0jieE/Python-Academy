import { Link, useParams } from 'react-router'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { LessonSidebar } from '@/components/layout/LessonSidebar'
import { PrevNext } from '@/components/layout/PrevNext'
import { MdxContent } from '@/components/mdx/MdxContent'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CATEGORY_TITLES, findLesson, findProblem, lessonsByCategory, manifest } from '@/content/registry'
import { LessonCompleteButton } from '@/features/progress/LessonProgress'
import { useProgress, useRecordLessonVisit } from '@/features/progress/useProgress'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { neighbours } from '@/lib/neighbours'
import NotFoundPage from './NotFoundPage'

const sidebarGroups = (['fundamentals', 'algorithms'] as const)
  .map((c) => ({ title: CATEGORY_TITLES[c], items: lessonsByCategory(c) }))
  .filter((g) => g.items.length > 0)

export default function LessonPage() {
  const { category, slug } = useParams()
  const lesson = findLesson(category, slug)
  useDocumentTitle(lesson?.title ?? 'Page not found')
  useRecordLessonVisit(lesson)
  const { progress } = useProgress()
  if (!lesson) return <NotFoundPage />

  // Fundamentals then algorithms, each sorted by `order` (manifest order).
  const { prev, next } = neighbours(manifest.lessons, lesson.id)

  return (
    <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
      <LessonSidebar label="Lessons" groups={sidebarGroups} completedIds={progress.completedLessonIds} />
      <article className="mx-auto w-full max-w-3xl min-w-0 space-y-6">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Learn', to: '/learn' },
            { label: CATEGORY_TITLES[lesson.category], to: `/learn#${lesson.category}` },
            { label: lesson.title },
          ]}
        />
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-400">{lesson.category} · {lesson.level}</p>
          <h1 className="text-3xl font-bold">{lesson.title}</h1>
          <p className="text-muted-foreground">{lesson.summary}</p>
          {lesson.learningObjectives.length > 0 && (
            <Card size="sm" className="bg-muted/50 ring-0">
              <CardHeader>
                <CardTitle>You will learn to</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5">
                  {lesson.learningObjectives.map((o) => <li key={o}>{o}</li>)}
                </ul>
              </CardContent>
            </Card>
          )}
        </header>

        <MdxContent sourcePath={lesson.sourcePath} />

        {lesson.practiceProblems && lesson.practiceProblems.length > 0 && (
          <aside aria-label="Practice">
            <Card>
              <CardHeader>
                <CardTitle>Practice</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5">
                  {lesson.practiceProblems.map((s) => {
                    const p = findProblem(s)
                    return p ? <li key={s}><Link className="underline underline-offset-4" to={p.url}>{p.title}</Link></li> : null
                  })}
                </ul>
              </CardContent>
            </Card>
          </aside>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <LessonCompleteButton lessonId={lesson.id} />
          <p className="text-xs text-muted-foreground">Saved in this browser only.</p>
        </div>

        <PrevNext prev={prev} next={next} />
      </article>
    </div>
  )
}
