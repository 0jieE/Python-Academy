import { describe, expect, it } from 'vitest'
import { compareOutput } from './compareOutput'

describe('compareOutput', () => {
  it('ignores CRLF vs LF and trailing newlines', () => {
    expect(compareOutput('7\r\n', '7\n').passed).toBe(true)
    expect(compareOutput('1\n2\n', '1\n2').passed).toBe(true)
  })

  it('tokens-per-line ignores extra spaces inside a line', () => {
    expect(compareOutput('1 2 3', '1  2 3 ').passed).toBe(true)
  })

  it('exact mode is strict about spaces', () => {
    expect(compareOutput('1 2', '1  2', 'exact').passed).toBe(false)
  })

  it('reports the first differing line', () => {
    const r = compareOutput('a\nb\nc', 'a\nx\nc')
    expect(r).toMatchObject({ passed: false, firstDiffLine: 2, expectedLine: 'b', actualLine: 'x' })
  })

  it('detects missing output lines', () => {
    const r = compareOutput('1\n2', '1')
    expect(r).toMatchObject({ passed: false, firstDiffLine: 2, actualLine: '<missing line>' })
  })
})
