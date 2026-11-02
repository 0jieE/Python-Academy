import type { ProblemDefinition } from '../../../types/content.ts'

const problem: ProblemDefinition = {
  id: 'prob-ribbon-cutting',
  slug: 'ribbon-cutting',
  title: 'Ribbon Cutting',
  difficulty: 'hard',
  topicTags: ['binary-search', 'math'],
  constraints: ['1 ≤ N ≤ 2·10^5', '1 ≤ K ≤ 10^9', '1 ≤ a_i ≤ 10^9'],
  inputSpec: 'The first line has N and K. The second line has N integers a_1 … a_N: the lengths of the ribbons.',
  outputSpec: 'Print the largest whole-number length L such that at least K pieces of length exactly L can be cut. Print 0 if even L = 1 gives fewer than K pieces.',
  sampleTests: [
    {
      name: 'Sample 1',
      input: '3 7\n10 15 8\n',
      expectedOutput: '4\n',
      explanation: 'With L = 4: 2 + 3 + 2 = 7 pieces. With L = 5: 2 + 3 + 1 = 6, not enough.',
    },
    {
      name: 'Impossible',
      input: '2 30\n5 6\n',
      expectedOutput: '0\n',
      explanation: 'Edge case: the total length is 11, so even pieces of length 1 give only 11.',
    },
    {
      name: 'One huge ribbon',
      input: '1 1\n1000000000\n',
      expectedOutput: '1000000000\n',
      explanation: 'Edge case: the answer can be as big as the longest ribbon.',
    },
  ],
  hints: [
    'If length L works, every shorter length works too. If L fails, every longer length fails.',
    'That makes the answer a "last true" position — binary search on L between 1 and max(a).',
    'For a fixed L, the number of pieces is the sum of a_i // L.',
  ],
  timeLimitMs: 3000,
  compareMode: 'tokens-per-line',
  starterCode: 'import sys\n\ndata = sys.stdin.buffer.read().split()\n',
  relatedLessonIds: ['algo-complexity', 'fund-loops'],
  source: 'Original problem (classic "binary search on the answer" pattern)',
}

export default problem
