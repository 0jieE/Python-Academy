/**
 * After a redeploy, an old tab may ask for a JS chunk that no longer exists
 * (Render serves index.html for it → the dynamic import fails). Reloading once
 * fetches the new index.html and fixes it. Reload at most once per window so a
 * genuinely missing chunk shows the error page instead of looping.
 */
const CHUNK_ERROR =
  /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Unable to preload CSS/i

export const CHUNK_RELOAD_KEY = 'pyacademy:chunk-reload-at'
export const CHUNK_RELOAD_WINDOW_MS = 30_000

export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : typeof error === 'string' ? error : ''
  return CHUNK_ERROR.test(message)
}

export function shouldAutoReload(lastReloadAt: number | null, now: number): boolean {
  return lastReloadAt === null || !Number.isFinite(lastReloadAt) || now - lastReloadAt > CHUNK_RELOAD_WINDOW_MS
}

/** Returns true (and records it) if the page may auto-reload now. */
export function claimChunkReload(now = Date.now()): boolean {
  try {
    const raw = sessionStorage.getItem(CHUNK_RELOAD_KEY)
    if (!shouldAutoReload(raw === null ? null : Number(raw), now)) return false
    sessionStorage.setItem(CHUNK_RELOAD_KEY, String(now))
    return true
  } catch {
    // No storage → we can't remember that we reloaded, so never auto-reload.
    return false
  }
}
