# Implementation tickets (for Claude Code)

Work **one ticket at a time**, in this order. Before starting a ticket, read
`CLAUDE.md` and the ticket. Finish = every "Done when" item true and every test
command passes. Commit per ticket: `feat(T#): <summary>`.

Standard gate for every ticket: `npm run check && npm run build`

---

## T0 — Scaffold ✅ (done)
Vite 8 + React 19 + TS 7, Tailwind 4 (+typography), React Router 8 lazy routes, MDX + build-time Shiki, content manifest script with zod validation, typed contracts (`src/types/`), page shells, `compareOutput` + tests, stubs for runner/worker/progress/search, `render.yaml`.

---

## T1 — shadcn/ui setup and theme
- **Scope:** run shadcn init (Radix base), add base components, replace hand-rolled styles in header/cards with shadcn components, add light/dark/system toggle (class `dark` on `<html>`, preference in localStorage, try/catch).
- **Files:** `components.json` (new), `src/styles/globals.css` (keep Shiki + lesson-prose sections), `src/components/ui/*`, `src/components/layout/SiteHeader.tsx`, `src/components/layout/ThemeToggle.tsx`, `index.html` (no-flash theme script).
- **Commands:** `npx shadcn@latest init -t vite -b radix -p nova` then `npx shadcn@latest add button card badge tabs dialog command sheet separator scroll-area tooltip sonner`
- **Done when:** mobile menu uses `Sheet`; toggle works and persists; code blocks switch light/dark; no layout shift on load; lint clean.
- **Test:** `npm run check && npm run build && npm run preview` — check `/` and a lesson in both themes at 360 px and 1280 px.

## T2 — Layout, navigation, resilience
- **Scope:** lesson sidebar (category list, current highlighted) on ≥ lg, prev/next lesson links, breadcrumbs, `document.title` per page, route `errorElement` that shows a friendly error and **reloads once** on chunk-load failures (`Failed to fetch dynamically imported module`), focus moved to `<h1>` on navigation.
- **Files:** `src/app/router.tsx`, `src/app/RootLayout.tsx`, `src/app/RouteError.tsx`, `src/components/layout/{LessonSidebar,Breadcrumbs,PrevNext}.tsx`, `src/hooks/useDocumentTitle.ts`.
- **Done when:** keyboard-only user can reach every link; prev/next follows `order`; deleting a chunk from `dist/assets` then navigating shows the reload path, not a white screen.
- **Test:** `npm run check && npm run build && npm run preview`

## T3 — MDX authoring kit
- **Scope:** MDX components available globally: `Callout` (exists), `Exercise` (collapsible answer), `Complexity` (badge, e.g. O(N log N)), `KeyIdea`, `RunnableExample` (renders highlighted code + "Open in Playground" link that passes code/stdin via URL state — no Pyodide on lesson page). Write `docs/AUTHORING.md`: frontmatter fields, lesson section template, escaping `<` and `{`, problem folder layout, how to validate.
- **Files:** `src/components/mdx/*`, `src/components/mdx/MdxContent.tsx`, `docs/AUTHORING.md`, update `src/content/fundamentals/input-output.mdx` to use them.
- **Done when:** template lesson uses each component; a broken frontmatter field makes `npm run content:check` fail with file + field name.
- **Test:** `npm run content:check && npm run check && npm run build`

## T9 — Python runner (do early: highest risk)
- **Step 1 spike (½ day):** worker loads Pyodide from `PYODIDE_INDEX_URL` with `await import(/* @vite-ignore */ indexURL + 'pyodide.mjs')`, runs `print(1+1)`. Verify in `npm run build && npm run preview` in Chrome, Firefox, Safari/iOS. Record load times on Wi-Fi and throttled "Fast 4G" in `docs/PLAN.md`.
- **Scope:** implement `python.worker.ts` and `PyodideRunner` per their header comments: batch stdin via `setStdin`, batched stdout/stderr streaming, per-run fresh globals, output cap, traceback trimming, run IDs; timeout + Stop = terminate + respawn; status machine (`RunnerStatus`). Playground page: lazy `CodeEditor` (Monaco on desktop via `@monaco-editor/react`, textarea on touch/narrow), stdin textarea, Run / Stop buttons, status line, stdout & stderr panes, Ctrl/⌘+Enter to run. Code + stdin kept in URL hash or sessionStorage so refresh doesn't lose work.
- **Files:** `src/workers/python.worker.ts`, `src/features/playground/{PyodideRunner.ts,useRunner.ts,CodeEditor.tsx,OutputPanel.tsx,Playground.tsx}`, `src/app/routes/PlaygroundPage.tsx`, unit tests for stdin splitting/output capping helpers.
- **Done when:** acceptance criterion #4 and #6 in PLAN §2 pass; Stop during `while True: pass` responds < 1 s; 3 consecutive runs after a timeout work; `input()` past end shows `EOFError`; a lesson page loads no Pyodide/Monaco requests.
- **Test:** `npm run check && npm run build && npm run preview` + manual cases: `print(sum(map(int,input().split())))` / `3 4`; `import sys; print(len(sys.stdin.read().split()))`; `1/0`; `while True: pass`; `print('x'*10**7)` (truncated).

