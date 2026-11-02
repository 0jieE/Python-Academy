import type { ProblemDefinition } from '../../../types/content.ts'

const problem: ProblemDefinition = {
  id: 'prob-letter-grade',
  slug: 'letter-grade',
  title: 'Letter Grade',
  difficulty: 'easy',
  topicTags: ['conditionals'],
  constraints: ['0 ≤ S ≤ 100'],
  inputSpec: 'One line with an integer S: a test score.',
  outputSpec: 'Print one letter: A if S ≥ 90, B if S ≥ 80, C if S ≥ 70, D if S ≥ 60, otherwise F.',
  sampleTests: [
    { name: 'Sample 1', input: '85\n', expectedOutput: 'B\n' },
    { name: 'On the boundary', input: '90\n', expectedOutput: 'A\n', explanation: 'Edge case: 90 is an A because the rule is "at least 90".' },
    { name: 'Lowest score', input: '0\n', expectedOutput: 'F\n' },
  ],
  hints: ['Check the highest grade first and go down with elif.', 'Use >= so that boundary scores like 90 get the higher letter.'],
  timeLimitMs: 2000,
  compareMode: 'tokens-per-line',
  starterCode: 's = int(input())\n',
  relatedLessonIds: ['fund-conditionals', 'fund-functions'],
  source: 'Original problem',
}

export default problem
