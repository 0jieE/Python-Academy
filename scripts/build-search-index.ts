/**
 * Search index (runs AFTER `vite build`) — TICKET T7.
 *
 * Decision: the app is a client-rendered SPA, so dist/ contains only an empty
 * index.html shell — Pagefind's default HTML crawl would find nothing. Instead
 * we use Pagefind's Node API and feed it one custom record per lesson,
 * cheat sheet and problem, built from the MDX source text:
 *
 *   const { index } = await pagefind.createIndex({ forceLanguage: 'en' })
 *   await index.addCustomRecord({ url, content, language: 'en',
 *     meta: { title, summary }, filters: { category: [..] } })
 *   await index.writeFiles({ outputPath: 'dist/pagefind' })
 *   await pagefind.close()
 *
 * The browser loads `/pagefind/pagefind.js` lazily (see src/features/search).
 *
 * TODO(T7): read src/generated/content-manifest.json, convert each MDX body to
 * plain text (remark + mdast-util-to-string, skipping import/export lines),
 * add records, write to dist/pagefind, and add this script to `npm run build`.
 */
console.log('search index: not implemented yet (ticket T7) — skipping')
