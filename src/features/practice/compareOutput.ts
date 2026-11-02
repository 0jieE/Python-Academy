import type { CompareMode } from '@/types/content'

export interface CompareResult {
  passed: boolean
  /** 1-based line of the first difference, if any. */
  firstDiffLine?: number
  expectedLine?: string
  actualLine?: string
}

/** Normalize CRLF/CR to LF and drop trailing blank lines. */
export function normalizeNewlines(text: string): string {
  return text.replace(/\r\n?/g, '\n').replace(/\n+$/, '')
}

function toLines(text: string, mode: CompareMode): string[] {
  const lines = normalizeNewlines(text).split('\n')
  if (mode === 'exact') return lines
  if (mode === 'trim-lines') return lines.map((l) => l.trimEnd())
  // tokens-per-line: collapse runs of whitespace, ignore leading/trailing spaces
  return lines.map((l) => l.trim().split(/\s+/).filter(Boolean).join(' '))
}

/**
 * Compare program output with expected output.
 * Line endings and trailing newlines are ALWAYS normalized (Windows-authored
 * samples must still pass). `mode` controls whitespace strictness inside lines.
 */
export function compareOutput(expected: string, actual: string, mode: CompareMode = 'tokens-per-line'): CompareResult {
  const e = toLines(expected, mode)
  const a = toLines(actual, mode)
  const n = Math.max(e.length, a.length)
  for (let i = 0; i < n; i++) {
    if (e[i] !== a[i]) {
      return { passed: false, firstDiffLine: i + 1, expectedLine: e[i] ?? '<missing line>', actualLine: a[i] ?? '<missing line>' }
    }
  }
  return { passed: true }
}
