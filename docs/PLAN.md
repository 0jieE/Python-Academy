# PyAcademy — Architecture Plan (Phase 0)

Static, self-paced Python competitive-programming tutorial site.
React + Vite + TypeScript SPA, deployed to **Render Static Site (free)**.
No backend, accounts, database, remote execution or cloud judging in MVP.

Status: **Plan + Phase-1 scaffold done (ticket T0).** Next ticket: T1.
Versions verified on 2026-11-02 (see `package.json` / `package-lock.json`).

---

## 1. Assumptions and risks

### Assumptions
- Students use recent Chrome/Edge/Firefox/Safari on laptops **and phones**; some on slow campus Wi-Fi or mobile data.
- Contest problems use **batch stdin → stdout** (PSITS-style). Students never need an interactive prompt.
- Python **standard library only** in MVP (no numpy etc.). Check the official event rules for allowed libraries/version.
- The coach writes all lessons/problems in MDX + TypeScript in the repo; GitHub is the only CMS.
- Fewer than ~300 content pages in V1 → a build-time search index is small.

### Risks and mitigations

| # | Risk | Impact | Mitigation (decision) |
|---|------|--------|------------------------|
| R1 | **Pyodide size/load time.** v314.0.7 core = `pyodide.asm.wasm` 9.6 MB + `python_stdlib.zip` 2.5 MB + JS 1.3 MB ≈ **13.4 MB uncompressed** (less over the wire with compression). First run can take several seconds on weak connections; slow phones need longer to compile WASM. | First "Run" feels broken | Load **only on demand** (never on lesson pages). Warm up when the editor gets focus. Show a clear `loading` state ("Starting Python… first time only"). Browser HTTP cache makes later visits fast. Stdlib only — no `loadPackage`. |
| R2 | **Render free bandwidth.** Static sites count against the workspace's monthly outbound bandwidth. A third-party review reports Render's Hobby allowance dropped from 100 GB to **5 GB/month on 1 Aug 2026** — *verify on your Render billing page*. Self-hosting Pyodide would cost ~13 MB per new student device. | Site suspended / overage | Load **Pyodide and Monaco from jsDelivr** (pinned versions), not from `dist/`. Our own bundle is ~0.5 MB. Long cache headers on hashed assets. Override with `VITE_PYODIDE_INDEX_URL` only if a school network blocks jsDelivr. |
| R3 | **CDN blocked** by a school firewall. | Runner can't start | Detect load failure → show a specific error with the URL that failed. Fallback plan: self-host Pyodide under `/pyodide/` via env var (accepting bandwidth cost). |
| R4 | **stdin / `input()`**. A truly interactive `input()` that pauses for typing needs `SharedArrayBuffer` + `Atomics`, which require cross-origin isolation (COOP/COEP headers). COEP breaks loading from CDNs that don't send CORP headers. | Complexity, CDN conflict | MVP: **stdin textarea filled before Run** (exactly how judges work). Worker feeds lines via `pyodide.setStdin`. Reading past the end raises `EOFError`, same as a judge. Teach: never use `input("Enter N: ")` — the prompt is printed to stdout and causes Wrong Answer. Interactive mode = post-MVP. |
| R5 | **Stop / timeout / infinite loops.** Pyodide's interrupt buffer also needs `SharedArrayBuffer`. | Frozen tab | Code runs in a **Web Worker** (UI never freezes). Stop/timeout = `worker.terminate()` + respawn. Re-init from HTTP cache ~1–3 s, shown as `loading`. Output capped (200 k chars) to protect the DOM. |
| R6 | **Timing ≠ judge.** Pyodide (WASM) is slower than native CPython and varies by device. | False TLE/AC signals | Time limits in the browser are **learning aids**. UI copy: "Sample tests passed — not an official verdict." No hidden tests in V1. |
| R7 | **MDX build errors.** Stray `<`, `{` or HTML in prose breaks compilation; bad frontmatter breaks pages. | Broken build | `scripts/build-content-manifest.ts` validates frontmatter (zod) and cross-links **before** `vite build`; MDX compile errors fail the build with file + line. Authoring guide (T3). |
| R8 | **Static search in an SPA.** `dist/` only contains an empty `index.html` shell; **Pagefind's HTML crawl finds no lesson text.** | No search | **Decision: keep Pagefind, use its Node API** (`createIndex` → `addCustomRecord({url, content, language, meta, filters})` → `writeFiles`) fed from MDX source text after `vite build`. See §3 D6 for alternatives. |
| R9 | **Render SPA rewrite.** Direct links like `/learn/fundamentals/input-output` 404 without a rewrite. Render skips rewrite rules when a file exists, so assets are safe. But a **missing old chunk after a redeploy** gets `index.html` (HTML, 200) → "Failed to fetch dynamically imported module". | Blank page after deploy | Rewrite `/*` → `/index.html` (Action: Rewrite). Route error boundary that **reloads once** on chunk-load errors (T2). Unknown URLs render our NotFound page (soft 404 — acceptable). |
| R10 | **Monaco on phones.** Monaco has weak touch / mobile-keyboard support. | Poor mobile editing | Lazy-load Monaco on desktop; on touch/narrow screens use a plain monospace `<textarea>` editor with the same API (`CodeEditor` component). |
| R11 | **Brand-new toolchain** (Vite 8, TypeScript 7 native, React Router 8, Tailwind 4, Zod 4). AI coding tools may suggest older APIs. | Wrong code suggestions | Lockfile pins exact versions. `CLAUDE.md` lists versions; check docs before using unfamiliar APIs. |
| R12 | **localStorage** can be disabled, full, or cleared; progress is per device. | Lost progress | try/catch everywhere, in-memory fallback, visible "saved on this device only" notice, JSON export/import (T11). |
| R13 | **Problem copyright.** Official contest statements may be copyrighted. | Takedown | Write original problems or "adapted from…" with attribution (`source` field). |