## T10 — Practice workbench
- **Scope:** on problem pages: editor prefilled with `starterCode` (or last attempt from sessionStorage), "Run" (custom stdin) and "Run samples" (each sample sequentially via the runner, `compareOutput` with problem `compareMode`), result table (pass/fail, expected vs actual, first diff line, time), hints revealed one at a time, editorial behind "Show editorial" (lazy MDX). Disclaimer: "Passing samples ≠ accepted by the judge."
- **Files:** `src/features/practice/{PracticeWorkbench.tsx,SampleResults.tsx,runSamples.ts,runSamples.test.ts}`, `src/app/routes/ProblemPage.tsx`.
- **Done when:** editorial solution passes all samples for every problem; a CRLF-pasted expected output still passes; timeout on one sample marks it TLE and continues.
- **Test:** `npm run check && npm run build && npm run preview`

## T7 — Search
- **Scope:** implement `scripts/build-search-index.ts` with Pagefind Node API: for each manifest entry read the MDX, strip frontmatter/imports/JSX to plain text (`remark-parse` + `remark-mdx` + `mdast-util-to-string`), `addCustomRecord({ url, content, language: 'en', meta: { title, summary, kind }, filters: { kind, level } })`, write `dist/pagefind`. Search dialog (shadcn `Command`) opened by header button and Ctrl/⌘+K; lazy-loads `/pagefind/pagefind.js`; shows title, kind badge, excerpt; dev-mode notice when index missing.
- **Files:** `scripts/build-search-index.ts`, `src/features/search/{pagefindClient.ts,SearchDialog.tsx}`, `src/components/layout/SiteHeader.tsx`, `package.json` (+ `remark-parse remark-mdx mdast-util-to-string` dev deps).
- **Done when:** in preview, "split", "prefix", "sys.stdin" return the right pages; Enter navigates; Esc closes; works on mobile.
- **Test:** `npm run build && npm run preview` → search; `ls dist/pagefind` shows `pagefind.js`.

## T11 — Progress
- **Scope:** implement `LocalProgressStore` (rules in its header), `migrations.ts`, `useProgress()` hook (React context + `storage` event sync). "Mark complete" on lessons, auto-record `lastVisitedLesson`, attempted/solved-sample on problems (from T10), checkmarks in roadmap/lesson lists/problem list, "Continue" card on home, Progress page with stats + Export (download JSON) / Import (file picker, validated with zod) / Reset (confirm dialog).
- **Files:** `src/features/progress/*`, `src/types/progress.ts` (if needed), pages `HomePage`, `LessonPage`, `ProblemsIndexPage`, `ProgressPage`.
- **Done when:** acceptance criterion #7; corrupt JSON in localStorage doesn't crash the app; private-mode/blocked storage shows a banner and still works in-memory.
- **Test:** unit tests for load/save/migrate/corrupt cases; `npm run check && npm run build`

## T4 — Content: fundamentals (≥ 5 polished)
Input/Output (polish), Operators & expressions, Conditionals, Loops, Strings, Lists (then Functions, Dicts & Sets). Each follows the template sections, ≥ 3 exercises, ≥ 1 linked practice problem. **Done when** `npm run content:check` passes and roadmap stage 1 shows no "coming soon" for those five.

