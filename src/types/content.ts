/**
 * Content model for lessons, cheat sheets and practice problems.
 *
 * Runtime validation lives in `src/lib/schemas.ts` (zod). These interfaces are
 * the compile-time contract; `scripts/build-content-manifest.ts` guarantees that
 * every MDX file and problem definition matches them before the app builds.
 */

export type ContentCategory = 'fundamentals' | 'algorithms' | 'cheat-sheets'
export type Level = 'beginner' | 'intermediate' | 'advanced'
export type Difficulty = 'easy' | 'medium' | 'hard'

/** Frontmatter required at the top of every lesson / cheat-sheet MDX file. */
export interface LessonFrontmatter {
  /** Stable, never-changing ID used by progress storage, e.g. "fund-io". */
  id: string
  /** URL segment, e.g. "input-output". Unique within its category. */
  slug: string
  title: string
  summary: string
  category: ContentCategory
  level: Level
  /** Sort order inside the category (10, 20, 30… leaves room to insert). */
  order: number
  /** Lesson IDs that should be finished first. */
  prerequisites: string[]
  learningObjectives: string[]
  tags: string[]
  /** Optional: problem slugs to suggest at the end of the lesson. */
  practiceProblems?: string[]
  /** Optional: hide from navigation/search while writing. */
  draft?: boolean
}

/** One entry of the generated manifest (frontmatter + where to load the body). */
export interface LessonEntry extends LessonFrontmatter {
  /** Vite glob key, e.g. "/src/content/fundamentals/input-output.mdx". */
  sourcePath: string
  /** App URL, e.g. "/learn/fundamentals/input-output". */
  url: string
}

/** A single stdin → expected stdout example. Strings are compared after normalization. */
export interface SampleTest {
  /** Exact text fed to stdin (include the trailing newline). */
  input: string
  /** Exact expected stdout. */
  expectedOutput: string
  /** Optional label shown in the UI, e.g. "Sample 1". */
  name?: string
  /** Optional: explain why this output is correct. */
  explanation?: string
}

/** How strict the output comparison is. Default: 'tokens-per-line' (typical judge behaviour). */
export type CompareMode = 'exact' | 'trim-lines' | 'tokens-per-line'

/** Typed problem definition: `src/content/problems/<slug>/problem.ts`. */
export interface ProblemDefinition {
  id: string
  slug: string
  title: string
  difficulty: Difficulty
  topicTags: string[]
  /** Plain-text constraints, one per bullet, e.g. "1 ≤ N ≤ 10^5". */
  constraints: string[]
  inputSpec: string
  outputSpec: string
  sampleTests: SampleTest[]
  hints: string[]
  /** Time limit used by the in-browser runner (ms). Learning aid only, not a judge. */
  timeLimitMs?: number
  compareMode?: CompareMode
  starterCode?: string
  /** Lesson IDs this problem practises. */
  relatedLessonIds?: string[]
  /** Optional source/attribution line (e.g. "Adapted from PSITS 2025 regional"). */
  source?: string
}

/** Problem entry in the generated manifest. */
export interface ProblemEntry extends ProblemDefinition {
  /** Vite glob key of `statement.mdx`. */
  statementPath: string
  /** Vite glob key of `editorial.mdx`, if present. */
  editorialPath?: string
  url: string
}

/** Shape of `src/generated/content-manifest.json`. */
export interface ContentManifest {
  generatedAt: string
  lessons: LessonEntry[]
  cheatSheets: LessonEntry[]
  problems: ProblemEntry[]
}