---

## 2. MVP boundaries and acceptance criteria

**In MVP (V1):** roadmap home, lessons (fundamentals + algorithms), cheat sheets, practice problems with sample tests, playground, site search, device-local progress, mobile layout, Render deploy.

**Out of MVP:** accounts, sync, Django/API, database, hidden tests, cloud judging, leaderboards, anti-cheat, interactive `input()`, third-party Python packages, prerendering/SEO, i18n.

### Acceptance criteria (each must be demonstrably true)
1. **Content:** ≥ 5 polished fundamentals lessons (template sections), ≥ 10 problems (each with input/output spec, constraints, ≥ 2 samples, hints, editorial), ≥ 4 cheat sheets. `npm run content:check` passes.
2. **Navigation:** every page reachable from the header/menu at 360 px and 1280 px width; no horizontal page scroll at 360 px; keyboard-only navigation works with visible focus.
3. **Search:** typing "split" or "prefix" in production returns the relevant lesson/cheat sheet within 1 s after the index loads; dev mode shows a clear "search works in build/preview" message.
4. **Runner:** in production, Playground runs `input()`, `print()`, lists, loops, functions, `sys.stdin.read()`; shows stdout and stderr (with Python traceback) separately; `while True: pass` is stopped by the time limit or Stop within 1 s of the limit, and the next Run works.
5. **Sample tests:** "Run samples" shows per-sample pass/fail, expected vs actual, first differing line; CRLF vs LF and trailing newlines never cause a fail; disclaimer visible.
6. **Lazy loading:** opening a lesson page downloads **no** Monaco or Pyodide files (verified in DevTools → Network).
7. **Progress:** mark lesson complete / sample-solved survives refresh and a new tab; export → import restores it; "this device only" notice visible.
8. **Deploy:** on the Render URL, hard refresh on a nested route works, worker loads, a run succeeds, and no console errors on the main pages.
9. **Quality gates:** `npm run check` (typecheck + lint + unit tests) and `npm run build` pass on a clean `npm ci`.

---

## 3. Architecture decisions

