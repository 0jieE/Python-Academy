# PyAcademy

Self-paced Python lessons, cheat sheets and practice problems for students
preparing for programming competitions. Static site: React + Vite + TypeScript,
deployed on Render. Python runs in the browser with Pyodide.

## Quick start

```bash
npm ci          # Node >= 22.12
npm run dev     # http://localhost:5173
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Rebuild content manifest, start dev server |
| `npm run build` | Validate content → typecheck → build `dist/` → search index |
| `npm run preview` | Serve `dist/` locally (use this to test search and the Python runner) |
| `npm run check` | Typecheck + lint + unit tests |
| `npm run content:check` | Validate lesson frontmatter and problem files only |

## Adding content

- Lesson: copy `src/content/fundamentals/input-output.mdx`, change the frontmatter (`id` must be unique and never change).
- Problem: copy the folder `src/content/problems/sum-of-two/` and edit `problem.ts`, `statement.mdx`, `editorial.mdx`.
- Roadmap order: `src/data/roadmap.ts`.

Run `npm run content:check` after editing.

## Docs

- `docs/PLAN.md` — architecture, risks, decisions, Render checklist
- `docs/TASKS.md` — implementation tickets T0–T13
- `CLAUDE.md` — rules for Claude Code

## Limitations

Progress is stored only in the student's browser. The in-browser runner and
sample tests are a learning aid, not an official contest judge.
