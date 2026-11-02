# Progress log

One entry per ticket: what changed, what is left undone, and what to check by hand.
Gate for every ticket: `npm run check && npm run build`.

## T0 + T1 — Scaffold, shadcn/ui and theme (baseline commit)
- **Changed:** repo initialised (`git init -b main`); this first commit contains the T0 scaffold plus T1. shadcn (radix-nova) components in `src/components/ui/`; light/dark/system toggle (`src/lib/theme.ts`, `src/hooks/useTheme.ts`, `ThemeToggle.tsx`) stored under `pyacademy:theme`; no-flash script in `index.html`; mobile menu is a `Sheet`; index pages use `Card`/`Badge`; hard-coded neutral colours replaced by theme tokens; `next-themes` dropped (sonner uses our hook); `shadcn` moved to devDependencies; oxlint `only-export-components` off for `src/components/ui/**`.
- **Left undone:** `TooltipProvider` / `Toaster` not mounted (unused so far). `clsx` + `tailwind-merge` are now unused deps.
- **Check by hand:** toggle cycles light → dark → system and survives reload; code blocks in light mode have no visible border on white (pre-existing).

## T2 — Layout, navigation, resilience ✅
- **Changed:** `LessonSidebar` (≥ lg, current page highlighted, lessons + cheat sheets), `Breadcrumbs`, `PrevNext` (fundamentals → algorithms in `order`), `useDocumentTitle` on every page, `useFocusHeadingOnNavigate` (focus → `<h1>` after client navigation), `RouteError` (pathless error route keeps the header; chunk-load errors reload once per 30 s via `sessionStorage`, then show a friendly error). `MdxContent` now has its own Suspense so the page shell renders while the MDX chunk loads. Tests: `chunkError.test.ts`, `neighbours.test.ts`.
- **Verified (headless Chrome on `npm run preview`):** all 14 visible links on a lesson page reachable by Tab; Enter on "Next" goes to Prefix Sums and focuses its `<h1>`; titles update; with `LearnIndexPage-*.js` deleted from `dist/assets`, clicking Learn reloads once and then shows "Something went wrong — part of the page could not be downloaded" with the header still working.
- **Left undone:** none.
- **Check by hand:** with a screen reader (NVDA/VoiceOver), confirm the new page's heading is announced after clicking a nav link.

## T3 — MDX authoring kit ✅
- **Changed:** global MDX components `KeyIdea`, `Exercise` + `Answer` (native `<details>`), `Complexity` (badges), `RunnableExample` (wraps a fenced block so Shiki still highlights at build time; "Open in Playground" passes code + stdin in the URL hash via `src/features/playground/urlState.ts` — no Pyodide on lesson pages). `docs/AUTHORING.md` (frontmatter table, lesson template, components, escaping `<` `{`, problem folder layout, validation). Template lesson `input-output.mdx` uses every component. Inline code renders as a chip (typography's literal backticks removed); code blocks get a border.
- **Bug fixed (from T0):** `.lesson-prose :where(pre)` override was zeroing Shiki's padding and making light-mode code backgrounds transparent — removed.
- **Verified:** `level: expert` → `content:check` fails with `input-output.mdx: level: Invalid option…`; missing `title` → `title: Invalid input…`. Lesson page made zero pyodide/monaco requests; no horizontal scroll at 360 px.
- **Left undone:** none.
- **Check by hand:** read `docs/AUTHORING.md` as the coach — is anything unclear?
