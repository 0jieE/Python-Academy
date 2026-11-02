import type { ProblemDefinition } from '../../../types/content.ts'

const problem: ProblemDefinition = {
  id: 'prob-prime-queries',
  slug: 'prime-queries',
  title: 'Prime Queries',
  difficulty: 'medium',
  topicTags: ['math', 'primes', 'sieve', 'prefix-sums'],
  constraints: ['1 ≤ Q ≤ 2·10^5', '1 ≤ x_i ≤ 10^6'],
  inputSpec: 'The first line has Q. The second line has Q integers x_1 … x_Q.',
  outputSpec: 'For each x_i print, on its own line, how many prime numbers are ≤ x_i.',
  sampleTests: [
    {
      name: 'Sample 1',
      input: '4\n10 2 1 30\n',
      expectedOutput: '4\n1\n0\n10\n',
      explanation: 'Primes ≤ 10: 2, 3, 5, 7. Primes ≤ 30: those four plus 11, 13, 17, 19, 23, 29.',
    },
    { name: 'Only 1', input: '1\n1\n', expectedOutput: '0\n', explanation: 'Edge case: 1 is not a prime.' },
  ],
  hints: [
    'Testing every number up to x for every query is far too slow: up to 2·10^5 queries.',
    'Mark all primes up to 10^6 once with the Sieve of Eratosthenes.',
    'Then build count[x] = number of primes ≤ x (a prefix sum), and answer each query in O(1).',
  ],
  timeLimitMs: 3000,
  compareMode: 'tokens-per-line',
  starterCode: 'import sys\n\ndata = sys.stdin.buffer.read().split()\n',
  relatedLessonIds: ['algo-math-gcd-primes-mod', 'algo-prefix-sums'],
  source: 'Original problem',
}

export default problem
