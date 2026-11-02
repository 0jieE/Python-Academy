/**
 * Search index (runs AFTER `vite build`).
 *
 * The app is a client-rendered SPA, so dist/ contains only an empty
 * index.html shell — Pagefind's default HTML crawl would find nothing. Instead
 * we use Pagefind's Node API and add one custom record per lesson, cheat sheet
 * and problem, built from the MDX source text (frontmatter, imports/exports and
 * JSX tags removed; text inside components and code blocks kept).
 *
 * The browser loads `/pagefind/pagefind.js` lazily (src/features/search).
 * Problem editorials are NOT indexed (no spoilers in search results).
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import type { Root, RootContent } from 'mdast'
import { toString } from 'mdast-util-to-string'
import * as pagefind from 'pagefind'
import remarkGfm from 'remark-gfm'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import type { ContentManifest } from '../src/types/content.ts'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const MANIFEST = join(ROOT, 'src', 'generated', 'content-manifest.json')
const OUT = join(ROOT, 'dist', 'pagefind')

/** MDX source → plain searchable text. */
export function mdxToText(source: string): string {
  const { content } = matter(source)
  const tree = unified().use(remarkParse).use(remarkGfm).use(remarkMdx).parse(content) as Root
  const parts: string[] = []
  const walk = (nodes: RootContent[]) => {
    for (const node of nodes) {
      if (node.type === 'mdxjsEsm' || node.type === 'mdxFlowExpression' || node.type === 'mdxTextExpression') continue
      if (node.type === 'code' || node.type === 'inlineCode') parts.push(node.value)
      else if ('children' in node) walk(node.children as RootContent[])
      else parts.push(toString(node))
    }
  }
  walk(tree.children)
  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

const readSource = (globKey: string) => readFileSync(join(ROOT, globKey), 'utf8')

async function main() {
  if (!existsSync(join(ROOT, 'dist'))) {
    console.error('search index: dist/ not found, run `vite build` first')
    process.exit(1)
  }
  const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8')) as ContentManifest
  const { index, errors } = await pagefind.createIndex({ forceLanguage: 'en' })
  if (!index) throw new Error(`pagefind.createIndex failed: ${errors.join('; ')}`)

  const records: pagefind.CustomRecord[] = [
    ...manifest.lessons.map((l) => ({
      url: l.url,
      content: [l.title, l.summary, l.tags.join(' '), mdxToText(readSource(l.sourcePath))].join('\n'),
      language: 'en',
      meta: { title: l.title, summary: l.summary, kind: 'Lesson' },
      filters: { kind: ['lesson'], level: [l.level] },
    })),
    ...manifest.cheatSheets.map((c) => ({
      url: c.url,
      content: [c.title, c.summary, c.tags.join(' '), mdxToText(readSource(c.sourcePath))].join('\n'),
      language: 'en',
      meta: { title: c.title, summary: c.summary, kind: 'Cheat sheet' },
      filters: { kind: ['cheat-sheet'], level: [c.level] },
    })),
    ...manifest.problems.map((p) => {
      const statement = mdxToText(readSource(p.statementPath))
      return {
        url: p.url,
        content: [p.title, p.topicTags.join(' '), statement, p.inputSpec, p.outputSpec, p.constraints.join(' ')].join('\n'),
        language: 'en',
        meta: { title: p.title, summary: statement.slice(0, 160), kind: 'Problem' },
        filters: { kind: ['problem'], level: [p.difficulty] },
      }
    }),
  ]

  for (const record of records) {
    const res = await index.addCustomRecord(record)
    if (res.errors.length) throw new Error(`pagefind: ${record.url}: ${res.errors.join('; ')}`)
  }
  const written = await index.writeFiles({ outputPath: OUT })
  if (written.errors.length) throw new Error(`pagefind.writeFiles: ${written.errors.join('; ')}`)
  await pagefind.close()
  console.log(`✔ search index: ${records.length} records → ${written.outputPath}`)
}

// Run only when executed directly (the test imports mdxToText).
const self = fileURLToPath(import.meta.url).toLowerCase()
if (process.argv[1] && resolve(process.argv[1]).toLowerCase() === self) {
  await main()
}
