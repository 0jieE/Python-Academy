import type { ProblemDefinition } from '../../../types/content.ts'

const problem: ProblemDefinition = {
  id: 'prob-palindrome-word',
  slug: 'palindrome-word',
  title: 'Palindrome Word',
  difficulty: 'easy',
  topicTags: ['strings'],
  constraints: ['1 ≤ length of the word ≤ 10^5', 'The word has only English letters (a–z, A–Z).'],
  inputSpec: 'One line with a single word.',
  outputSpec: 'Print YES if the word reads the same forwards and backwards, ignoring upper/lower case. Otherwise print NO.',
  sampleTests: [
    { name: 'Sample 1', input: 'Level\n', expectedOutput: 'YES\n', explanation: 'Ignoring case, "level" reversed is "level".' },
    { name: 'Not a palindrome', input: 'abca\n', expectedOutput: 'NO\n' },
    { name: 'One letter', input: 'x\n', expectedOutput: 'YES\n', explanation: 'Edge case: a single letter is always a palindrome.' },
  ],
  hints: ['Make the whole word lower case first with .lower().', 'word[::-1] is the word reversed.'],
  timeLimitMs: 2000,
  compareMode: 'tokens-per-line',
  starterCode: 'word = input()\n',
  relatedLessonIds: ['fund-strings'],
  source: 'Original problem',
}

export default problem
