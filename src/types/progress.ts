/**
 * Device-local learning progress. Stored in localStorage under
 * `PROGRESS_STORAGE_KEY`. Bump `schemaVersion` and add a migration in
 * `src/features/progress/migrations.ts` whenever this shape changes.
 */

export const PROGRESS_STORAGE_KEY = 'pyacademy:progress'
export const CURRENT_PROGRESS_SCHEMA = 1 as const

export interface ProgressV1 {
  schemaVersion: 1
  completedLessonIds: string[]
  attemptedProblemIds: string[]
  /** Problems where the learner's code matched ALL sample tests (not a judge verdict). */
  solvedSampleProblemIds: string[]
  lastVisitedLesson?: { id: string; url: string; at: string }
  /** Optional free-text notes keyed by lesson or problem ID. */
  notes?: Record<string, string>
  updatedAt: string
}

export type Progress = ProgressV1

/**
 * Storage abstraction. MVP uses `LocalProgressStore`; a future backend can
 * provide `RemoteProgressStore` with the same interface (sync/accounts later).
 */
export interface ProgressStore {
  load(): Progress
  save(progress: Progress): void
  reset(): void
  /** Serialize for manual export/import (lets students move devices). */
  exportJson(): string
  importJson(json: string): Progress
}
