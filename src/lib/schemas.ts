/**
 * Runtime validation for authored content. Used by
 * `scripts/build-content-manifest.ts` at build time so a typo in frontmatter
 * fails the build instead of breaking a page in production.
 */
import { z } from 'zod'

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be kebab-case')
const id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'id must be kebab-case')

export const lessonFrontmatterSchema = z.object({
  id,
  slug,
  title: z.string().min(1),
  summary: z.string().min(1),
  category: z.enum(['fundamentals', 'algorithms', 'cheat-sheets']),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  order: z.number().int().nonnegative(),
  prerequisites: z.array(id).default([]),
  learningObjectives: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  practiceProblems: z.array(slug).optional(),
  draft: z.boolean().optional(),
})

export const sampleTestSchema = z.object({
  input: z.string(),
  expectedOutput: z.string(),
  name: z.string().optional(),
  explanation: z.string().optional(),
})

export const problemDefinitionSchema = z.object({
  id,
  slug,
  title: z.string().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  topicTags: z.array(z.string()).min(1),
  constraints: z.array(z.string()).min(1),
  inputSpec: z.string().min(1),
  outputSpec: z.string().min(1),
  sampleTests: z.array(sampleTestSchema).min(1),
  hints: z.array(z.string()).default([]),
  timeLimitMs: z.number().int().positive().max(30_000).optional(),
  compareMode: z.enum(['exact', 'trim-lines', 'tokens-per-line']).optional(),
  starterCode: z.string().optional(),
  relatedLessonIds: z.array(id).optional(),
  source: z.string().optional(),
})
