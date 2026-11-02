import type { Difficulty, ProblemDefinition } from '@/types/content'
import type { ProblemProgress } from '@/features/progress/progressOps'

/** Problem-list filters. They live in the URL (`?difficulty=easy&tag=strings&status=solved`) so a filtered list can be shared or bookmarked. */
export interface ProblemFilters {
  difficulty: Difficulty | null
  tag: string | null
  status: ProblemProgress | null
}

export const DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard']
export const STATUSES: readonly ProblemProgress[] = ['new', 'attempted', 'solved']

export const DIFFICULTY_LABELS: Record<Difficulty, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }
export const STATUS_LABELS: Record<ProblemProgress, string> = { new: 'Not started', attempted: 'Attempted', solved: 'Solved (samples)' }

/** Unknown or malformed values are ignored (treated as "all"), never an error. */
export function parseProblemFilters(params: URLSearchParams, knownTags: readonly string[]): ProblemFilters {
  const difficulty = params.get('difficulty')
  const tag = params.get('tag')
  const status = params.get('status')
  return {
    difficulty: DIFFICULTIES.includes(difficulty as Difficulty) ? (difficulty as Difficulty) : null,
    tag: tag && knownTags.includes(tag) ? tag : null,
    status: STATUSES.includes(status as ProblemProgress) ? (status as ProblemProgress) : null,
  }
}

/** Returns new params with one filter changed; `null` removes it. Other params are kept. */
export function withFilter(params: URLSearchParams, key: keyof ProblemFilters, value: string | null): URLSearchParams {
  const next = new URLSearchParams(params)
  if (value) next.set(key, value)
  else next.delete(key)
  return next
}

export function allTags(problems: readonly Pick<ProblemDefinition, 'topicTags'>[]): string[] {
  return [...new Set(problems.flatMap((p) => p.topicTags))].sort()
}

const difficultyRank = (d: Difficulty) => DIFFICULTIES.indexOf(d)

/** Filters, then sorts easy → hard and by title inside each difficulty. */
export function filterProblems<P extends Pick<ProblemDefinition, 'id' | 'title' | 'difficulty' | 'topicTags'>>(
  problems: readonly P[],
  filters: ProblemFilters,
  statusOf: (id: string) => ProblemProgress,
): P[] {
  return problems
    .filter((p) => !filters.difficulty || p.difficulty === filters.difficulty)
    .filter((p) => !filters.tag || p.topicTags.includes(filters.tag))
    .filter((p) => !filters.status || statusOf(p.id) === filters.status)
    .sort((a, b) => difficultyRank(a.difficulty) - difficultyRank(b.difficulty) || a.title.localeCompare(b.title))
}

export const hasActiveFilters = (f: ProblemFilters) => Boolean(f.difficulty || f.tag || f.status)
