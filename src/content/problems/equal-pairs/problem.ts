import type { ProblemDefinition } from '../../../types/content.ts'

const problem: ProblemDefinition = {
  id: 'prob-equal-pairs',
  slug: 'equal-pairs',
  title: 'Equal Pairs',
  difficulty: 'medium',
  topicTags: ['counting', 'dict', 'math'],
  constraints: ['1 ≤ N ≤ 2·10^5', '1 ≤ a_i ≤ 10^9'],
  inputSpec: 'The first line has N. The second line has N integers a_1 … a_N.',
  outputSpec: 'Print the number of pairs of positions i < j with a_i = a_j.',
  sampleTests: [
    {
      name: 'Sample 1',
      input: '6\n1 2 1 3 1 2\n',
      expectedOutput: '4\n',
      explanation: 'The three 1s make 3 pairs, the two 2s make 1 pair: 3 + 1 = 4.',
    },
    { name: 'All different', input: '3\n5 6 7\n', expectedOutput: '0\n', explanation: 'Edge case: no value repeats.' },
    { name: 'All the same', input: '4\n7 7 7 7\n', expectedOutput: '6\n', explanation: '4 equal values make 4 · 3 / 2 = 6 pairs.' },
  ],
  hints: [
    'Comparing every pair is O(N²) — about 2·10^10 checks.',
    'Count how many times each value appears.',
    'A value that appears c times forms c · (c − 1) / 2 pairs.',
  ],
  timeLimitMs: 2000,
  compareMode: 'tokens-per-line',
  starterCode: 'import sys\n\ndata = sys.stdin.buffer.read().split()\n',
  relatedLessonIds: ['algo-counting', 'fund-dicts-sets'],
  source: 'Original problem',
}

export default problem
