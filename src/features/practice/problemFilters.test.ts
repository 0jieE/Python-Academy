import { describe, expect, it } from 'vitest'
import { allTags, filterProblems, hasActiveFilters, parseProblemFilters, withFilter } from './problemFilters'

const problems = [
  { id: 'p-b', title: 'Bravo', difficulty: 'medium' as const, topicTags: ['sorting'] },
  { id: 'p-a', title: 'Alpha', difficulty: 'medium' as const, topicTags: ['strings', 'sorting'] },
  { id: 'p-h', title: 'Hotel', difficulty: 'hard' as const, topicTags: ['binary-search'] },
  { id: 'p-e', title: 'Echo', difficulty: 'easy' as const, topicTags: ['strings'] },
]
const tags = allTags(problems)
const statusOf = (id: string) => (id === 'p-a' ? 'solved' : id === 'p-h' ? 'attempted' : 'new')

describe('problem filters', () => {
  it('collects unique sorted tags', () => {
    expect(tags).toEqual(['binary-search', 'sorting', 'strings'])
  })

  it('parses valid params and ignores unknown values', () => {
    expect(parseProblemFilters(new URLSearchParams('difficulty=easy&tag=strings&status=solved'), tags)).toEqual({
      difficulty: 'easy', tag: 'strings', status: 'solved',
    })
    const junk = parseProblemFilters(new URLSearchParams('difficulty=expert&tag=nope&status=done'), tags)
    expect(junk).toEqual({ difficulty: null, tag: null, status: null })
    expect(hasActiveFilters(junk)).toBe(false)
  })

  it('sorts easy → hard, then by title, when nothing is filtered', () => {
    const none = parseProblemFilters(new URLSearchParams(), tags)
    expect(filterProblems(problems, none, statusOf).map((p) => p.title)).toEqual(['Echo', 'Alpha', 'Bravo', 'Hotel'])
  })

  it('combines difficulty, tag and status', () => {
    const f = (q: string) => filterProblems(problems, parseProblemFilters(new URLSearchParams(q), tags), statusOf).map((p) => p.id)
    expect(f('difficulty=medium')).toEqual(['p-a', 'p-b'])
    expect(f('tag=strings')).toEqual(['p-e', 'p-a'])
    expect(f('difficulty=medium&tag=strings')).toEqual(['p-a'])
    expect(f('status=attempted')).toEqual(['p-h'])
    expect(f('difficulty=easy&tag=binary-search')).toEqual([])
  })

  it('withFilter sets and removes one param and keeps the rest', () => {
    const p = new URLSearchParams('difficulty=easy&tag=strings')
    expect(withFilter(p, 'tag', null).toString()).toBe('difficulty=easy')
    expect(withFilter(p, 'difficulty', 'hard').toString()).toBe('difficulty=hard&tag=strings')
    expect(p.toString()).toBe('difficulty=easy&tag=strings')
  })
})
