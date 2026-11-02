import { Link, useParams } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MdxContent } from '@/components/mdx/MdxContent'
import { findLesson, findProblem } from '@/content/registry'
import NotFoundPage from './NotFoundPage'

export default function LessonPage() {
  const { category, slug } = useParams()
  const lesson = findLesson(category, slug)
  if (!lesson) return <NotFoundPage />

  // TODO(T11): mark lastVisitedLesson + "Mark as complete" button via progress store.
  return (
    <article className="mx-auto max-w-3xl space-y-6">
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
    </article>
  )
}
