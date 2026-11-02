# Search (ticket T7)

Pagefind index is generated after `vite build` by `scripts/build-search-index.ts`
using Pagefind's Node API (`addCustomRecord`) from MDX source — not by crawling
HTML, because the SPA's built HTML has no lesson text.

Browser side: lazily `import(/* @vite-ignore */ '/pagefind/pagefind.js')` when the
search dialog opens, call `pagefind.search(query)`, render results with our own
UI (shadcn Command/Dialog). In `npm run dev` the index does not exist — show a
"Search works in preview/production builds" message, or run `npm run build && npm run preview`.
