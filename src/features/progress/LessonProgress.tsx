import { Check, CircleCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { setLessonComplete } from './progressOps'
import { useProgress } from './useProgress'

export function LessonCompleteButton({ lessonId }: { lessonId: string }) {
  const { progress, update } = useProgress()
  const done = progress.completedLessonIds.includes(lessonId)
  return (
    <Button
      variant={done ? 'secondary' : 'default'}
      aria-pressed={done}
      className="h-10 px-4"
      onClick={() => update((p) => setLessonComplete(p, lessonId, !done))}
    >
      {done ? <CircleCheck aria-hidden className="text-emerald-600 dark:text-emerald-400" /> : <Check aria-hidden />}
      {done ? 'Completed — click to undo' : 'Mark as complete'}
    </Button>
  )
}

/** Small check mark for lists; renders nothing when not done. */
export function DoneMark({ done, label = 'Completed', className }: { done: boolean; label?: string; className?: string }) {
  if (!done) return null
  return (
    <CircleCheck role="img" aria-label={label} className={cn('size-4 shrink-0 text-emerald-600 dark:text-emerald-400', className)} />
  )
}
