import type { ProblemDefinition } from '../../../types/content.ts'

const problem: ProblemDefinition = {
  id: 'prob-simplify-fraction',
  slug: 'simplify-fraction',
  title: 'Simplify the Fraction',
  difficulty: 'easy',
  topicTags: ['math', 'gcd'],
  constraints: ['1 ≤ A, B ≤ 10^18'],
  inputSpec: 'One line with two integers A and B: the fraction A/B.',
  outputSpec: 'Print the fraction in lowest terms as P/Q (always with the slash, even when Q is 1).',
  sampleTests: [
    { name: 'Sample 1', input: '6 8\n', expectedOutput: '3/4\n', explanation: 'gcd(6, 8) = 2, so 6/8 = 3/4.' },
    { name: 'Equal numbers', input: '7 7\n', expectedOutput: '1/1\n', explanation: 'Edge case: the fraction is a whole number, still printed with "/1".' },
    { name: 'Big numbers', input: '1000000000000000000 250000000000000000\n', expectedOutput: '4/1\n' },
  ],
  hints: ['Divide both numbers by their greatest common divisor.', 'math.gcd works on Python integers of any size.'],
  timeLimitMs: 2000,
  compareMode: 'tokens-per-line',
  starterCode: 'import math\n\na, b = map(int, input().split())\n',
  relatedLessonIds: ['algo-math-gcd-primes-mod'],
  source: 'Original problem',
}

export default problem