## T5 — Content: 10 practice problems
Mix: 5 easy (I/O, math, loops, strings), 4 medium (sorting, prefix sums, two pointers, counting), 1 harder (greedy or binary search). Each: spec, constraints, ≥ 2 samples (incl. an edge case), 1–3 hints, editorial with complexity, `source` if adapted. **Done when** every editorial passes its samples via T10.

## T6 — Content: cheat sheets + algorithms
≥ 4 cheat sheets (fast I/O ✅, strings, lists/sorting with `key=`, `collections`/`heapq`/`bisect`/`math` recipes with complexity). Replace the prefix-sums placeholder; add complexity + sorting lessons.

## T8 — Problem list UX
Filter by difficulty and tag (URL query params), solved-sample/attempted badges, link from lessons ("Practice") and from problems back to related lessons.

## T12 — QA and automated smoke tests
- **Scope:** add `@playwright/test`; `e2e/smoke.spec.ts` against `vite preview`: every route renders an `<h1>`, nested-route refresh, no console errors, no horizontal scroll at 360 px, playground run returns `7` (can be tagged `@slow`). Axe or manual a11y pass: focus order, contrast, labels, `aria-live` on run status.
- **Files:** `playwright.config.ts`, `e2e/*.spec.ts`, `package.json` (`test:e2e`).
- **Test:** `npx playwright install chromium` (once) then `npm run build && npm run test:e2e`

## T13 — Deploy to Render
Follow `docs/PLAN.md` §7 exactly; run the production smoke test checklist; record the URL and Node version in `README.md`.

---

## T14 — Content: finish Stage 2 roadmap (7 algorithm lessons)
- **Scope:** write the missing Stage 2 lessons, each following the template sections (objectives → explanation → examples → common mistakes → competition use → exercises → next topic), with a `<Complexity>` badge, ≥ 3 exercises, and ≥ 1 linked practice problem:
  1. `algo-math-gcd-primes-mod` — GCD/LCM (`math.gcd`, `math.lcm`), primality by trial division, Sieve of Eratosthenes, modulo rules, `pow(a, b, m)`
  2. `algo-counting` — frequency counting with `dict`/`Counter`, counting pairs, combinations (`math.comb`)
  3. `algo-binary-search` — on a sorted list (`bisect_left/right`) and binary search on the answer
  4. `algo-two-pointers` — pair sum in a sorted list, merging, removing duplicates
  5. `algo-sliding-window` — fixed-size and variable-size windows
  6. `algo-greedy` — when greedy works, the exchange argument, classic interval/coin cases
  7. `algo-recursion` — base case, call stack, `sys.setrecursionlimit`, recursion vs. loop, intro to memoization (`functools.cache`)
- **Problems:** add ≥ 1 new problem for each lesson that has none (at least: gcd/primes, binary search, sliding window, greedy, recursion), with ≥ 2 samples including an edge case, hints, and an editorial with complexity.
- **Roadmap UI fix:** "coming soon" rows currently show the raw ID (e.g. `algo-greedy · coming soon`). Give each roadmap item a display title (`{ id, title }` in `src/data/roadmap.ts`) so unfinished items read "Greedy · coming soon".
- **Files:** `src/content/algorithms/*.mdx`, `src/content/problems/<slug>/*`, `src/data/roadmap.ts`, `src/app/routes/HomePage.tsx`, cross-links in existing lessons' "Next topic".
- **Done when:** roadmap Stage 2 shows no "coming soon"; `npm run content:check` passes; every new editorial passes its samples (`npm run test:e2e` runner spec); all new files listed under "needs coach review" in `docs/PROGRESS_LOG.md`.
- **Test:** `npm run check && npm run build && npm run test:e2e`

## T15 — Content: Stage 3 (graphs + DP intro)
- **Scope:** `algo-bfs-dfs` (grid and adjacency-list BFS with `collections.deque`, iterative DFS, connected components, shortest path on unweighted graphs) and `algo-dp-intro` (states and transitions, top-down with `functools.cache` vs bottom-up tables, classic: climbing stairs, coin change, LCS or 0/1 knapsack). 2 problems each. Rename stage title from "Next level (after V1)" to "Next level".
- **Files:** same as T14.
- **Done when:** roadmap shows no "coming soon" anywhere; same checks as T14.
- **Test:** `npm run check && npm run build && npm run test:e2e`
