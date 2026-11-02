/**
 * Browser side of search. The Pagefind bundle is written to dist/pagefind by
 * scripts/build-search-index.ts after `vite build`, and loaded here only when
 * the search dialog opens. It does not exist in `npm run dev`.
 */
interface PagefindResultData {
  url: string
  excerpt: string
  meta: { title?: string; summary?: string; kind?: string }
}
interface PagefindModule {
  init?: () => Promise<void>
  options?: (opts: Record<string, unknown>) => Promise<void>
  search: (query: string) => Promise<{ results: { id: string; data: () => Promise<PagefindResultData> }[] } | null>
}

export interface SearchHit {
  url: string
  title: string
  kind: string
  /** Pagefind excerpt: text with <mark> around matches. Render with renderExcerpt-safe parsing. */
  excerpt: string
}

// A variable (not a literal) so Vite leaves this runtime-only URL alone.
const PAGEFIND_URL = '/pagefind/pagefind.js'

let loading: Promise<PagefindModule> | null = null

export function loadPagefind(): Promise<PagefindModule> {
  loading ??= (async () => {
    const mod = (await import(/* @vite-ignore */ PAGEFIND_URL)) as PagefindModule
    await mod.options?.({ excerptLength: 24 })
    await mod.init?.()
    return mod
  })()
  // Allow a retry after a failure (offline, or dev mode without an index).
  loading.catch(() => {
    loading = null
  })
  return loading
}

export async function search(query: string, limit = 8): Promise<SearchHit[]> {
  const pagefind = await loadPagefind()
  const response = await pagefind.search(query)
  if (!response) return [] // superseded by a newer search
  const data = await Promise.all(response.results.slice(0, limit).map((r) => r.data()))
  return data.map((d) => ({ url: d.url, title: d.meta.title ?? d.url, kind: d.meta.kind ?? '', excerpt: d.excerpt }))
}

/** Split a Pagefind excerpt into plain text and highlighted parts, without using innerHTML. */
export function parseExcerpt(excerpt: string): { text: string; mark: boolean }[] {
  const doc = new DOMParser().parseFromString(`<body>${excerpt}</body>`, 'text/html')
  return [...doc.body.childNodes].map((n) => ({ text: n.textContent ?? '', mark: n.nodeName === 'MARK' }))
}
