/**
 * Content pipeline (runs before `dev` and `build`).
 *
 * 1. Reads every lesson / cheat-sheet MDX file and validates its frontmatter.
 * 2. Imports every `src/content/problems/<slug>/problem.ts` and validates it.
 * 3. Checks cross-references (prerequisites, practiceProblems, unique ids/slugs).
 * 4. Writes `src/generated/content-manifest.json`, which the app imports for
 *    navigation, roadmap and listing pages, and which the search indexer reads.
 *
 * Usage:  npm run content            (writes manifest)
 *         npm run content -- --check (validate only, non-zero exit on errors)
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import matter from 'gray-matter'
import { lessonFrontmatterSchema, problemDefinitionSchema } from '../src/lib/schemas.ts'
import type { ContentManifest, LessonEntry, ProblemEntry } from '../src/types/content.ts'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CONTENT = join(ROOT, 'src', 'content')
const OUT = join(ROOT, 'src', 'generated', 'content-manifest.json')
const checkOnly = process.argv.includes('--check')

const errors: string[] = []

/** "/src/content/x.mdx" — the key format used by import.meta.glob. */
const globKey = (abs: string) => '/' + relative(ROOT, abs).split(sep).join('/')

function listMdx(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.endsWith('.mdx'))
    .map((d) => join(dir, d.name))
}

function readLessons(folder: 'fundamentals' | 'algorithms' | 'cheat-sheets'): LessonEntry[] {
  const entries: LessonEntry[] = []
  for (const file of listMdx(join(CONTENT, folder))) {
    const { data } = matter(readFileSync(file, 'utf8'))
    const parsed = lessonFrontmatterSchema.safeParse(data)
    if (!parsed.success) {
      errors.push(`${globKey(file)}: ${parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`)
      continue
    }
    const fm = parsed.data
    if (fm.category !== folder) errors.push(`${globKey(file)}: category "${fm.category}" does not match folder "${folder}"`)
    if (fm.draft) continue
    const url = folder === 'cheat-sheets' ? `/cheat-sheets/${fm.slug}` : `/learn/${folder}/${fm.slug}`
    entries.push({ ...fm, sourcePath: globKey(file), url })
  }
  return entries.sort((a, b) => a.order - b.order)
}

async function readProblems(): Promise<ProblemEntry[]> {
  const dir = join(CONTENT, 'problems')
  if (!existsSync(dir)) return []
  const entries: ProblemEntry[] = []
  for (const d of readdirSync(dir, { withFileTypes: true })) {
    if (!d.isDirectory()) continue
    const folder = join(dir, d.name)
    const defFile = join(folder, 'problem.ts')
    const statement = join(folder, 'statement.mdx')
    const editorial = join(folder, 'editorial.mdx')
    if (!existsSync(defFile) || !existsSync(statement)) {
      errors.push(`${globKey(folder)}: needs problem.ts and statement.mdx`)
      continue
    }
    const mod = (await import(pathToFileURL(defFile).href)) as { default: unknown }
    const parsed = problemDefinitionSchema.safeParse(mod.default)
    if (!parsed.success) {
      errors.push(`${globKey(defFile)}: ${parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`)
      continue
    }
    if (parsed.data.slug !== d.name) errors.push(`${globKey(defFile)}: slug "${parsed.data.slug}" must equal folder name "${d.name}"`)
    entries.push({
      ...parsed.data,
      statementPath: globKey(statement),
      editorialPath: existsSync(editorial) ? globKey(editorial) : undefined,
      url: `/problems/${parsed.data.slug}`,
    })
  }
  return entries.sort((a, b) => a.title.localeCompare(b.title))
}

function checkReferences(m: ContentManifest) {
  const all = [...m.lessons, ...m.cheatSheets]
  const ids = new Map<string, string>()
  for (const item of [...all, ...m.problems]) {
    const where = 'sourcePath' in item ? item.sourcePath : item.statementPath
    if (ids.has(item.id)) errors.push(`duplicate id "${item.id}" in ${where} and ${ids.get(item.id)}`)
    ids.set(item.id, where)
  }
  const urls = new Set<string>()
  for (const item of [...all, ...m.problems]) {
    if (urls.has(item.url)) errors.push(`duplicate url ${item.url}`)
    urls.add(item.url)
  }
  const lessonIds = new Set(all.map((l) => l.id))
  const problemSlugs = new Set(m.problems.map((p) => p.slug))
  for (const l of all) {
    for (const p of l.prerequisites) if (!lessonIds.has(p)) errors.push(`${l.sourcePath}: unknown prerequisite "${p}"`)
    for (const s of l.practiceProblems ?? []) if (!problemSlugs.has(s)) errors.push(`${l.sourcePath}: unknown practice problem "${s}"`)
  }
  for (const p of m.problems)
    for (const r of p.relatedLessonIds ?? []) if (!lessonIds.has(r)) errors.push(`${p.url}: unknown related lesson "${r}"`)
}

const manifest: ContentManifest = {
  generatedAt: new Date().toISOString(),
  lessons: [...readLessons('fundamentals'), ...readLessons('algorithms')],
  cheatSheets: readLessons('cheat-sheets'),
  problems: await readProblems(),
}
checkReferences(manifest)

if (errors.length) {
  console.error(`\n✖ Content validation failed (${errors.length}):\n  - ${errors.join('\n  - ')}\n`)
  process.exit(1)
}

if (!checkOnly) {
  mkdirSync(dirname(OUT), { recursive: true })
  writeFileSync(OUT, JSON.stringify(manifest, null, 2) + '\n')
}
console.log(
  `✔ content ok: ${manifest.lessons.length} lessons, ${manifest.cheatSheets.length} cheat sheets, ${manifest.problems.length} problems` +
    (checkOnly ? ' (check only)' : ` → ${relative(ROOT, OUT)}`),
)
