# Authoring guide

How to write lessons, cheat sheets and practice problems for PyAcademy.
Everything lives in `src/content/`. After any change run:

```bash
npm run content:check   # validates every frontmatter block and problem file
npm run dev             # http://localhost:5173 — see the page
```

`content:check` prints the **file and the field** for every problem, e.g.

```
✖ Content validation failed (1):
  - /src/content/fundamentals/loops.mdx: level: Invalid option: expected one of "beginner"|"intermediate"|"advanced"
```

---

## 1. Lessons and cheat sheets

| Kind | Folder | URL |
| --- | --- | --- |
| Fundamentals lesson | `src/content/fundamentals/<slug>.mdx` | `/learn/fundamentals/<slug>` |
| Algorithms lesson | `src/content/algorithms/<slug>.mdx` | `/learn/algorithms/<slug>` |
| Cheat sheet | `src/content/cheat-sheets/<slug>.mdx` | `/cheat-sheets/<slug>` |

Copy `src/content/fundamentals/input-output.mdx` as a starting point.

### Frontmatter

```yaml
---
id: fund-loops              # stable ID — NEVER change it once published (progress depends on it)
slug: loops                 # URL segment; may change
title: Loops
summary: Repeat work with for and while, and loop over input lines.
category: fundamentals      # must match the folder: fundamentals | algorithms | cheat-sheets
level: beginner             # beginner | intermediate | advanced
order: 40                   # sort order inside the category (10, 20, 30… leaves gaps)
prerequisites: [fund-input-output]   # lesson IDs (must exist)
learningObjectives:
  - Loop a fixed number of times with range()
  - Loop over a list
tags: [loops, range, for, while]     # used by search
practiceProblems: [sum-of-two]       # optional: problem slugs (must exist)
draft: false                         # optional: true hides the page from the site and search
---
```

| Field | Required | Rules |
| --- | --- | --- |
| `id` | yes | kebab-case, unique across lessons, cheat sheets and problems. Convention: `fund-…`, `algo-…`, `cs-…`. **Never change.** |
| `slug` | yes | kebab-case, unique inside its category |
| `title`, `summary` | yes | non-empty; summary shows on cards and in search |
| `category` | yes | must equal the folder name |
| `level` | yes | `beginner`, `intermediate` or `advanced` |
| `order` | yes | integer ≥ 0; prev/next links follow it |
| `prerequisites` | no | list of existing lesson IDs |
| `learningObjectives` | no | shown in "You will learn to" |
| `tags` | no | lower-case words for search |
| `practiceProblems` | no | list of existing problem slugs |
| `draft` | no | `true` hides it everywhere |

To put a lesson on the home roadmap, add `{ id: '<lesson id>', title: '<title>' }`
to a stage in `src/data/roadmap.ts`. Items whose lesson doesn't exist yet show
as "<title> · coming soon".

Link to other pages with normal Markdown links and a site path, e.g.
`[Binary Search](/learn/algorithms/binary-search)` — they navigate without a
page reload.

### Lesson template (sections, in this order)

```mdx
## Why this matters        ← one paragraph: where this shows up in contests
<KeyIdea>…</KeyIdea>       ← the one thing to remember (optional)
## <Explanation sections>  ← short text + code; 1 idea per section
## Common mistakes         ← bullet list of real beginner bugs
## Competition use         ← how/when to use it under time pressure
## Exercises               ← at least 3 <Exercise> blocks with <Answer>
## Next topic              ← one line pointing to the next lesson
```

Keep paragraphs short, use `N`, `M` for sizes, and write code that reads from
stdin the way a judge feeds it.

### Components (available in every MDX file, no import needed)

**Callout** — a side note. `type`: `note` (default), `tip`, `warning`, `todo`.

```mdx
<Callout type="warning">
`input()` keeps no trailing newline, but `sys.stdin.readline()` does.
</Callout>
```

**KeyIdea** — the main takeaway. Optional `title`.

```mdx
<KeyIdea>
Sort first, then one pass with two pointers is O(N log N).
</KeyIdea>
```

**Exercise** + **Answer** — a task with a collapsed solution.

````mdx
<Exercise title="Largest number">
Read `N`, then `N` integers, and print the largest.

<Answer>

```python
n = int(input())
print(max(map(int, input().split())))
```

</Answer>
</Exercise>
````

**Complexity** — Big-O badges. Plain text, no LaTeX.

```mdx
Sorting costs <Complexity time="O(N log N)" space="O(N)" />.
```

