import type { ProblemDefinition } from '../../../types/content.ts'

const problem: ProblemDefinition = {
  id: 'prob-range-sum-queries',
  slug: 'range-sum-queries',
  title: 'Range Sum Queries',
  difficulty: 'medium',
  topicTags: ['prefix-sums', 'arrays', 'queries'],
  constraints: ['1 ≤ N, Q ≤ 2·10^5', '-10^9 ≤ a_i ≤ 10^9', '1 ≤ l ≤ r ≤ N'],
  inputSpec: 'The first line has N and Q. The second line has N integers a_1 … a_N. Each of the next Q lines has two integers l and r.',
  outputSpec: 'For each query print a_l + a_(l+1) + … + a_r on its own line.',
  sampleTests: [
    {
      name: 'Sample 1',
      input: '5 3\n1 2 3 4 5\n1 5\n2 4\n3 3\n',
      expectedOutput: '15\n9\n3\n',
      explanation: '1+2+3+4+5 = 15, 2+3+4 = 9, and a range of one element is just that element.',
    },
    {
      name: 'Negative numbers',
      input: '3 2\n-1 -2 -3\n1 1\n1 3\n',
      expectedOutput: '-1\n-6\n',
      explanation: 'Edge case: values can be negative, and l can equal r.',
    },
  ],
  hints: [
    'Adding up each range with a loop is O(N) per query — up to 4·10^10 steps in total. Too slow.',
    'Precompute prefix[i] = a_1 + … + a_i once. Then the sum of l..r is prefix[r] − prefix[l − 1].',
  ],
  timeLimitMs: 2000,
  compareMode: 'tokens-per-line',
  starterCode: 'import sys\n\ndata = sys.stdin.buffer.read().split()\n',
  relatedLessonIds: ['algo-prefix-sums'],
  source: 'Original problem',
}

export default problem
