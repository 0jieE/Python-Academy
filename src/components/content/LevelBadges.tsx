import { cn } from '@/lib/utils'
import type { Difficulty, Level } from '@/types/content'

const pill = 'inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold'

const difficultyClass: Record<Difficulty, string> = {
  easy: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300',
  medium: 'bg-amber-50 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300',
  hard: 'bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300',
}
const difficultyLabel: Record<Difficulty, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }

export function DifficultyBadge({ difficulty, className }: { difficulty: Difficulty; className?: string }) {
  return <span className={cn(pill, difficultyClass[difficulty], className)}>{difficultyLabel[difficulty]}</span>
}

const levelClass: Record<Level, string> = {
  beginner: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300',
  intermediate: 'bg-sky-50 text-sky-800 dark:bg-sky-400/10 dark:text-sky-300',
  advanced: 'bg-violet-50 text-violet-800 dark:bg-violet-400/10 dark:text-violet-300',
}

export function LevelBadge({ level, className }: { level: Level; className?: string }) {
  return <span className={cn(pill, 'capitalize', levelClass[level], className)}>{level}</span>
}