| # | Decision | Why | Alternatives rejected |
|---|----------|-----|-----------------------|
| D1 | **Vite 8 + React 19 + TS 7 SPA**, `createBrowserRouter` with `lazy` routes | Static output, fast dev, per-page code splitting | Next/Astro (more moving parts than needed for V1) |
| D2 | **Tailwind 4 + shadcn/ui (Radix base)** | Accessible primitives (Dialog, Tabs, Command for search) you own as source | Full component library (heavier, less control) |
| D3 | **Content = MDX in `src/content/`**, compiled at build by `@mdx-js/rollup`; frontmatter exported via `remark-mdx-frontmatter` | Coach edits Markdown + inline components; type-safe | CMS (needs backend) |
| D4 | **Generated manifest** `src/generated/content-manifest.json` from `scripts/build-content-manifest.ts` (gray-matter + zod) | One validated source for nav, roadmap, listings and search; MDX bodies stay code-split (each lesson its own chunk) | Eager `import.meta.glob` of frontmatter (would pull every lesson into the main bundle) |
| D5 | **Shiki at build time** via `@shikijs/rehype` (dual light/dark theme, CSS vars) | Zero runtime JS for reading code; Monaco only where editing | Runtime Shiki/Prism (extra JS on every lesson) |
| D6 | **Search: Pagefind Node API with custom records** from MDX text, written to `dist/pagefind/` after `vite build`; UI loads `/pagefind/pagefind.js` on demand | Keeps Pagefind's chunked, lazy index; no SSR needed | **(B) Prerender every route to HTML** then normal Pagefind crawl: gives SEO + no-JS reading, but needs SSR-safe code (guards for `window`, Monaco, Pyodide), hydration and more build time — revisit post-MVP if SEO matters. **(C) MiniSearch/FlexSearch JSON**: simplest, but whole index downloads at once; fine fallback if Pagefind's API gives trouble. |
| D7 | **Monaco via `@monaco-editor/react`** (CDN loader), `React.lazy`, desktop only; textarea fallback on touch | Familiar VS Code editing; zero cost on lesson pages | CodeMirror 6 (better mobile, smaller) — good swap if Monaco on mobile is a blocker |
| D8 | **Pyodide 314.0.7 in a module Web Worker**, loaded from jsDelivr via dynamic `import()` (not bundled); `CodeRunner` interface in `src/types/runner.ts` | Off-main-thread, no bundler issues with Pyodide, bandwidth-friendly, swappable for a remote judge later | Main-thread Pyodide (freezes UI); bundling Pyodide (bandwidth, Vite config pain) |
| D9 | **Batch stdin + terminate-to-stop** | Works without cross-origin isolation; matches judges | SharedArrayBuffer interactive input/interrupts (post-MVP) |
| D10 | **Progress in localStorage** behind `ProgressStore` interface, versioned schema + migrations | Simple now, swappable for `RemoteProgressStore` later | IndexedDB (overkill for KBs of data) |
| D11 | **Output comparison** `compareOutput()` with modes `exact` / `trim-lines` / `tokens-per-line` (default), always normalizing CRLF and trailing newlines | Matches typical judge leniency, avoids Windows-authoring false fails | — |
| D12 | **Render Static Site**, `npm ci && npm run build`, publish `dist`, rewrite `/*`→`/index.html`; optional `render.yaml` | Free HTTPS + Git-triggered deploys | — |
| D13 | **Quality**: oxlint (Vite template default), Vitest unit tests, Playwright smoke tests (T12) | Fast; already in template | ESLint (slower; not needed) |

**Future backend (not now):** UI depends only on `CodeRunner` and `ProgressStore` interfaces. A later Django/FastAPI service can add `RemoteJudgeRunner` (hidden tests, official verdicts) and `RemoteProgressStore` (accounts/sync) selected by `VITE_API_BASE_URL`, without touching pages or MDX.

### Dependencies

