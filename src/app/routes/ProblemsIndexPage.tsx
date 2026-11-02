import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { manifest } from '@/content/registry'
import { DoneMark } from '@/features/progress/LessonProgress'
import { problemStatus } from '@/features/progress/progressOps'
import { useProgress } from '@/features/progress/useProgress'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function ProblemsIndexPage() {
  useDocumentTitle('Practice problems')
  const { progress } = useProgress()
  // TODO(T8): filters by difficulty/tag, solved-sample badges from progress.
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Practice problems</h1>
      <Card className="gap-0 py-0">
      <ul className="divide-y">
        {manifest.problems.map((p) => (
          <li key={p.id}>
            <Link to={p.url} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 p-4 outline-ring hover:bg-muted/50 focus-visible:outline-2 focus-visible:-outline-offset-2">
              <span className="flex items-center gap-2 font-medium">
                {p.title}
                <DoneMark done={problemStatus(progress, p.id) === 'solved'} label="Solved (samples)" />
                {problemStatus(progress, p.id) === 'attempted' && <span className="text-xs font-normal text-muted-foreground">attempted</span>}
              </span>
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
