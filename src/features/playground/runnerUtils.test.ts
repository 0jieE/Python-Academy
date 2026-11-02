import { describe, expect, it } from 'vitest'
import { createStdinReader, normalizeStdin, OutputLimiter } from './runnerUtils'

function readAll(read: (b: Uint8Array) => number, chunkSize: number): string {
  const parts: Uint8Array[] = []
  for (;;) {
    const buf = new Uint8Array(chunkSize)
    const n = read(buf)
    if (n === 0) break
    parts.push(buf.slice(0, n))
  }
  const all = new Uint8Array(parts.reduce((n, p) => n + p.length, 0))
  let offset = 0
  for (const p of parts) {
    all.set(p, offset)
    offset += p.length
  }
  return new TextDecoder().decode(all)
}

describe('stdin', () => {
  it('normalizes CRLF and lone CR to LF', () => {
    expect(normalizeStdin('1 2\r\n3\r4\n')).toBe('1 2\n3\n4\n')
  })

  it('serves the exact text once, then EOF (0)', () => {
    const read = createStdinReader('3 4\n5 6\n')
    expect(readAll(read, 4)).toBe('3 4\n5 6\n')
    expect(read(new Uint8Array(10))).toBe(0)
  })

  it('handles empty stdin and multi-byte characters', () => {
    expect(createStdinReader('')(new Uint8Array(8))).toBe(0)
    expect(readAll(createStdinReader('Ñandú ✓\n'), 3)).toBe('Ñandú ✓\n')
  })
})

describe('OutputLimiter', () => {
  const collect = () => {
    const sent: [string, string][] = []
    return { sent, send: (s: string, c: string) => sent.push([s, c]) }
  }

  it('caps total output across both streams and marks truncation', () => {
    const { sent, send } = collect()
    const lim = new OutputLimiter(10, send, () => 0)
    lim.write('stdout', '123456')
    lim.write('stderr', '7890ABC')
    lim.write('stdout', 'more')
    lim.flush()
    expect(sent.map(([, c]) => c).join('')).toBe('1234567890')
    expect(lim.truncated).toBe(true)
  })

  it('batches small writes until flushChars or flushMs', () => {
    const { sent, send } = collect()
    let t = 0
    const lim = new OutputLimiter(1000, send, () => t, 8, 50)
    lim.write('stdout', 'ab')
    lim.write('stdout', 'cd')
    expect(sent).toEqual([])
    lim.write('stdout', 'efgh') // reaches 8 chars
    expect(sent).toEqual([['stdout', 'abcdefgh']])
    lim.write('stderr', 'x')
    t = 60
    lim.write('stderr', 'y') // 50 ms passed
    expect(sent.at(-1)).toEqual(['stderr', 'xy'])
  })
})
