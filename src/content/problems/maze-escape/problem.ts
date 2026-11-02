import type { ProblemDefinition } from '../../../types/content.ts'

const problem: ProblemDefinition = {
  id: 'prob-maze-escape',
  slug: 'maze-escape',
  title: 'Maze Escape',
  difficulty: 'medium',
  topicTags: ['bfs', 'graphs', 'grid', 'shortest-path'],
  constraints: ['1 ≤ R, C ≤ 1000', 'The grid has exactly one S and one E.'],
  inputSpec: 'The first line has R and C. Each of the next R lines has C characters: . (open), # (wall), S (start) or E (exit).',
  outputSpec: 'Print the minimum number of moves from S to E, moving up, down, left or right through open cells. Print -1 if E cannot be reached.',
  sampleTests: [
    {
      name: 'Sample 1',
      input: '4 5\nS.#..\n.##.#\n...#E\n#....\n',
      expectedOutput: '8\n',
      explanation: 'Down 2, right 2, down 1, right 2, up 1 into E: 8 moves. The top route is blocked by walls.',
    },
    {
      name: 'Walled in',
      input: '3 3\nS#.\n##.\n..E\n',
      expectedOutput: '-1\n',
      explanation: 'Edge case: S is surrounded by walls, so E is unreachable.',
    },
    { name: 'Next to each other', input: '1 2\nSE\n', expectedOutput: '1\n' },
  ],
  hints: [
    'Every move costs the same, so breadth-first search (BFS) finds the shortest path.',
    'Use collections.deque as the queue and a distance grid filled with -1 for "not visited".',
    'Mark a cell visited when you put it in the queue, not when you take it out — otherwise cells are added many times.',
  ],
  timeLimitMs: 3000,
  compareMode: 'tokens-per-line',
  starterCode: 'import sys\nfrom collections import deque\n\ninput = sys.stdin.readline\nr, c = map(int, input().split())\ngrid = [input().strip() for _ in range(r)]\n',
  relatedLessonIds: ['algo-bfs-dfs'],
  source: 'Original problem',
}

export default problem
