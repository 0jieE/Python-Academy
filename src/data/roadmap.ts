/**
 * Recommended learning order shown on the home page.
 * Items whose lesson doesn't exist yet are shown as "<title> · coming soon" —
 * this lets the coach publish the full roadmap before every lesson is written.
 * Once the lesson exists, the page shows the lesson's own title instead.
 */
export interface RoadmapItem {
  /** Lesson ID (frontmatter `id`). */
  id: string
  /** Display title, used while the lesson is still "coming soon". */
  title: string
}

export interface RoadmapStage {
  id: string
  title: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced'
  /** Lessons in learning order. */
  items: RoadmapItem[]
}

export const roadmap: RoadmapStage[] = [
  {
    id: 'stage-1',
    title: 'Stage 1 · Python fundamentals',
    description: 'Read input, compute, print exactly what the judge expects.',
    level: 'beginner',
    items: [
      { id: 'fund-input-output', title: 'Input and Output' },
      { id: 'fund-operators', title: 'Operators and Expressions' },
      { id: 'fund-conditionals', title: 'Conditionals' },
      { id: 'fund-loops', title: 'Loops' },
      { id: 'fund-strings', title: 'Strings' },
      { id: 'fund-lists', title: 'Lists' },
      { id: 'fund-functions', title: 'Functions' },
      { id: 'fund-dicts-sets', title: 'Dicts and Sets' },
    ],
  },
  {
    id: 'stage-2',
    title: 'Stage 2 · Core contest techniques',
    description: 'Math, counting, sorting and the classic O(N) / O(N log N) patterns.',
    level: 'intermediate',
    items: [
      { id: 'algo-complexity', title: 'Time Complexity' },
      { id: 'algo-math-gcd-primes-mod', title: 'Math: GCD, Primes and Modulo' },
      { id: 'algo-counting', title: 'Counting' },
      { id: 'algo-sorting', title: 'Sorting' },
      { id: 'algo-binary-search', title: 'Binary Search' },
      { id: 'algo-prefix-sums', title: 'Prefix Sums' },
      { id: 'algo-two-pointers', title: 'Two Pointers' },
      { id: 'algo-sliding-window', title: 'Sliding Window' },
      { id: 'algo-greedy', title: 'Greedy' },
      { id: 'algo-recursion', title: 'Recursion' },
    ],
  },
  {
    id: 'stage-3',
    title: 'Stage 3 · Next level (after V1)',
    description: 'Graphs and dynamic programming.',
    level: 'advanced',
    items: [{ id: 'algo-bfs-dfs', title: 'BFS and DFS' }, { id: 'algo-dp-intro', title: 'Dynamic Programming' }],
  },
]
