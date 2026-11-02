/**
 * Recommended learning order shown on the home page.
 * Lesson IDs that don't exist yet are shown as "coming soon" — this lets the
 * coach publish the full roadmap before every lesson is written.
 */
export interface RoadmapStage {
  id: string
  title: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced'
  /** Ordered lesson IDs (frontmatter `id`). */
  lessonIds: string[]
}

export const roadmap: RoadmapStage[] = [
  {
    id: 'stage-1',
    title: 'Stage 1 · Python fundamentals',
    description: 'Read input, compute, print exactly what the judge expects.',
    level: 'beginner',
    lessonIds: [
      'fund-input-output',
      'fund-operators',
      'fund-conditionals',
      'fund-loops',
      'fund-strings',
      'fund-lists',
      'fund-functions',
      'fund-dicts-sets',
    ],
  },
  {
    id: 'stage-2',
    title: 'Stage 2 · Core contest techniques',
    description: 'Math, counting, sorting and the classic O(N) / O(N log N) patterns.',
    level: 'intermediate',
    lessonIds: [
      'algo-complexity',
      'algo-math-gcd-primes-mod',
      'algo-counting',
      'algo-sorting',
      'algo-binary-search',
      'algo-prefix-sums',
      'algo-two-pointers',
      'algo-sliding-window',
      'algo-greedy',
      'algo-recursion',
    ],
  },
  {
    id: 'stage-3',
    title: 'Stage 3 · Next level (after V1)',
    description: 'Graphs and dynamic programming.',
    level: 'advanced',
    lessonIds: ['algo-bfs-dfs', 'algo-dp-intro'],
  },
]
