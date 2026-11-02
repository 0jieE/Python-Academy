import { describe, expect, it } from 'vitest'
import { roadmap } from './roadmap'

describe('roadmap', () => {
  const items = roadmap.flatMap((s) => s.items)

  it('lists every lesson once, with a kebab-case id and a display title', () => {
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length)
    for (const item of items) {
      expect(item.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
      expect(item.title.trim()).not.toBe('')
    }
  })
})
