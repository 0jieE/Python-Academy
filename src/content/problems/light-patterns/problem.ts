import type { ProblemDefinition } from '../../../types/content.ts'

const problem: ProblemDefinition = {
  id: 'prob-light-patterns',
  slug: 'light-patterns',
  title: 'Light Patterns',
  difficulty: 'medium',
  topicTags: ['recursion', 'backtracking', 'strings'],
  constraints: ['1 ≤ N ≤ 15'],
  inputSpec: 'One line with an integer N: the number of lights.',
  outputSpec: 'Print every valid pattern, one per line, in increasing (lexicographic) order. A pattern is a string of N characters 0 (off) or 1 (on) with no two 1s next to each other.',
  sampleTests: [
    { name: 'Sample 1', input: '3\n', expectedOutput: '000\n001\n010\n100\n101\n', explanation: '011, 110 and 111 have two neighbouring lights on.' },
    { name: 'One light', input: '1\n', expectedOutput: '0\n1\n', explanation: 'Edge case: with one light, both patterns are valid.' },
  ],
  hints: [
    'Build the pattern one light at a time with a recursive function.',
    'Try 0 before 1 at every position. Then the patterns come out in order automatically.',
    'You may put a 1 only if the previous light is not 1.',
  ],
  timeLimitMs: 2000,
  compareMode: 'tokens-per-line',
  starterCode: 'n = int(input())\n\ndef build(pattern):\n    pass\n',
  relatedLessonIds: ['algo-recursion', 'fund-functions'],
  source: 'Original problem',
}

export default problem
