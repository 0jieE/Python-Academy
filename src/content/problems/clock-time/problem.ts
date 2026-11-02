import type { ProblemDefinition } from '../../../types/content.ts'

const problem: ProblemDefinition = {
  id: 'prob-clock-time',
  slug: 'clock-time',
  title: 'Clock Time',
  difficulty: 'easy',
  topicTags: ['math', 'operators', 'formatting'],
  constraints: ['0 ≤ M ≤ 10^6'],
  inputSpec: 'One line with an integer M: a number of minutes.',
  outputSpec: 'Print the time as H:MM: hours without padding, minutes always with two digits.',
  sampleTests: [
    { name: 'Sample 1', input: '135\n', expectedOutput: '2:15\n', explanation: '135 = 2 · 60 + 15.' },
    { name: 'Zero minutes', input: '0\n', expectedOutput: '0:00\n', explanation: 'Edge case: both parts are zero, minutes still need two digits.' },
    { name: 'Exact hour', input: '60\n', expectedOutput: '1:00\n' },
  ],
  hints: ['Integer division // gives the hours, % gives the minutes left over.', 'An f-string with {m:02d} pads a number to two digits.'],
  timeLimitMs: 2000,
  compareMode: 'tokens-per-line',
  starterCode: 'm = int(input())\n',
  relatedLessonIds: ['fund-operators', 'algo-math-gcd-primes-mod'],
  source: 'Original problem',
}

export default problem
