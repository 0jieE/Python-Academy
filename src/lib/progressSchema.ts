/**
 * Runtime validation for stored / imported progress (`src/types/progress.ts`).
 *
 * Uses `zod/mini` (tree-shakable, ~2 KB) instead of `zod` because the progress
 * store loads on every page; content schemas in `schemas.ts` run only at build
 * time and use the full `zod`. Keep this in sync with `ProgressV1`.
 */
import * as z from 'zod/mini'

export const progressV1Schema = z.object({
  schemaVersion: z.literal(1),
  completedLessonIds: z.array(z.string()),
  attemptedProblemIds: z.array(z.string()),
  solvedSampleProblemIds: z.array(z.string()),
  lastVisitedLesson: z.optional(z.object({ id: z.string(), url: z.string(), at: z.string() })),
  notes: z.optional(z.record(z.string(), z.string())),
  updatedAt: z.string(),
})
