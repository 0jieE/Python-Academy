# PyAcademy

Self-paced Python lessons, cheat sheets and practice problems for students
preparing for programming competitions. Static site: React + Vite + TypeScript,
deployed on Render. Python runs in the browser with Pyodide.

**Live:** https://py-academy.onrender.com/ (Render Static Site, free plan; built
with Node 22 from `.node-version`, settings in `render.yaml`). Installable as an
app on phones and works offline after the first visit.

## Quick start

```bash
npm ci          # Node >= 22.12
npm run dev     # http://localhost:5173
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Rebuild content manifest, start dev server |
| `npm run build` | Validate content → typecheck → build `dist/` → search index → service worker |
| `npm run preview` | Serve `dist/` locally (use this to test search and the Python runner) |
| `npm run check` | Typecheck + lint + unit tests |
| `npm run content:check` | Validate lesson frontmatter and problem files only |
| `npm run test:e2e` | Playwright tests against `npm run preview` (after a build) |
| `BASE_URL=https://py-academy.onrender.com npx playwright test e2e/smoke.spec.ts e2e/runner.spec.ts e2e/pwa.spec.ts` | Same tests against the live site |

## Adding content

- Lesson: copy `src/content/fundamentals/input-output.mdx`, change the frontmatter (`id` must be unique and never change).
- Problem: copy the folder `src/content/problems/sum-of-two/` and edit `problem.ts`, `statement.mdx`, `editorial.mdx`.
- Roadmap order: `src/data/roadmap.ts`.

Run `npm run content:check` after editing.

## Docs

- `docs/PLAN.md` — architecture, risks, decisions, Render checklist
- `docs/WRITING_STYLE.md` — how lessons should explain things (with `docs/WRITING_AUDIT.md`)
- `docs/TASKS.md` — implementation tickets T0–T13
- `CLAUDE.md` — rules for Claude Code

## Limitations

Progress is stored only in the student's browser. The in-browser runner and
sample tests are a learning aid, not an official contest judge.
