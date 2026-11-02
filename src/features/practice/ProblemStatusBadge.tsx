import { CircleCheck, CircleDashed } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { ProblemProgress } from '@/features/progress/progressOps'

/** "Solved (samples)" / "Attempted" badge; nothing for problems not started. */
export function ProblemStatusBadge({ status }: { status: ProblemProgress }) {
  if (status === 'solved') {
    return (
      <Badge variant="outline" className="border-emerald-600/40 text-emerald-700 dark:text-emerald-400">
        <CircleCheck aria-hidden />
        Solved (samples)
      </Badge>
    )
  }
  if (status === 'attempted') {
    return (
      <Badge variant="outline" className="border-amber-600/40 text-amber-800 dark:text-amber-300">
        <CircleDashed aria-hidden />
        Attempted
      </Badge>
    )
  }
  return null
}
