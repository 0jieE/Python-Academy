import type { ProblemDefinition } from '../../../types/content.ts'

const problem: ProblemDefinition = {
  id: 'prob-most-frequent-word',
  slug: 'most-frequent-word',
  title: 'Most Frequent Word',
  difficulty: 'medium',
  topicTags: ['counting', 'dict', 'strings'],
  constraints: ['1 ≤ N ≤ 2·10^5', 'Each word has 1–15 lower-case letters.'],
  inputSpec: 'The first line has N. The next lines contain N words separated by spaces and/or line breaks.',
  outputSpec: 'Print the word that appears most often and how many times it appears, separated by a space. If several words tie, print the one that comes first alphabetically.',
  sampleTests: [
    {
      name: 'Sample 1',
      input: '6\nred blue red green blue red\n',
      expectedOutput: 'red 3\n',
    },
    {
      name: 'All different',
      input: '3\nzeta alpha mid\n',
      expectedOutput: 'alpha 1\n',
      explanation: 'Edge case: every word appears once, so the alphabetically first word wins the tie.',
    },
    {
      name: 'Words on several lines',
      input: '5\nkiwi fig\nfig\nkiwi apple\n',
      expectedOutput: 'fig 2\n',
      explanation: 'fig and kiwi both appear twice; fig comes first alphabetically.',
    },
  ],
  hints: [
    'Read every word with sys.stdin.read().split() — it ignores how the words are split across lines.',
    'Count with a dict (or collections.Counter).',
    'Pick the best with min over (−count, word), so higher counts win and ties go to the smaller word.',
  ],
  timeLimitMs: 2000,
  compareMode: 'tokens-per-line',
  starterCode: 'import sys\n\ndata = sys.stdin.read().split()\n',
  relatedLessonIds: ['fund-dicts-sets'],
  source: 'Original problem',
}

export default problem
