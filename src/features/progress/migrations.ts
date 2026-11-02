/**
 * Progress schema migrations. When `ProgressV1` changes: bump
 * CURRENT_PROGRESS_SCHEMA, add `migrations[<old version>]` that returns the
 * next version's shape, and update `progressV1Schema` (renamed accordingly).
 */
import { progressV1Schema } from '@/lib/progressSchema'
import { CURRENT_PROGRESS_SCHEMA, type Progress } from '@/types/progress'

type Data = Record<string, unknown>

const stringArray = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [])

/** migrations[n] turns version n into version n + 1. */
export const migrations: Record<number, (data: Data) => Data> = {
  // v0: anything saved before schemaVersion existed — keep what we can read.
  0: (data) => ({
    schemaVersion: 1,
    completedLessonIds: stringArray(data.completedLessonIds),
    attemptedProblemIds: stringArray(data.attemptedProblemIds),
    solvedSampleProblemIds: stringArray(data.solvedSampleProblemIds),
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : new Date(0).toISOString(),
  }),
}

/**
 * Bring stored or imported data up to the current schema.
 * Returns null when it can't be understood (not an object, a newer
 * schemaVersion than this build knows, or invalid after migrating).
 */
export function migrate(raw: unknown): Progress | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null
  let data = raw as Data
  let version = typeof data.schemaVersion === 'number' ? data.schemaVersion : 0
  if (!Number.isInteger(version) || version > CURRENT_PROGRESS_SCHEMA) return null
  while (version < CURRENT_PROGRESS_SCHEMA) {
    const step = migrations[version]
    if (!step) return null
    data = step(data)
    version++
  }
  const parsed = progressV1Schema.safeParse(data)
  return parsed.success ? parsed.data : null
}
