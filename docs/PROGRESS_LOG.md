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

## T9 — Python runner + Playground ✅
- **Spike:** Pyodide 314.0.7 (Python 3.14.2) loads in a module worker from jsDelivr. Load times recorded in `docs/PLAN.md` → "T9 spike results": cold 3.4–3.7 s on this PC's connection, 7.7 s on DevTools "Fast 4G", warm 1.5–1.9 s; 5.6 MB over the wire.
- **Changed:** `python.worker.ts` (stdin via byte `read` handler → exact text then EOF; raw byte writers for stdout/stderr; `OutputLimiter` caps at 200 k chars and batches; fresh globals per run; tracebacks trimmed to `main.py` with source lines; JS-level crash → `fatal` → worker restart). `PyodideRunner` (lazy worker, run IDs, timeout/Stop = terminate + background respawn, `subscribe()` for status, load-error message naming the CDN URL). `useRunner` (shared runner), `CodeEditor` (Monaco from jsDelivr pinned 0.55.1 on desktop; textarea on touch/narrow screens and as fallback if the Monaco CDN fails), `OutputPanel` (aria-live status, separate stdout/stderr panes), `Playground` (Ctrl/⌘+Enter, code+stdin from "Open in Playground" hash, saved in sessionStorage). Contract change: `done` worker message gained optional `fatal`. Router got a `hydrateFallbackElement` (silences a React Router warning). Tests: `runnerUtils.test.ts`, `describeRun.test.ts`.
- **Verified (headless Chrome on preview):** `3 4` → `7`; `sys.stdin.read()` → `5`; `1/0` → trimmed ZeroDivisionError; `input()` past end → EOFError; `print('x'*10**7)` → truncated at 200 000; `while True: pass` → timeout, then 3 runs OK; Stop → resolves in < 10 ms, next run OK; deep recursion (200 000) works; lesson page sends no pyodide/monaco/worker requests; 360 px uses the textarea, no Monaco download; no console errors.
- **Left undone:** not tested in **Firefox, Safari/iOS or a real phone** (only Chrome is available here).
- **Check by hand:** Playground on Firefox, Safari (macOS/iOS) and an Android phone: first run, Stop on `while True: pass`, typing in the textarea editor; DevTools → Network on a lesson page shows no `pyodide`/`monaco`.

## T10 — Practice workbench ✅
- **Changed:** `runSamples.ts` (sequential samples via any `CodeRunner`; verdicts pass / fail / error / tle / stopped / skipped; TLE or error doesn't stop the rest, Stop skips the rest), `SampleResults.tsx` (summary table + details with expected vs actual and first differing line, invisible differences shown as "(empty line)"), `PracticeWorkbench.tsx` (editor prefilled with `starterCode` or the last attempt from sessionStorage `pyacademy:attempt:<id>`, Run samples / Run custom stdin / Stop / Reset code, Tabs, per-problem time limit, disclaimer "Passing samples ≠ accepted by the judge"), `ProblemHelp.tsx` (hints one at a time, editorial behind "Show editorial", lazy MDX). `AUTHORING.md`: the **last** python block in an editorial is the reference solution.
- **Verified (headless Chrome on preview):** editorial of `sum-of-two` passes 2/2 through the real "Run samples"; a solution that loops on sample 1 shows "Time limit" (2012 ms) and sample 2 still passes; CRLF expected output passes (unit test); 360 px: textarea editor, no horizontal scroll.
- **Left undone:** `onSamplesChecked` is wired for T11 (progress) but not yet connected.
- **Check by hand:** solve a problem on a phone — typing in the textarea, switching tabs, reading a failed sample's diff.
