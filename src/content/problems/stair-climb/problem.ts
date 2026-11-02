import type { ProblemDefinition } from '../../../types/content.ts'

const problem: ProblemDefinition = {
  id: 'prob-stair-climb',
  slug: 'stair-climb',
  title: 'Stair Climb',
  difficulty: 'medium',
  topicTags: ['dp', 'math', 'modulo'],
  constraints: ['1 ≤ N ≤ 10^5'],
  inputSpec: 'One line with an integer N: the number of steps.',
  outputSpec: 'Print the number of different ways to climb exactly N steps, taking 1, 2 or 3 steps at a time, modulo 1 000 000 007.',
  sampleTests: [
    {
      name: 'Sample 1',
      input: '3\n',
      expectedOutput: '4\n',
      explanation: '1+1+1, 1+2, 2+1 and 3.',
    },
    { name: 'One step', input: '1\n', expectedOutput: '1\n', explanation: 'Edge case: the only way is a single 1-step.' },
    { name: 'Larger', input: '10\n', expectedOutput: '274\n' },
  ],
  hints: [
    'The last move onto step N was a 1-, 2- or 3-step.',
    'So ways(N) = ways(N − 1) + ways(N − 2) + ways(N − 3), with ways(0) = 1.',
    'Fill a table from 0 up to N and take % 1 000 000 007 at every step.',
  ],
  timeLimitMs: 2000,
  compareMode: 'tokens-per-line',
  starterCode: 'MOD = 10 ** 9 + 7\nn = int(input())\n',
  relatedLessonIds: ['algo-dp-intro', 'algo-recursion'],
  source: 'Original problem (classic staircase pattern)',
}

export default problem
