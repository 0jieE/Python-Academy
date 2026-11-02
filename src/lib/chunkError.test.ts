import { describe, expect, it } from 'vitest'
import { CHUNK_RELOAD_WINDOW_MS, isChunkLoadError, shouldAutoReload } from './chunkError'

describe('isChunkLoadError', () => {
  it('recognises Chrome, Firefox and Safari messages', () => {
    expect(isChunkLoadError(new TypeError('Failed to fetch dynamically imported module: /assets/x.js'))).toBe(true)
    expect(isChunkLoadError(new TypeError('error loading dynamically imported module: /assets/x.js'))).toBe(true)
    expect(isChunkLoadError(new TypeError('Importing a module script failed.'))).toBe(true)
  })

  it('ignores ordinary errors', () => {
    expect(isChunkLoadError(new Error('x is undefined'))).toBe(false)
    expect(isChunkLoadError({ status: 404 })).toBe(false)
  })
})

describe('shouldAutoReload', () => {
  it('reloads when never reloaded or the last reload was long ago', () => {
    expect(shouldAutoReload(null, 1000)).toBe(true)
    expect(shouldAutoReload(Number.NaN, 1000)).toBe(true)
    expect(shouldAutoReload(0, CHUNK_RELOAD_WINDOW_MS + 1)).toBe(true)
  })

  it('does not reload twice inside the window', () => {
    expect(shouldAutoReload(1000, 1000 + CHUNK_RELOAD_WINDOW_MS - 1)).toBe(false)
  })
})
