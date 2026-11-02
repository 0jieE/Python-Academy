import type { ProblemDefinition } from '../../../types/content.ts'

const problem: ProblemDefinition = {
  id: 'prob-sum-of-evens',
  slug: 'sum-of-evens',
  title: 'Sum of Evens',
  difficulty: 'easy',
  topicTags: ['loops', 'math'],
  constraints: ['1 ≤ N ≤ 10^5', '-10^9 ≤ a_i ≤ 10^9'],
  inputSpec: 'The first line has an integer N. The second line has N integers a_1 … a_N.',
  outputSpec: 'Print the sum of the even numbers. Print 0 if there are none.',
  sampleTests: [
    { name: 'Sample 1', input: '5\n1 2 3 4 5\n', expectedOutput: '6\n', explanation: '2 + 4 = 6.' },
    { name: 'No even numbers', input: '3\n1 3 5\n', expectedOutput: '0\n', explanation: 'Edge case: the sum of nothing is 0.' },
    { name: 'Negatives and zero', input: '4\n-2 -3 10 0\n', expectedOutput: '8\n', explanation: '-2, 10 and 0 are even: -2 + 10 + 0 = 8.' },
  ],
  hints: ['A number x is even when x % 2 == 0. This also works for negative numbers in Python.', 'Start a total at 0 and add to it inside a for loop.'],
  timeLimitMs: 2000,
  compareMode: 'tokens-per-line',
  starterCode: 'n = int(input())\nnums = list(map(int, input().split()))\n',
  relatedLessonIds: ['fund-loops'],
  source: 'Original problem',
}

export default problem
