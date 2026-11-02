import type { ProblemDefinition } from '../../../types/content.ts'

const problem: ProblemDefinition = {
  id: 'prob-score-lookup',
  slug: 'score-lookup',
  title: 'Score Lookup',
  difficulty: 'medium',
  topicTags: ['binary-search', 'sorting', 'queries'],
  constraints: ['1 ≤ N, Q ≤ 2·10^5', '0 ≤ score, t ≤ 10^9'],
  inputSpec: 'The first line has N and Q. The second line has N scores in any order. Each of the next Q lines has one threshold t.',
  outputSpec: 'For each threshold print, on its own line, how many scores are greater than or equal to t.',
  sampleTests: [
    {
      name: 'Sample 1',
      input: '5 4\n70 85 85 90 60\n85\n100\n0\n61\n',
      expectedOutput: '3\n0\n5\n4\n',
      explanation: 'Scores ≥ 85: 85, 85, 90. Nobody has ≥ 100. Everyone has ≥ 0. Scores ≥ 61: 70, 85, 85, 90.',
    },
    {
      name: 'Exactly on the threshold',
      input: '1 2\n50\n50\n51\n',
      expectedOutput: '1\n0\n',
      explanation: 'Edge case: a score equal to t counts.',
    },
  ],
  hints: [
    'Counting for each query with a loop is O(N · Q) — up to 4·10^10 steps.',
    'Sort the scores once.',
    'bisect_left(scores, t) is the number of scores smaller than t, so the answer is N minus that.',
  ],
  timeLimitMs: 2000,
  compareMode: 'tokens-per-line',
  starterCode: 'import sys\nfrom bisect import bisect_left\n\ndata = sys.stdin.buffer.read().split()\n',
  relatedLessonIds: ['algo-binary-search', 'algo-sorting'],
  source: 'Original problem',
}

export default problem
