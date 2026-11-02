/**
 * TICKET T11 — localStorage implementation of ProgressStore.
 *
 * Rules:
 *  - Key: PROGRESS_STORAGE_KEY ("pyacademy:progress"); value includes schemaVersion.
 *  - Every read/write in try/catch: storage can be full, disabled (private mode)
 *    or throw SecurityError. On failure fall back to in-memory and show a banner.
 *  - Unknown/older schemaVersion → run migrations (migrations.ts) → save.
 *    Corrupt JSON → back it up under "pyacademy:progress:corrupt-<ts>" and reset.
 *  - Sync across tabs with the `storage` event.
 */
import { CURRENT_PROGRESS_SCHEMA, type Progress } from '@/types/progress'

export const emptyProgress = (): Progress => ({
  schemaVersion: CURRENT_PROGRESS_SCHEMA,
  completedLessonIds: [],
  attemptedProblemIds: [],
  solvedSampleProblemIds: [],
  updatedAt: new Date(0).toISOString(),
})
