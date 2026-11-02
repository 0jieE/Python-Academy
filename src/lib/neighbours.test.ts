import { describe, expect, it } from 'vitest'
import { neighbours } from './neighbours'

const list = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]

describe('neighbours', () => {
  it('returns prev and next in list order', () => {
    expect(neighbours(list, 'b')).toEqual({ prev: { id: 'a' }, next: { id: 'c' } })
  })

  it('has no prev at the start and no next at the end', () => {
    expect(neighbours(list, 'a')).toEqual({ prev: undefined, next: { id: 'b' } })
    expect(neighbours(list, 'c')).toEqual({ prev: { id: 'b' }, next: undefined })
  })

  it('returns nothing for an unknown id', () => {
    expect(neighbours(list, 'zzz')).toEqual({})
  })
})