**RunnableExample** — a code block with an "Open in Playground" button that
copies the code and stdin into the playground. Python does **not** load on the
lesson page; it only loads when the student opens the playground.

````mdx
<RunnableExample title="Sum of a line" stdin="1 2 3">

```python
print(sum(map(int, input().split())))
```

</RunnableExample>
````

Multi-line stdin uses a JavaScript string: `stdin={"3\n10 20 30\n"}`.

> **Blank lines matter.** A fenced code block inside a component needs an
> empty line after the opening tag and before the closing tag, as above.
> Without them MDX treats the code as plain text.

### Escaping `<`, `{` and friends

MDX is Markdown **plus JSX**, so two characters are special in normal text:

| You want | Write | Why |
| --- | --- | --- |
| `a < b` in a sentence | `` `a < b` `` (inline code) or `a &lt; b` | a bare `<` starts a JSX tag |
| `{x}` in a sentence | `` `{x}` `` or `\{x\}` | `{` starts a JavaScript expression |
| `<name>` as a placeholder | `` `<name>` `` | same as above |
| HTML comments | `{/* comment */}` | `<!-- -->` is not allowed in MDX |

Inside fenced code blocks and inline code everything is literal — no escaping.
Prefer `≤` / `≥` in prose (`1 ≤ N ≤ 10^5`).

---

## 2. Practice problems

One folder per problem: `src/content/problems/<slug>/`

```
src/content/problems/two-sum-sorted/
├─ problem.ts       ← metadata + samples (typed, validated)
├─ statement.mdx    ← the story / task text (no frontmatter)
└─ editorial.mdx    ← optional: explanation + reference solution + complexity
```

The folder name **is** the slug. URL: `/problems/<slug>`.

### `problem.ts`

```ts
import type { ProblemDefinition } from '../../../types/content.ts'

const problem: ProblemDefinition = {
  id: 'prob-two-sum-sorted',          // never change
  slug: 'two-sum-sorted',             // must equal the folder name
  title: 'Two Sum (Sorted)',
  difficulty: 'medium',               // easy | medium | hard
  topicTags: ['two-pointers', 'arrays'],
  constraints: ['2 ≤ N ≤ 2·10^5', '-10^9 ≤ a_i ≤ 10^9'],
  inputSpec: 'First line N and T. Second line: N integers in non-decreasing order.',
  outputSpec: 'Print YES if two different positions sum to T, otherwise NO.',
  sampleTests: [
    { name: 'Sample 1', input: '4 9\n1 3 5 8\n', expectedOutput: 'YES\n' },
    { name: 'No pair', input: '3 100\n1 2 3\n', expectedOutput: 'NO\n', explanation: 'Edge case: no pair exists.' },
  ],
  hints: ['The array is sorted.', 'Start one pointer at each end.'],
  timeLimitMs: 2000,                  // in-browser learning aid only, not a judge
  compareMode: 'tokens-per-line',     // default; or 'trim-lines' | 'exact'
  starterCode: 'import sys\n\ndata = sys.stdin.read().split()\n',
  relatedLessonIds: ['algo-two-pointers'],
  source: 'Original problem',         // or "Adapted from …" with attribution
}

export default problem
```

Rules:
- At least **2 samples**, including one edge case. End `input` and
  `expectedOutput` with `\n`.
- CRLF vs LF and trailing newlines never matter when comparing. With the
  default `tokens-per-line`, extra spaces inside a line don't matter either.
- **Run the editorial solution against every sample** on the problem page
  ("Run samples") before publishing.
- Don't copy official contest statements word for word. Write an original
  problem or adapt it and fill in `source`.

### `editorial.mdx`

Explain the idea, give a clean reference solution, and state the complexity.
**The last ```python block in the editorial is treated as the reference
solution** — the editorial check runs it against every sample, so keep partial
snippets above it and the full program last.

```mdx
## Idea
…

```python
…
```

**Complexity:** <Complexity time="O(N)" space="O(1)" />
```

---

## 3. Checklist before you push

- [ ] `npm run content:check` passes
- [ ] Page looks right in `npm run dev` (light and dark theme, narrow window)
- [ ] Problem: editorial passes all samples with "Run samples"
      (or automatically: `npm run build && npm run test:e2e -- --grep @slow`)
- [ ] New lesson added to `src/data/roadmap.ts` (if it belongs on the roadmap)
- [ ] `npm run check && npm run build` pass
