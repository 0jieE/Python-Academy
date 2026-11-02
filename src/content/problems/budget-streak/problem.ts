import type { ProblemDefinition } from '../../../types/content.ts'

const problem: ProblemDefinition = {
  id: 'prob-budget-streak',
  slug: 'budget-streak',
  title: 'Budget Streak',
  difficulty: 'medium',
  topicTags: ['sliding-window', 'two-pointers', 'arrays'],
  constraints: ['1 ≤ N ≤ 2·10^5', '1 ≤ c_i ≤ 10^9', '0 ≤ B ≤ 10^15'],
  inputSpec: 'The first line has N and B. The second line has N positive integers c_1 … c_N: the cost of each day.',
  outputSpec: 'Print the largest number of consecutive days whose total cost is at most B. Print 0 if no single day fits.',
  sampleTests: [
    {
      name: 'Sample 1',
      input: '6 10\n2 3 1 5 4 1\n',
      expectedOutput: '3\n',
      explanation: 'Days 1–3 cost 2 + 3 + 1 = 6. No 4 consecutive days cost 10 or less (the cheapest four cost 11).',
    },
    { name: 'Nothing fits', input: '3 2\n5 3 4\n', expectedOutput: '0\n', explanation: 'Edge case: every single day costs more than B.' },
    { name: 'Everything fits', input: '4 100\n1 1 1 1\n', expectedOutput: '4\n' },
  ],
  hints: [
    'Trying every start and end is O(N²).',
    'Keep a window [left, right] and its total. Move right one step at a time.',
    'While the total is over budget, move left forward. All costs are positive, so shrinking always lowers the total.',
  ],
  timeLimitMs: 2000,
  compareMode: 'tokens-per-line',
  starterCode: 'import sys\n\ndata = sys.stdin.buffer.read().split()\n',
  relatedLessonIds: ['algo-sliding-window', 'algo-two-pointers'],
  source: 'Original problem',
}

export default problem
