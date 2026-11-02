import { readFileSync } from 'node:fs'
import type { Page } from '@playwright/test'

interface ManifestEntry {
  url: string
  title: string
  slug: string
  sampleTests?: unknown[]
}
interface Manifest {
  lessons: ManifestEntry[]
  cheatSheets: ManifestEntry[]
  problems: ManifestEntry[]
}

/** Written by `npm run build` (content step). */
export const manifest: Manifest = JSON.parse(readFileSync(new URL('../src/generated/content-manifest.json', import.meta.url), 'utf8'))

export const staticRoutes = ['/', '/learn', '/cheat-sheets', '/problems', '/playground', '/progress']

/** Every page of the site, including one 404. */
export const allRoutes = [
  ...staticRoutes,
  ...manifest.lessons.map((l) => l.url),
  ...manifest.cheatSheets.map((c) => c.url),
  ...manifest.problems.map((p) => p.url),
  '/this-page-does-not-exist',
]

/** Collects console errors and uncaught exceptions for the lifetime of the page. */
export function trackErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  page.on('pageerror', (e) => errors.push(e.message))
  return errors
}
