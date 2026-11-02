/**
 * Single access point for content inside the app.
 *
 * - Metadata comes from the generated manifest (small JSON, bundled eagerly).
 * - MDX bodies are code-split: each file becomes its own chunk, loaded only
 *   when its page is opened.
 */
import type { MDXContent } from 'mdx/types'
import manifestJson from '@/generated/content-manifest.json'
import type { ContentManifest, LessonEntry, ProblemEntry } from '@/types/content'

export const manifest = manifestJson as ContentManifest

type MdxModule = { default: MDXContent }

// Lazy loaders keyed by "/src/content/...mdx" — matches entry.sourcePath.
const mdxLoaders = import.meta.glob<MdxModule>('/src/content/**/*.mdx')

export function loadMdx(sourcePath: string): Promise<MdxModule> {
  const loader = mdxLoaders[sourcePath]
  if (!loader) return Promise.reject(new Error(`No MDX file at ${sourcePath}`))
  return loader()
}

export const CATEGORY_TITLES: Record<LessonEntry['category'], string> = {
  fundamentals: 'Python fundamentals',
  algorithms: 'Competition techniques',
  'cheat-sheets': 'Cheat sheets',
}

export const lessonsByCategory = (category: LessonEntry['category']) =>
  manifest.lessons.filter((l) => l.category === category)

export const findLesson = (category: string | undefined, slug: string | undefined): LessonEntry | undefined =>
  manifest.lessons.find((l) => l.category === category && l.slug === slug)

export const findCheatSheet = (slug: string | undefined): LessonEntry | undefined =>
  manifest.cheatSheets.find((c) => c.slug === slug)

export const findProblem = (slug: string | undefined): ProblemEntry | undefined =>
  manifest.problems.find((p) => p.slug === slug)

export const findLessonById = (id: string): LessonEntry | undefined =>
  [...manifest.lessons, ...manifest.cheatSheets].find((l) => l.id === id)
