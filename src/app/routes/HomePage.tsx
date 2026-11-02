import { Link } from 'react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { findLessonById } from '@/content/registry'
import { roadmap } from '@/data/roadmap'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function HomePage() {
  useDocumentTitle()
  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Train for Python programming contests</h1>
        <p className="max-w-2xl text-muted-foreground">
          Follow the roadmap, read short lessons, and run Python right in your browser — no install needed.
        </p>
        {/* TODO(T11): "Continue where you left off" card from progress.lastVisitedLesson */}
      </section>

      <section aria-labelledby="roadmap-heading" className="space-y-6">
        <h2 id="roadmap-heading" className="text-xl font-semibold">Roadmap</h2>
        {roadmap.map((stage) => (
          <Card key={stage.id}>
            <CardHeader>
              <CardTitle>
                <h3>{stage.title}</h3>
              </CardTitle>
              <CardDescription>{stage.description}</CardDescription>
            </CardHeader>
            <CardContent>
            <ol className="grid gap-2 sm:grid-cols-2">
              {stage.lessonIds.map((id, i) => {
                const lesson = findLessonById(id)
                return (
                  <li key={id} className="text-sm">
                    <span className="mr-2 text-muted-foreground">{i + 1}.</span>
                    {lesson ? (
                      <Link className="underline-offset-4 hover:underline" to={lesson.url}>{lesson.title}</Link>
                    ) : (
                      <span className="text-muted-foreground">{id} · coming soon</span>
                    )}
                  </li>
                )
              })}
            </ol>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}
