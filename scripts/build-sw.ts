/**
 * Service worker (runs LAST in `npm run build`, after the search index).
 *
 * Lists every file in dist/ as the precache, hashes their contents into a
 * version (so any change to any file ships a new service worker), and writes
 * dist/sw.js from scripts/sw.template.js. Pyodide is NOT precached — it stays
 * on the CDN and is cached at runtime on first use (see the template).
 */
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')

/** dist-relative file paths → precache URLs (sorted, without the worker itself or source maps). */
export function precacheUrls(files: string[]): string[] {
  return files
    .map((f) => f.split(sep).join('/'))
    .filter((f) => f !== 'sw.js' && !f.endsWith('.map'))
    .map((f) => '/' + f)
    .sort()
}

export function renderServiceWorker(template: string, opts: { version: string; precache: string[]; cdnPrefixes: string[] }): string {
  const out = template
    .replace("'__VERSION__'", JSON.stringify(opts.version))
    .replace('__PRECACHE__', JSON.stringify(opts.precache))
    .replace('__CDN_PREFIXES__', JSON.stringify(opts.cdnPrefixes))
  if (out.includes('__')) throw new Error('sw.template.js: a placeholder was not replaced')
  return out
}

/** The Pyodide CDN folder (same rule as src/features/playground/config.ts). */
export function pyodideUrl(pyodideVersion: string, override?: string): string {
  return override || `https://cdn.jsdelivr.net/npm/pyodide@${pyodideVersion}/`
}

function listFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? listFiles(join(dir, d.name)) : [relative(DIST, join(dir, d.name))],
  )
}

function main() {
  const files = listFiles(DIST)
  const precache = precacheUrls(files)
  const hash = createHash('sha256')
  for (const url of precache) {
    hash.update(url)
    hash.update(readFileSync(join(DIST, url.slice(1))))
  }
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as { dependencies: Record<string, string> }
  const cdn = pyodideUrl(pkg.dependencies.pyodide, process.env.VITE_PYODIDE_INDEX_URL)
  const template = readFileSync(join(ROOT, 'scripts', 'sw.template.js'), 'utf8')
  const sw = renderServiceWorker(template, { version: hash.digest('hex').slice(0, 12), precache, cdnPrefixes: [cdn] })
  writeFileSync(join(DIST, 'sw.js'), sw)
  const bytes = precache.reduce((n, url) => n + readFileSync(join(DIST, url.slice(1))).length, 0)
  console.log(`sw.js: ${precache.length} files precached (${(bytes / 1024 / 1024).toFixed(1)} MB); runtime cache for ${cdn}`)
}

const self = fileURLToPath(import.meta.url).toLowerCase()
if (process.argv[1] && resolve(process.argv[1]).toLowerCase() === self) main()
