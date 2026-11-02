import type { ProblemDefinition } from '../../../types/content.ts'

const problem: ProblemDefinition = {
  id: 'prob-sum-of-two',
  slug: 'sum-of-two',
  title: 'Sum of Two',
  difficulty: 'easy',
  topicTags: ['io', 'math'],
  constraints: ['-10^9 ≤ A, B ≤ 10^9'],
  inputSpec: 'One line with two integers A and B separated by a space.',
  outputSpec: 'Print A + B on a single line.',
  sampleTests: [
    { name: 'Sample 1', input: '3 4\n', expectedOutput: '7\n' },
    { name: 'Sample 2', input: '-5 12\n', expectedOutput: '7\n' },
  ],
  hints: ['Use input().split() and convert each part with int().'],
  timeLimitMs: 2000,
  compareMode: 'tokens-per-line',
  starterCode: 'a, b = map(int, input().split())\nprint(a + b)\n',
  relatedLessonIds: ['fund-input-output'],
}

export default problem
