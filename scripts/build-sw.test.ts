import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { precacheUrls, pyodideUrl, renderServiceWorker } from './build-sw.ts'

describe('service worker build', () => {
  it('precaches every built file except the worker itself and source maps', () => {
    expect(precacheUrls(['index.html', 'sw.js', 'assets/a.js', 'assets/a.js.map', 'pagefind/pagefind.js'])).toEqual([
      '/assets/a.js',
      '/index.html',
      '/pagefind/pagefind.js',
    ])
  })

  it('fills every placeholder of the real template', () => {
    const template = readFileSync(new URL('./sw.template.js', import.meta.url), 'utf8')
    const sw = renderServiceWorker(template, { version: 'abc123', precache: ['/index.html'], cdnPrefixes: ['https://cdn.example/pyodide/'] })
    expect(sw).toContain(`const VERSION = "abc123"`)
    expect(sw).toContain(`const PRECACHE = ["/index.html"]`)
    expect(sw).toContain(`const CDN_PREFIXES = ["https://cdn.example/pyodide/"]`)
    expect(sw).not.toMatch(/__[A-Z_]+__/)
  })

  it('caches the same Pyodide folder the app loads from', () => {
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { dependencies: Record<string, string> }
    const config = readFileSync(new URL('../src/features/playground/config.ts', import.meta.url), 'utf8')
    expect(config).toContain(`PYODIDE_VERSION = '${pkg.dependencies.pyodide}'`)
    expect(pyodideUrl(pkg.dependencies.pyodide)).toBe(`https://cdn.jsdelivr.net/npm/pyodide@${pkg.dependencies.pyodide}/`)
    expect(pyodideUrl('1.0.0', '/pyodide/')).toBe('/pyodide/')
  })
})