| Package | Kind | Purpose |
|---------|------|---------|
| react, react-dom 19.3 | runtime | UI |
| react-router 8.5 | runtime | Routing (`createBrowserRouter`, lazy routes) |
| @mdx-js/react | runtime | MDX component provider |
| @monaco-editor/react 4.7 | runtime | Editor (Monaco itself loads from CDN) |
| pyodide 314.0.7 (exact) | runtime (types + version pin) | Python runtime; files served by jsDelivr |
| zod 4 | runtime/build | Content schema validation |
| clsx, tailwind-merge, class-variance-authority, lucide-react | runtime | shadcn/ui helpers + icons |
| vite 8, @vitejs/plugin-react, typescript 7 | dev | Build |
| tailwindcss 4, @tailwindcss/vite, @tailwindcss/typography | dev | Styling, lesson prose |
| @mdx-js/rollup, remark-gfm, remark-frontmatter, remark-mdx-frontmatter | dev | MDX pipeline |
| shiki, @shikijs/rehype | dev | Build-time highlighting |
| gray-matter, tsx | dev | Content scripts |
| pagefind 1.6 | dev | Search index (Node API) |
| vitest 5, oxlint | dev | Tests, lint |
| *(T12)* @playwright/test | dev | E2E smoke tests |

---

## 4. Folder tree and responsibilities

```
Py_Academy/
├─ CLAUDE.md                     ← rules for Claude Code (read first)
├─ README.md
├─ docs/
│  ├─ PLAN.md                    ← this file
│  └─ TASKS.md                   ← ordered tickets T0–T13
├─ render.yaml                   ← optional Render Blueprint
├─ .node-version                 ← Node 22 for Render
├─ index.html
├─ vite.config.ts                ← MDX + Shiki + React + Tailwind + "@" alias
├─ public/                       ← favicon, static images (pagefind/ is generated)
├─ scripts/
│  ├─ build-content-manifest.ts  ← validate content → src/generated/content-manifest.json
│  └─ build-search-index.ts      ← (T7) Pagefind Node API → dist/pagefind/
└─ src/
   ├─ main.tsx                   ← mounts RouterProvider
   ├─ app/
   │  ├─ router.tsx              ← route table, all pages lazy
   │  ├─ RootLayout.tsx          ← header, skip link, Suspense, footer
   │  └─ routes/                 ← one file per page (Home, Learn, Lesson, CheatSheets,
   │                                CheatSheet, Problems, Problem, Playground, Progress, NotFound)
   ├─ components/
   │  ├─ layout/SiteHeader.tsx   ← desktop nav + mobile menu
   │  ├─ mdx/                    ← MdxContent (lazy MDX renderer), Callout, (T3) more
   │  └─ ui/                     ← (T1) shadcn components
   ├─ content/
   │  ├─ registry.ts             ← manifest + lazy MDX loaders + finders
   │  ├─ fundamentals/*.mdx
   │  ├─ algorithms/*.mdx
   │  ├─ cheat-sheets/*.mdx
   │  └─ problems/<slug>/        ← problem.ts (typed metadata + samples)
   │                                statement.mdx, editorial.mdx
   ├─ data/roadmap.ts            ← stages → ordered lesson IDs
   ├─ features/
   │  ├─ playground/             ← config (CDN URL, limits), PyodideRunner (T9), editor (T9)
   │  ├─ practice/               ← compareOutput (+tests), workbench (T10)
   │  ├─ progress/               ← localProgressStore (T11), migrations, hooks
   │  └─ search/                 ← (T7) Pagefind client + dialog
   ├─ workers/python.worker.ts   ← (T9) Pyodide execution
   ├─ types/                     ← content.ts, progress.ts, runner.ts (contracts)
   ├─ lib/                       ← utils.ts (cn), schemas.ts (zod)
   ├─ generated/                 ← build output, git-ignored
   └─ styles/globals.css         ← Tailwind, Shiki dual theme, lesson prose
```

Refinement vs. the handoff tree: problems live in `src/content/problems/<slug>/` (typed `problem.ts` next to its `statement.mdx` and `editorial.mdx`) instead of `src/data/problems/`, so one folder holds everything about a problem.

### TypeScript contracts (source of truth: `src/types/*.ts`)

