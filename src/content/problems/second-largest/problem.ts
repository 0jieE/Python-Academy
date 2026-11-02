import type { ProblemDefinition } from '../../../types/content.ts'

const problem: ProblemDefinition = {
  id: 'prob-second-largest',
  slug: 'second-largest',
  title: 'Second Largest',
  difficulty: 'easy',
  topicTags: ['lists'],
  constraints: ['1 ≤ N ≤ 10^5', '-10^9 ≤ a_i ≤ 10^9'],
  inputSpec: 'The first line has an integer N. The second line has N integers.',
  outputSpec: 'Print the second largest distinct value. If all values are equal, print NONE.',
  sampleTests: [
    { name: 'Sample 1', input: '5\n4 1 7 7 3\n', expectedOutput: '4\n', explanation: 'The largest value is 7 (twice). The next distinct value is 4.' },
    { name: 'All equal', input: '3\n5 5 5\n', expectedOutput: 'NONE\n', explanation: 'Edge case: there is no second distinct value.' },
    { name: 'One number', input: '1\n-8\n', expectedOutput: 'NONE\n' },
  ],
  hints: ['Find the maximum first.', 'Then look only at the numbers that are not equal to the maximum.'],
  timeLimitMs: 2000,
  compareMode: 'tokens-per-line',
  starterCode: 'n = int(input())\nnums = list(map(int, input().split()))\n',
  relatedLessonIds: ['fund-lists'],
  source: 'Original problem',
}

export default problem
