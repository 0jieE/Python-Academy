/** Pure progress updates. Each returns a new object with a fresh `updatedAt`. */
import type { Progress } from '@/types/progress'

const stamp = (p: Progress, now: Date): Progress => ({ ...p, updatedAt: now.toISOString() })
const withId = (ids: string[], id: string) => (ids.includes(id) ? ids : [...ids, id])
const withoutId = (ids: string[], id: string) => ids.filter((x) => x !== id)

export function setLessonComplete(p: Progress, lessonId: string, done: boolean, now = new Date()): Progress {
  return stamp({ ...p, completedLessonIds: done ? withId(p.completedLessonIds, lessonId) : withoutId(p.completedLessonIds, lessonId) }, now)
}

export function recordLessonVisit(p: Progress, lesson: { id: string; url: string }, now = new Date()): Progress {
  return stamp({ ...p, lastVisitedLesson: { id: lesson.id, url: lesson.url, at: now.toISOString() } }, now)
}

/** "Run samples" finished. Solved stays solved even if a later attempt fails. */
export function recordSampleRun(p: Progress, problemId: string, allPassed: boolean, now = new Date()): Progress {
  return stamp(
    {
      ...p,
      attemptedProblemIds: withId(p.attemptedProblemIds, problemId),
      solvedSampleProblemIds: allPassed ? withId(p.solvedSampleProblemIds, problemId) : p.solvedSampleProblemIds,
    },
    now,
  )
}

export type ProblemProgress = 'solved' | 'attempted' | 'new'

export function problemStatus(p: Progress, problemId: string): ProblemProgress {
  if (p.solvedSampleProblemIds.includes(problemId)) return 'solved'
  if (p.attemptedProblemIds.includes(problemId)) return 'attempted'
  return 'new'
}
