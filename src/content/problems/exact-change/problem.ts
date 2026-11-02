import type { ProblemDefinition } from '../../../types/content.ts'

const problem: ProblemDefinition = {
  id: 'prob-exact-change',
  slug: 'exact-change',
  title: 'Exact Change',
  difficulty: 'hard',
  topicTags: ['dp', 'coins'],
  constraints: ['1 ≤ N ≤ 100', '1 ≤ coin value ≤ 10^4', '1 ≤ X ≤ 10^4', 'Coin values are distinct.'],
  inputSpec: 'The first line has N and X. The second line has N integers: the coin values. You have as many coins of each value as you want.',
  outputSpec: 'Print the minimum number of coins whose values add up to exactly X, or -1 if it is impossible.',
  sampleTests: [
    {
      name: 'Sample 1',
      input: '3 6\n1 3 4\n',
      expectedOutput: '2\n',
      explanation: '3 + 3. Taking the biggest coin first (4 + 1 + 1) needs 3 coins, so greedy fails here.',
    },
    { name: 'Impossible', input: '2 3\n5 10\n', expectedOutput: '-1\n', explanation: 'Edge case: every coin is bigger than X.' },
    { name: 'One coin type', input: '1 12\n4\n', expectedOutput: '3\n' },
  ],
  hints: [
    'Greedy (largest coin first) does not always work — the first sample shows why.',
    'Let best[s] = fewest coins that make exactly s. Then best[s] = 1 + min(best[s − c]) over the coins c ≤ s.',
    'Start with best[0] = 0 and "infinity" everywhere else; fill s = 1, 2, …, X.',
  ],
  timeLimitMs: 3000,
  compareMode: 'tokens-per-line',
  starterCode: 'n, x = map(int, input().split())\ncoins = list(map(int, input().split()))\n',
  relatedLessonIds: ['algo-dp-intro', 'algo-greedy'],
  source: 'Original problem (classic coin change)',
}

export default problem
