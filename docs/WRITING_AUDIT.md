# Lesson writing audit (2026-11-03)

An audit of how the 20 lessons **explain** things, not of their topics or
order, which stay as they are. Rewrites follow `docs/WRITING_STYLE.md`.

## Summary

The lessons are accurate and well organised, but they read like reference
pages. They state rules once, show code with a final `# answer` comment, and
expect the student to fill in the rest. Before the rewrite, **no lesson had a
step-by-step trace** of how variables change.

Score = how well a beginner could learn the lesson alone (5 = fully).

| Lesson | Score | Biggest problem |
| --- | --- | --- |
| input-output | 3 | Lesson 1 uses `map`, `split`, `for _ in range`, slicing, `print(*)` and Big-O without line-by-line explanation |
| operators | 3 | Floor division on negatives, the ceiling trick and "modulo 10^9+7" are rules with no reason or worked example |
| conditionals | 3 | Refers to boundary values "89, 90 and 100" from a grading example that is never shown |
| loops | 3 | No loop is traced; a Big-O table appears in lesson 4 |
| strings | 3 | "Immutable" and "in place" stated, not explained; the Caesar one-liner isn't broken down |
| lists | 3 | Cost table before the complexity lesson; `b = a` aliasing has no example |
| functions | 3 | Scope, mutable defaults, lambda and recursion squeezed into 1 to 3 sentences each |
| dicts-sets | 3 | No everyday picture; `count.get(w, 0) + 1` never traced |
| complexity | 2 | Big-O in one abstract sentence; `log N` never explained; table names untaught algorithms |
| gcd-primes-modulo | 2 | Euclid, the √N bound, the sieve slice and modular inverse stated, none worked through |
| counting | 3 | `c·(c−1)/2` has no handshake picture; no trace of the "earlier values" trick |
| sorting | 3 | `key=` and "sort twice because it's stable" never show the keys or the list in between |
| binary-search | 2 | No lo/mid/hi trace; "monotonic" and "round up or it loops forever" unexplained |
| prefix-sums | 3 | The hardest part, `seen[0] = 1` for subarray sums, has no walk-through |
| two-pointers | 3 | Good "why", but no table of `i`, `j` and the sum moving |
| sliding-window | 3 | "Valid window" is abstract; no trace on `abcabcbb` |
| greedy | 2 | The exchange argument is proof language with no concrete swap |
| recursion | 2 | No call-by-call trace, no subset tree; "hashable" and `@` unexplained |
| bfs-dfs | 2 | Queue, stack, V and E undefined; no round-by-round queue trace |
| dp-intro | 2 | No filled-in table; knapsack's "loop downwards" justified in one parenthesis |

## Patterns across the curriculum

1. **Big-O before the complexity lesson**: input-output, operators, loops, lists, dicts-sets.
2. **Contest idioms as unexplained boilerplate**: `map(int, input().split())`, `_`, `print(*…)`, `sum(1 for …)`, `@cache`.
3. **Algorithms with a final comment instead of a trace**: loops, two-pointers, binary-search, recursion, bfs-dfs, dp-intro.
4. **Jargon defined in passing or not at all**: immutable, hashable, stable, monotonic, short-circuit.
5. **Tables standing in for explanation**: conditionals, loops, complexity, binary-search, sorting, gcd-primes-modulo.
6. **Topics used before they are taught**: complexity names heaps and DP; lists mentions deque; sorting mentions two pointers.
7. **"Why" squeezed into one clause**: gcd-primes-modulo, greedy, counting, dp-intro.
8. **Exercise answers are bare code**: strings, greedy, dp-intro, bfs-dfs.

Suggested order for the remaining rewrites: complexity, binary-search,
dp-intro, input-output, gcd-primes-modulo, then greedy and bfs-dfs, then the
rest in roadmap order.

## Before and after (three model lessons)

The full rewrites are in `fundamentals/loops.mdx`,
`fundamentals/dicts-sets.mdx` and `algorithms/recursion.mdx`. Topics,
objectives, exercises and difficulty are unchanged; every output block was
checked against real Python output.

### Loops: the `while` loop

**Before**

> `while` repeats as long as its condition is true — useful when you don't
> know the number of steps in advance:
>
> ```python
> n = 12345
> digits = 0
> while n > 0:
>     n //= 10
>     digits += 1
> print(digits)   # 5
> ```

**After** (shortened)

> A `for` loop is perfect when you know how many rounds you need: one per
> student, one per number. Sometimes you don't know that in advance. You just
> know when to **stop**. That's what `while` is for.
>
> *(same code, then the real output, then:)*
>
> Before every round, Python checks `n > 0`… `n //= 10` divides by 10 and drops
> the remainder, which chops off the last digit. Each chop is one digit counted:
>
> | Check `n > 0` | `n` after `n //= 10` | `digits` |
> | --- | --- | --- |
> | `12345 > 0` true | `1234` | `1` |
> | … | … | … |
> | `0 > 0` false | loop ends | |
>
> A beginner question worth asking: what if `n` is `0`? … `0` has one digit.
> Small edge cases like this are exactly what hidden contest tests check.

**What changed:** the reason to use `while` comes from the contrast with
`for`; `//=` gets a refresher; a trace replaces `# 5`; an edge case is
anticipated.

### Dicts and Sets: counting

**Before**

> The most common dict job in contests:
>
> *(code with `count[w] = count.get(w, 0) + 1`, no output, no explanation)*

**After** (shortened)

> Counting how often each thing appears is the most common dict job in
> contests. Back to the class election…
>
> The key line is `count[w] = count.get(w, 0) + 1`. Read it from the right:
> "look up the current count for `w`, using `0` if we've never seen it, add 1,
> and store the result back". Here is the dict growing, word by word:
>
> | Round | `w` | `count.get(w, 0)` | `count` after |
> | --- | --- | --- | --- |
> | 1 | `"red"` | `0` (new) | `{"red": 1}` |
> | … | … | … | … |
>
> Why not just write `count[w] += 1`? Because the first time a word appears it
> isn't in the dict yet, so `count[w]` would crash with a `KeyError`.

**What changed:** an everyday frame (class election, record book, attendance
sheet); the key line read aloud; a trace; the "why not the simpler way"
question answered. "Keys must be immutable" became a note explaining **why**
lists can't be keys.

### Recursion: the first example

**Before**

> *(the `total` function, then:)* Each call waits for the call it made. Python
> keeps these waiting calls on the **call stack**; `total([4, 1, 5])` is 4
> calls deep.

**After** (shortened)

> You're standing somewhere in a long line at the school canteen and want to
> know your position… the person at the very front simply says "1". That answer
> travels back down the line.
>
> *(code, output, line-by-line, then:)*
>
> ```text
> total(i=0) = 4 + total(i=1)
> total(i=1) = 1 + total(i=2)
> total(i=2) = 5 + total(i=3)
> total(i=3) = 0      ← base case
> ```
>
> Then the answers travel back up, just like in the canteen line…

**What changed:** one analogy that carries through base case, recursive step
and the call stack; a call-by-call trace; a subset call tree for backtracking;
a `fib(5)` call tree showing the repeated work that `@cache` removes;
"hashable" explained by linking it to dictionary keys.
