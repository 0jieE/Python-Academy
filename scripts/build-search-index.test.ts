import { describe, expect, it } from 'vitest'
import { mdxToText } from './build-search-index.ts'

describe('mdxToText', () => {
  it('drops frontmatter, imports and JSX tags but keeps their text and code', () => {
    const src = [
      '---',
      'title: Secret Title',
      '---',
      "import X from './x'",
      '',
      '## Reading input',
      '',
      '<Callout type="tip">Use **split()** here.</Callout>',
      '',
      '```python',
      'data = sys.stdin.read().split()',
      '```',
      '',
      'Inline `prefix` code {1 + 1}.',
    ].join('\n')
    const text = mdxToText(src)
    expect(text).toContain('Reading input')
    expect(text).toContain('Use split() here.')
    expect(text).toContain('sys.stdin.read().split()')
    expect(text).toContain('prefix')
    expect(text).not.toContain('Secret Title')
    expect(text).not.toContain('import X')
    expect(text).not.toContain('Callout')
    expect(text).not.toContain('1 + 1')
  })

  it('reads GFM tables as cell text, without pipes', () => {
    const text = mdxToText(['| Task | Code |', '| --- | --- |', '| One int | `int(input())` |', ''].join('\n'))
    expect(text).toBe('Task Code One int int(input())')
  })
})
