import type { ProblemDefinition } from '../../../types/content.ts'

const problem: ProblemDefinition = {
  id: 'prob-two-sum-sorted',
  slug: 'two-sum-sorted',
  title: 'Two Sum (Sorted)',
  difficulty: 'medium',
  topicTags: ['two-pointers', 'arrays', 'sorting'],
  constraints: ['2 ≤ N ≤ 2·10^5', '-10^9 ≤ a_i, T ≤ 10^9', 'a_1 ≤ a_2 ≤ … ≤ a_N'],
  inputSpec: 'The first line has N and T. The second line has N integers in non-decreasing order.',
  outputSpec: 'Print YES if two numbers at different positions add up to T, otherwise print NO.',
  sampleTests: [
    { name: 'Sample 1', input: '4 9\n1 3 5 8\n', expectedOutput: 'YES\n', explanation: '1 + 8 = 9.' },
    { name: 'No pair', input: '3 100\n1 2 3\n', expectedOutput: 'NO\n' },
    {
      name: 'Equal values',
      input: '2 10\n5 5\n',
      expectedOutput: 'YES\n',
      explanation: 'Edge case: the two 5s are at different positions, so they count.',
    },
    {
      name: 'Same element twice',
      input: '3 10\n1 5 8\n',
      expectedOutput: 'NO\n',
      explanation: 'Edge case: 5 + 5 = 10, but there is only one 5.',
    },
  ],
  hints: [
    'Checking every pair is O(N²) — about 2·10^10 pairs for the largest input.',
    'Put one pointer at the smallest number and one at the largest. If their sum is too small, which pointer should move?',
  ],
  timeLimitMs: 2000,
  compareMode: 'tokens-per-line',
  starterCode: 'import sys\n\ndata = sys.stdin.buffer.read().split()\n',
  relatedLessonIds: ['algo-two-pointers', 'algo-sorting', 'fund-dicts-sets'],
  source: 'Original problem',
}

export default problem
