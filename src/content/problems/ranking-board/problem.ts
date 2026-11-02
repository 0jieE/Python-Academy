import type { ProblemDefinition } from '../../../types/content.ts'

const problem: ProblemDefinition = {
  id: 'prob-ranking-board',
  slug: 'ranking-board',
  title: 'Ranking Board',
  difficulty: 'medium',
  topicTags: ['sorting', 'strings'],
  constraints: ['1 ≤ N ≤ 10^5', 'Names are 1–20 lower-case letters and are all different.', '0 ≤ score ≤ 10^9'],
  inputSpec: 'The first line has N. Each of the next N lines has a team name and its score, separated by a space.',
  outputSpec: 'Print the N teams, one per line as "name score", from the highest score to the lowest. Teams with equal scores are listed in alphabetical order of their names.',
  sampleTests: [
    {
      name: 'Sample 1',
      input: '4\nlions 30\ncobras 45\neagles 30\nbears 10\n',
      expectedOutput: 'cobras 45\neagles 30\nlions 30\nbears 10\n',
      explanation: 'eagles and lions both have 30, so they are ordered by name.',
    },
    { name: 'One team', input: '1\nsolo 0\n', expectedOutput: 'solo 0\n', explanation: 'Edge case: a single team with score 0.' },
    {
      name: 'All tied',
      input: '3\nzeta 5\nalpha 5\nmid 5\n',
      expectedOutput: 'alpha 5\nmid 5\nzeta 5\n',
    },
  ],
  hints: [
    'Store each team as a (name, score) pair with the score converted to int.',
    'sort() accepts key=. A key that returns a tuple sorts by the first item, then the second.',
    'To sort one part descending and another ascending, negate the number: key=lambda t: (-t[1], t[0]).',
  ],
  timeLimitMs: 2000,
  compareMode: 'tokens-per-line',
  starterCode: 'import sys\n\ninput = sys.stdin.readline\nn = int(input())\n',
  relatedLessonIds: ['algo-sorting', 'fund-lists', 'fund-functions'],
  source: 'Original problem',
}

export default problem
