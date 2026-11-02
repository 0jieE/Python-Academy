# Lesson writing style guide

How PyAcademy lessons should **sound**. `docs/AUTHORING.md` covers the
mechanics (frontmatter, components, `norun`); this guide covers the teaching.
The three model lessons are `fundamentals/loops.mdx`, `fundamentals/dicts-sets.mdx`
and `algorithms/recursion.mdx`. When in doubt, copy what they do.

**Reader:** a student preparing for a contest who may have written very little
code, studying alone on a phone. If a sentence would need a teacher standing
next to them to explain it, rewrite it.

---

## 1. Voice

- Write like a friendly, experienced instructor talking to one student. Use
  "you" and "we" ("Let's start with…", "Here's what happens…").
- Plain verbs, short paragraphs (2 to 4 sentences), active voice.
- Conversational but not childish: no "super easy!", no emoji, no jokes that
  get in the way.
- Don't write "simply", "just", "obviously" or "trivially". If it were obvious
  the student wouldn't need the lesson.
- No em dashes. Use a colon, a comma or a new sentence.
- Sentence case for headings.

## 2. Introducing a new idea

Follow this order every time a lesson introduces something new:

1. **A situation the student knows**: school, grades, a canteen, shopping,
   class elections, games. One sentence or a short paragraph.
2. **The idea in plain words**, still without the technical term.
3. **The term**, in bold, defined by what you just described:
   "That's **recursion**: a function that…".
4. **Code** that shows it.
5. **Output**, then **how it works**.

Use **one** everyday example per idea and then move to code. Don't stack
analogies, and don't stretch one past the point where it helps.

> ❌ A loop iterates over a sequence and executes its body for each element.
>
> ✅ Imagine your teacher asks you to print the names of all 40 students. You
> could write 40 `print` lines, but… A **loop** lets you write the instruction
> once, and Python repeats it for every student.

## 3. Jargon

- **Define every technical word the first time it appears in a lesson**, even
  if an earlier lesson defined it. Use one short clause:
  "a **list** (a group of values kept in order)".
- **Refresh earlier ideas the lesson depends on** with a one-line reminder and
  a link: "As a reminder from [Functions](/learn/fundamentals/functions):
  `return` sends a value back to whoever called the function."
- Don't explain a word with another undefined word ("Lists are Python's
  arrays").
- Don't use a topic before the lesson that teaches it. If you must (Big-O
  before the complexity lesson), give the plain meaning and point ahead:
  "Programmers write 'about `N` steps' as `O(N)`. You'll learn this properly
  in [time complexity](/learn/algorithms/complexity)."
- Use the standard plain meanings below so every lesson says the same thing.

| Term | Plain meaning to use |
| --- | --- |
| iteration | one round of a loop |
| loop body | the indented lines that get repeated |
| index / position | where an item sits, counting from 0 |
| running total (accumulator) | a variable that starts before the loop and grows each round |
| `O(1)`, `O(N)`, `O(N^2)` | about the same time whatever the size / about `N` steps / about `N × N` steps |
| immutable | can't be changed after it's created |
| hashable | can be used as a dictionary key (numbers, strings, tuples; not lists) |
| base case | an input small enough to answer directly, without recursing |
| call stack | the pile of function calls waiting for an answer |
| stable sort | items that tie keep their original order |
| pointer (two pointers) | just a variable holding a position in the list |
| monotonic | once the answer turns "yes" it stays "yes" (or the reverse) |
| state (DP) | the few numbers that describe one smaller version of the problem |

## 4. Code examples

For every important example:

1. **Goal**: one sentence saying what the program is trying to do, in terms of
   the situation ("We want the total profit and the number of good days").
2. **The code.** Prefer complete programs that run on their own; mark true
   fragments `norun` (see AUTHORING.md).
3. **Output**: a line `Output:` and a ```` ```text ```` block with the exact
   output, including the input example if it's a `RunnableExample`. Every
   output block must match what Python really prints (run it).
4. **How it works**: a short list, one item per important line or piece of
   syntax. Explain unfamiliar syntax (`+=`, `_`, `end=" "`, `@cache`,
   `*row`) the first time it appears in the lesson.
5. **Why**: why the code is written this way, and why the obvious alternative
   fails ("Why not `count[w] += 1`? Because…").
6. **Common mistake** where there is a typical one, as a `<Callout type="warning">`
   or in the Common mistakes list.

A bare `# answer` comment at the end of a line is not an explanation. It's fine
as a reminder **in addition to** the output block.

## 5. Walk-throughs

Anything with more than a couple of steps gets a walk-through with **small
values**: loops, `while`, recursion, binary search, two pointers, sliding
windows, BFS/DFS, DP tables, sorting with keys.

- **Trace table** (preferred for loops): one row per round, one column per
  variable, showing the value **after** that round.

  | Round | `x` | `total` after |
  | --- | --- | --- |
  | 1 | `3` | `3` |
  | 2 | `8` | `11` |

- **Call tree** for recursion and backtracking: a ```` ```text ```` block with
  `├─` / `└─` branches, then the answers travelling back up.
- **Filled-in table** for DP: show the actual array or grid for a small input.
- Keep inputs tiny (3 to 6 values) so the whole trace fits on a phone screen.
- Keep ```` ```text ```` traces under about 36 characters wide, or they scroll
  sideways at 360 px.

## 6. Explain why, and answer the questions students will ask

- After every rule, say **why** it's true or why it matters. "Running totals
  start before the loop" is a rule; "otherwise it's reset to 0 every round and
  you print only the last number" is the reason.
- Anticipate the beginner's next question and answer it in the text: "Why does
  `range` start at 0?", "What if `n` is `0`?", "So why use recursion at all?"
- Point out edge cases that hidden tests check (empty input, 0, one item,
  equal values, the largest `N`), and show what goes wrong.
- Don't trade accuracy for simplicity. "On average" stays on `O(1)` dict
  lookups, with a sentence explaining it.

## 7. Lesson sections

The section order from AUTHORING.md doesn't change. What each one should do:

- **Why this matters**: open with a situation, not a definition. End with why
  it matters in contests (speed, correctness, a common problem type).
- **KeyIdea**: one or two sentences the student should remember a week later.
- **Explanation sections**: one idea each, following section 2 and 4 above.
- **Common mistakes**: each bullet starts with the mistake in bold, then says
  what goes wrong and how to fix it.
- **Competition use**: short, but every tip says when to use it and why.
- **Exercises**: keep the task and difficulty. Each `<Answer>` gets 1 to 4
  sentences after the code: the key idea, and a tiny worked example or an edge
  case.
- **Next topic**: a link and a few words.

Length: a lesson can grow to about twice its old length. Cut any sentence that
doesn't help the student understand or avoid a mistake.

## 8. Review checklist

Before a lesson is published, check:

- [ ] It opens with a relatable situation, not a definition.
- [ ] Every technical term is explained in plain words where it first appears.
- [ ] Earlier concepts the lesson relies on get a one-line refresher.
- [ ] Every main example has a goal, output, line-by-line explanation and a
      reason why.
- [ ] Every multi-step process has a trace with small values.
- [ ] Every output block matches real Python output.
- [ ] Each exercise answer explains the idea, not just the code.
- [ ] No em dashes, no "simply/just/obviously", sentence-case headings.
- [ ] Topics, objectives, exercises and difficulty are unchanged.
- [ ] `npm run content:check` passes and every runnable block runs.
