import type { ProblemDefinition } from '../../../types/content.ts'

const problem: ProblemDefinition = {
  id: 'prob-room-booking',
  slug: 'room-booking',
  title: 'Room Booking',
  difficulty: 'medium',
  topicTags: ['greedy', 'sorting', 'intervals'],
  constraints: ['1 ≤ N ≤ 2·10^5', '0 ≤ s_i < e_i ≤ 10^9'],
  inputSpec: 'The first line has N. Each of the next N lines has two integers s_i and e_i: the start and end time of a booking request.',
  outputSpec: 'Print the largest number of requests that can be accepted so that no two accepted bookings overlap. A booking may start exactly when another one ends.',
  sampleTests: [
    {
      name: 'Sample 1',
      input: '5\n1 3\n2 5\n3 6\n6 8\n5 9\n',
      expectedOutput: '3\n',
      explanation: 'Accept 1–3, 3–6 and 6–8. They only touch at their ends, which is allowed.',
    },
    {
      name: 'Identical requests',
      input: '3\n1 10\n1 10\n1 10\n',
      expectedOutput: '1\n',
      explanation: 'Edge case: all requests overlap each other, so only one can be accepted.',
    },
  ],
  hints: [
    'Picking the shortest booking or the earliest start can both fail. Try to find a counterexample.',
    'Think about which booking should be first: the one that frees the room the soonest.',
    'Sort by end time, then accept every booking that starts at or after the end of the last accepted one.',
  ],
  timeLimitMs: 2000,
  compareMode: 'tokens-per-line',
  starterCode: 'import sys\n\ndata = sys.stdin.buffer.read().split()\n',
  relatedLessonIds: ['algo-greedy', 'algo-sorting'],
  source: 'Original problem (classic interval scheduling)',
}

export default problem
