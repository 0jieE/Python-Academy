import type { ProblemDefinition } from '../../../types/content.ts'

const problem: ProblemDefinition = {
  id: 'prob-friend-groups',
  slug: 'friend-groups',
  title: 'Friend Groups',
  difficulty: 'medium',
  topicTags: ['dfs', 'graphs', 'connected-components'],
  constraints: ['1 ≤ N ≤ 2·10^5', '0 ≤ M ≤ 2·10^5', '1 ≤ a, b ≤ N, a ≠ b'],
  inputSpec: 'The first line has N (students, numbered 1 to N) and M (friendships). Each of the next M lines has two integers a and b: students a and b are friends.',
  outputSpec: 'Print the number of friend groups, followed by the size of the largest group, separated by a space.',
  sampleTests: [
    {
      name: 'Sample 1',
      input: '7 5\n1 2\n2 3\n4 5\n6 7\n7 6\n',
      expectedOutput: '3 3\n',
      explanation: 'Groups: {1, 2, 3}, {4, 5}, {6, 7}. The friendship 6–7 is listed twice, which changes nothing.',
    },
    {
      name: 'No friendships',
      input: '4 0\n',
      expectedOutput: '4 1\n',
      explanation: 'Edge case: every student is a group of one.',
    },
  ],
  hints: [
    'Students are nodes and friendships are edges. A friend group is a connected component.',
    'Start a search (DFS or BFS) from every student not seen yet; each new start is a new group.',
    'With up to 2·10^5 students, a recursive DFS can hit Python\'s recursion limit, so use a stack list instead.',
  ],
  timeLimitMs: 3000,
  compareMode: 'tokens-per-line',
  starterCode: 'import sys\n\ndata = sys.stdin.buffer.read().split()\n',
  relatedLessonIds: ['algo-bfs-dfs', 'algo-recursion'],
  source: 'Original problem',
}

export default problem
