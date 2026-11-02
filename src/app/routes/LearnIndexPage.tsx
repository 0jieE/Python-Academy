import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { lessonsByCategory } from '@/content/registry'

const sections = [
  { category: 'fundamentals', title: 'Python fundamentals' },
  { category: 'algorithms', title: 'Competition techniques' },
] as const

export default function LearnIndexPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Lessons</h1>
      {sections.map((s) => {
        const lessons = lessonsByCategory(s.category)
        return (
          <section key={s.category} className="space-y-3">
            <h2 className="text-lg font-semibold">{s.title}</h2>
            {lessons.length === 0 ? (
              <p className="text-sm text-muted-foreground">No lessons published yet.</p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {lessons.map((l) => (
                  <li key={l.id}>
                    <Link to={l.url} className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                      <Card className="h-full transition-shadow group-hover:ring-emerald-500/60">
                        <CardHeader>
                          <CardTitle>{l.title}</CardTitle>
                          <CardDescription>{l.summary}</CardDescription>
                        </CardHeader>
                        <CardFooter className="mt-auto border-t-0 bg-transparent pt-0">
                          <Badge variant="secondary">{l.level}</Badge>
                        </CardFooter>
                      </Card>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}