```ts
// content.ts
interface LessonFrontmatter {
  id: string; slug: string; title: string; summary: string
  category: 'fundamentals' | 'algorithms' | 'cheat-sheets'
  level: 'beginner' | 'intermediate' | 'advanced'
  order: number; prerequisites: string[]; learningObjectives: string[]; tags: string[]
  practiceProblems?: string[]; draft?: boolean
}
interface LessonEntry extends LessonFrontmatter { sourcePath: string; url: string }

interface SampleTest { input: string; expectedOutput: string; name?: string; explanation?: string }
type CompareMode = 'exact' | 'trim-lines' | 'tokens-per-line'
interface ProblemDefinition {
  id: string; slug: string; title: string; difficulty: 'easy' | 'medium' | 'hard'
  topicTags: string[]; constraints: string[]; inputSpec: string; outputSpec: string
  sampleTests: SampleTest[]; hints: string[]
  timeLimitMs?: number; compareMode?: CompareMode; starterCode?: string
  relatedLessonIds?: string[]; source?: string
}
interface ProblemEntry extends ProblemDefinition { statementPath: string; editorialPath?: string; url: string }
interface ContentManifest { generatedAt: string; lessons: LessonEntry[]; cheatSheets: LessonEntry[]; problems: ProblemEntry[] }

// progress.ts   (localStorage key "pyacademy:progress")
interface ProgressV1 {
  schemaVersion: 1
  completedLessonIds: string[]; attemptedProblemIds: string[]; solvedSampleProblemIds: string[]
  lastVisitedLesson?: { id: string; url: string; at: string }
  notes?: Record<string, string>; updatedAt: string
}
interface ProgressStore { load(): Progress; save(p: Progress): void; reset(): void; exportJson(): string; importJson(json: string): Progress }

// runner.ts
type RunnerStatus = 'idle' | 'loading' | 'ready' | 'running' | 'finished' | 'error' | 'stopped' | 'timeout'
interface RunRequest { code: string; stdin: string; timeLimitMs: number; maxOutputChars: number }
interface RunResult { status: 'finished' | 'error' | 'stopped' | 'timeout'; stdout: string; stderr: string; durationMs: number; truncated: boolean }
interface CodeRunner { readonly status: RunnerStatus; warmUp(): Promise<void>; run(r: RunRequest, cb?: RunCallbacks): Promise<RunResult>; stop(): void; dispose(): void }
```

---

## 5. Implementation tickets

Full tickets with files, definition of done and test commands: **`docs/TASKS.md`**.

Order (Pyodide is pulled forward because it is the biggest technical risk):

| # | Ticket | Phase |
|---|--------|-------|
| T0 | Scaffold: Vite/TS/React, Tailwind, router, MDX + Shiki pipeline, manifest, types, stubs | 1 ✅ |
| T1 | shadcn/ui init, base components, dark-mode toggle | 1 |
| T2 | Layout polish: lesson sidebar, prev/next, breadcrumbs, page titles, chunk-error boundary | 1 |
| T3 | MDX authoring kit: components + `docs/AUTHORING.md` | 2 |
| **T9** | **Pyodide worker + PyodideRunner + Playground (spike first)** | 3 (early) |
| T10 | Practice workbench: run samples, compare, hints, editorial | 3 |
| T7 | Search: Pagefind Node API index + search dialog | 2 |
| T11 | Progress store, lesson complete, progress page, export/import | 4 |
| T4 | Content: 5 fundamentals lessons | 2 |
| T5 | Content: 10 problems | 2 |
| T6 | Content: 4 cheat sheets + algorithms lessons | 2 |
| T8 | Problems list filters + badges | 2 |
| T12 | Accessibility/responsive QA + Playwright smoke tests | 4 |
| T13 | Render deploy + production smoke test | 4 |

---

## 6. Scaffold commands (already executed for T0) and install list

These produced the current folder. You don't need to re-run them — on your PC just run `npm ci`.

