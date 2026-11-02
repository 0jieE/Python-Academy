import { describe, expect, it } from 'vitest'
import { decodePlaygroundHash, encodePlaygroundHash, playgroundUrl } from './urlState'

describe('playground URL state', () => {
  it('round-trips code and stdin with special characters', () => {
    const state = { code: 'a, b = map(int, input().split())\nprint(a + b)  # 1+1 & #x é', stdin: '3 4\n5 6\n' }
    expect(decodePlaygroundHash('#' + encodePlaygroundHash(state))).toEqual(state)
  })

  it('omits empty fields', () => {
    expect(playgroundUrl({ code: '', stdin: '' })).toBe('/playground')
    expect(playgroundUrl({ code: 'print(1)' })).toBe('/playground#code=print%281%29')
  })

  it('ignores unknown or missing params', () => {
    expect(decodePlaygroundHash('')).toEqual({})
    expect(decodePlaygroundHash('#foo=1&stdin=x')).toEqual({ stdin: 'x' })
  })
})
