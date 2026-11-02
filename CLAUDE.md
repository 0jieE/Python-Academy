# CLAUDE.md — PyAcademy

Static Python competitive-programming tutorial site for students (PSITS-style contests).
Read `docs/PLAN.md` (architecture, risks, decisions) and `docs/TASKS.md` (tickets) before coding.
**Work one ticket at a time; don't start the next ticket without the user's go-ahead.**

## Stack (exact versions in package-lock.json — these are new; check docs before using unfamiliar APIs)
Vite 8 · React 19 · TypeScript 7 (native `tsc`) · React Router 8 (`createBrowserRouter`, `lazy` routes, import from `react-router`) ·
Tailwind CSS 4 (`@tailwindcss/vite`, no tailwind.config.js) · shadcn/ui (Radix base) · MDX 3 (`@mdx-js/rollup`) ·
Shiki 4 at build time (`@shikijs/rehype`) · Monaco (`@monaco-editor/react`, CDN loader) · Pyodide 314.0.7 in a Web Worker (CDN) ·
Zod 4 · Pagefind 1.6 Node API · Vitest 5 · oxlint.

## Hard rules (MVP)
- NO backend, Django, database, auth, remote code execution, or cloud judging.
- Never bundle Pyodide or Monaco into `dist/` — load from jsDelivr (bandwidth limit on Render free). Pyodide URL lives in `src/features/playground/config.ts`; keep its version equal to the exact `pyodide` version in package.json.
- Pyodide and Monaco must never load on lesson/cheat-sheet pages — only Playground/Problem pages, lazily.
- Python runs only in `src/workers/python.worker.ts`. UI talks to `CodeRunner` (`src/types/runner.ts`), never to Pyodide.
- Progress goes through `ProgressStore` (`src/types/progress.ts`). Wrap all localStorage access in try/catch.
- Don't add COOP/COEP headers (breaks CDN loading). stdin is batch (textarea before Run).
- Never claim sample tests are an official verdict.

## Commands
```
npm ci                 # install (lockfile)
npm run dev            # regenerates content manifest, then Vite dev server
npm run content:check  # validate all MDX frontmatter + problem definitions
npm run check          # typecheck + oxlint + vitest
npm run build          # content → tsc -b → vite build → search index
npm run preview        # serve dist/ (needed to test search, worker, rewrites)
```

## Where things go
- Pages: `src/app/routes/*Page.tsx`, registered in `src/app/router.tsx` with `lazy`.
- Lessons: `src/content/{fundamentals,algorithms,cheat-sheets}/<slug>.mdx` (frontmatter = `LessonFrontmatter`; `category` must match folder).
- Problems: `src/content/problems/<slug>/problem.ts` (default export `ProblemDefinition`; slug = folder name) + `statement.mdx` (+ optional `editorial.mdx`).
- Roadmap order: `src/data/roadmap.ts` (lesson IDs).
- Content access in the app: only via `src/content/registry.ts`. `src/generated/` is build output — never edit or commit it.
- Shared contracts: `src/types/`. Zod schemas: `src/lib/schemas.ts` (keep in sync with the types).
- Import alias: `@/` → `src/`.

## Conventions
- IDs are kebab-case and **never change** once published (progress keys depend on them). Slugs may change; IDs may not.
- Mobile first: test at 360 px; no horizontal page scroll; tap targets ≥ 40 px.
- Accessible: semantic HTML, labelled controls, visible focus, `aria-live` for run status.
- Keep lesson pages light: no new runtime deps on reading pages without a reason.
- Add/adjust Vitest tests for pure logic (compare, stdin splitting, progress migrations).
- Before saying a ticket is done: `npm run check && npm run build` must pass, and verify behavior in `npm run preview`.
