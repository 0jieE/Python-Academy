import { Check, ChevronRight, Play } from 'lucide-react'
import { Link } from 'react-router'
import { Meter } from '@/components/layout/PageHeader'
import { findLessonById } from '@/content/registry'
import { roadmap } from '@/data/roadmap'
import { useProgress } from '@/features/progress/useProgress'
import { InstallCard } from '@/features/pwa/InstallCard'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { cn } from '@/lib/utils'

export default function HomePage() {
  useDocumentTitle()
  const { progress } = useProgress()
  const last = progress.lastVisitedLesson && findLessonById(progress.lastVisitedLesson.id)
  const roadmapLessons = roadmap.flatMap((s) => s.items).map((item) => findLessonById(item.id)).filter((l) => l !== undefined)
  const resume = last || roadmapLessons[0]
  const done = (id: string) => progress.completedLessonIds.includes(id)
  const doneCount = roadmapLessons.filter((l) => done(l.id)).length

  return (
    <div className="space-y-8">
      <header className="page-header tone-home space-y-5 sm:p-7">
        <div className="space-y-2">
          <h1 className="text-3xl leading-tight font-bold tracking-tight sm:text-4xl">Train for Python programming contests</h1>
          <p className="text-foreground/80">Follow the roadmap, read short lessons</p>
        </div>
        {resume && (
          <Link
            to={resume.url}
            className="group flex items-center gap-3 rounded-2xl bg-background p-3 pr-4 shadow-sm ring-1 ring-foreground/5 transition-transform outline-ring focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.99] sm:max-w-md"
          >
            <span className="page-icon" aria-hidden>
              <Play className="size-5 fill-current" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs text-muted-foreground">{last ? 'Continue where you left off' : 'Start here'}</span>
              <span className="block truncate font-semibold">{resume.title}</span>
            </span>
            <ChevronRight aria-hidden className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
        <div className="space-y-1.5 sm:max-w-md">
          <p className="text-sm">
            <span className="font-semibold tabular-nums">{doneCount}</span> of {roadmapLessons.length} lessons done
          </p>
          <Meter value={doneCount} max={roadmapLessons.length} label="Roadmap lessons done" />
        </div>
      </header>

      <InstallCard />

      <section aria-labelledby="roadmap-heading" className="space-y-4">
        <h2 id="roadmap-heading" className="text-xl font-semibold">Roadmap</h2>
        {roadmap.map((stage) => {
          const lessons = stage.items.map((item) => findLessonById(item.id))
          const stageDone = stage.items.filter((item) => done(item.id)).length
          return (
            <section key={stage.id} aria-labelledby={`${stage.id}-title`} className="tone-learn space-y-4 rounded-2xl border p-5">
              <div className="space-y-2">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 id={`${stage.id}-title`} className="font-semibold">{stage.title}</h3>
                  <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
                    {stageDone}/{stage.items.length}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{stage.description}</p>
                <Meter value={stageDone} max={stage.items.length} label={`${stage.title}: lessons done`} />
              </div>
              <ol className="grid gap-1 sm:grid-cols-2">
                {stage.items.map((item, i) => {
                  const lesson = lessons[i]
                  const isDone = done(item.id)
                  const step = (
                    <span
                      aria-hidden
                      className={cn(
                        'grid size-7 shrink-0 place-items-center rounded-full border text-xs font-semibold tabular-nums',
                        isDone ? 'border-transparent bg-(--tone) text-background' : 'text-muted-foreground',
                      )}
                    >
                      {isDone ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
                    </span>
                  )
                  return (
                    <li key={item.id}>
                      {lesson ? (
                        <Link to={lesson.url} className="-mx-2 flex min-h-10 items-center gap-3 rounded-lg px-2 text-sm outline-ring hover:bg-muted focus-visible:outline-2">
                          {step}
                          <span className="flex-1">{lesson.title}</span>
                          {isDone && <span className="sr-only">(done)</span>}
                        </Link>
                      ) : (
                        <span className="-mx-2 flex min-h-10 items-center gap-3 px-2 text-sm text-muted-foreground">
                          {step}
                          {item.title} (coming soon)
                        </span>
                      )}
                    </li>
                  )
                })}
              </ol>
            </section>
          )
        })}
      </section>
    </div>
  )
}
