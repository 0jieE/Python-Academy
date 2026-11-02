/*
 * PyAcademy service worker. dist/sw.js is GENERATED from this file by
 * scripts/build-sw.ts (after vite build + search index) — edit this template.
 *
 * - App shell + every built file is precached → lessons, cheat sheets,
 *   problems, search and the editor work offline once the app was opened.
 * - Every page is the SPA's index.html (navigation fallback).
 * - Pyodide comes from the CDN (never bundled). Its URLs are version-pinned,
 *   so they are cached forever on first use → the IDE works offline after
 *   Python loaded once.
 * - A new build installs in the background and waits; the page shows
 *   "A new version is ready · Reload", which sends SKIP_WAITING.
 */
const VERSION = '__VERSION__'
const PRECACHE = __PRECACHE__
const CDN_PREFIXES = __CDN_PREFIXES__

const SHELL_CACHE = 'pyacademy-shell-' + VERSION
const CDN_CACHE = 'pyacademy-cdn'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      // First install: nothing to replace, take over right away.
      .then(() => (self.registration.active ? undefined : self.skipWaiting())),
  )
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) {
        if (key.startsWith('pyacademy-shell-') && key !== SHELL_CACHE) await caches.delete(key)
      }
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin === self.location.origin) {
    event.respondWith(request.mode === 'navigate' ? appShell(request) : cacheFirst(request, SHELL_CACHE))
  } else if (CDN_PREFIXES.some((prefix) => request.url.startsWith(prefix))) {
    event.respondWith(cacheFirst(request, CDN_CACHE))
  }
})

async function appShell(request) {
  const cache = await caches.open(SHELL_CACHE)
  return (await cache.match('/index.html')) || fetch(request)
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const hit = await cache.match(request, { ignoreVary: true })
  if (hit) return hit
  const response = await fetch(request)
  if (response.ok) cache.put(request, response.clone()).catch(() => {})
  return response
}