```bash
npm create vite@latest py-academy -- --template react-ts
npm install react-router @mdx-js/react zod clsx tailwind-merge class-variance-authority lucide-react @monaco-editor/react pyodide@314.0.7
npm install -D tailwindcss @tailwindcss/vite @tailwindcss/typography @mdx-js/rollup @types/mdx \
  remark-gfm remark-frontmatter remark-mdx-frontmatter @shikijs/rehype shiki pagefind vitest tsx gray-matter
npm pkg set dependencies.pyodide=314.0.7     # exact pin: CDN URL depends on it
```

**On your Windows PC (PowerShell) — first time:**

```powershell
cd C:\Users\ASUS\Desktop\Python\Py_Academy
node -v                      # must be >= 22.12 (Vite 8 requirement)
npm ci                       # installs exact locked versions
npm run check                # typecheck + lint + unit tests
npm run dev                  # http://localhost:5173

# T1 (needs internet access to ui.shadcn.com):
npx shadcn@latest init -t vite -b radix -p nova
npx shadcn@latest add button card badge tabs dialog command sheet separator scroll-area tooltip sonner

# GitHub
git init -b main
git add .
git commit -m "chore: scaffold PyAcademy (T0)"
gh repo create py-academy --private --source . --push     # or create on github.com and `git remote add origin …`
```

`npm run` scripts: `dev`, `build`, `preview`, `content`, `content:check`, `search:index`, `typecheck`, `lint`, `test`, `test:watch`, `check`.

---

## 7. Render checklist (Static Site, free)

**Before first deploy**
- [ ] `npm ci && npm run build` succeeds locally from a clean clone; `npm run preview` → open a nested URL and refresh.
- [ ] `.node-version` is committed (Node 22). Lockfile committed (`npm ci` requires it).
- [ ] Repo pushed to GitHub (`main`).

**Create the site** (Dashboard → New → Static Site → connect GitHub repo) — or New → Blueprint and select `render.yaml`:
- [ ] Branch: `main`
- [ ] Root directory: *(empty)*
- [ ] **Build command:** `npm ci && npm run build`
- [ ] **Publish directory:** `dist`
- [ ] Auto-deploy: On commit
- [ ] Environment variables: none needed. Optional `VITE_PYODIDE_INDEX_URL` only to self-host Pyodide. (Vite reads `VITE_*` at **build** time.)

**Redirects/Rewrites tab** (skip if using `render.yaml`, which already declares it):
- [ ] Source `/*` → Destination `/index.html` → Action **Rewrite** (not Redirect).
  Render does not apply rules to paths where a file exists, so `/assets/*`, `/pagefind/*` and worker chunks are served normally.

**Headers tab** (also in `render.yaml`):
- [ ] `/assets/*` → `Cache-Control: public, max-age=31536000, immutable`
- [ ] `/pagefind/*` → `Cache-Control: public, max-age=3600`
- [ ] Do **not** add COOP/COEP headers in MVP (would block CDN-loaded Pyodide/Monaco).

**Billing / limits**
- [ ] Check the workspace's included **outbound bandwidth** and **build pipeline minutes** on the Billing page (the free/Hobby bandwidth allowance reportedly dropped to 5 GB/month in Aug 2026). Decide whether to keep a payment method on file (overage is billed) or not (services can be suspended or builds disabled until the month resets).

**Production smoke test (after every deploy)**
- [ ] `/` loads; open `/learn/fundamentals/input-output` directly in a new tab and **hard refresh** → page renders (rewrite works).
- [ ] `/this-does-not-exist` → app's "Page not found".
- [ ] DevTools → Network on a lesson page: no `pyodide` / `monaco` requests.
- [ ] Playground: `print(sum(map(int, input().split())))` with stdin `3 4` → `7`. `while True: pass` → timeout, then a normal run works again.
- [ ] Problem page: Run samples → all pass for the editorial solution.
- [ ] Search "split" → results (after T7). `/pagefind/pagefind.js` returns JavaScript, not HTML.
- [ ] Mark a lesson complete → refresh → still complete.
- [ ] Test on a real phone (Android Chrome + iOS Safari): menu, lesson reading, playground textarea, run.
- [ ] Console: no errors on `/`, a lesson, a problem, the playground.
