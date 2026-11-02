import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { manifest } from '@/content/registry'

export default function ProblemsIndexPage() {
  // TODO(T8): filters by difficulty/tag, solved-sample badges from progress.
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Practice problems</h1>
      <Card className="gap-0 py-0">
      <ul className="divide-y">
        {manifest.problems.map((p) => (
          <li key={p.id}>
            <Link to={p.url} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 p-4 outline-ring hover:bg-muted/50 focus-visible:outline-2 focus-visible:-outline-offset-2">
              <span className="font-medium">{p.title}</span>
              <span className="flex flex-wrap items-center gap-1.5">
                <Badge variant="secondary">{p.difficulty}</Badge>
                {p.topicTags.map((t) => (
                  <Badge key={t} variant="outline">{t}</Badge>
                ))}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      </Card>
    </div>
  )
}
