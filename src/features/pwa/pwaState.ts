/**
 * Installable-app plumbing, kept tiny (it loads on every page):
 *  - registers /sw.js (production builds only; see scripts/build-sw.ts)
 *  - "update ready" when a new version has installed in the background
 *  - the browser's install prompt (Chrome/Edge/Android) and iOS detection
 *  - online / offline
 */
import { useSyncExternalStore } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface PwaState {
  updateReady: boolean
  installEvent: BeforeInstallPromptEvent | null
  installed: boolean
  online: boolean
}

let state: PwaState = {
  updateReady: false,
  installEvent: null,
  installed: false,
  online: typeof navigator === 'undefined' ? true : navigator.onLine,
}
const listeners = new Set<() => void>()
let waitingWorker: ServiceWorker | null = null

function set(patch: Partial<PwaState>) {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function usePwa(): PwaState {
  return useSyncExternalStore(subscribe, () => state)
}

/** Running as an installed app (home-screen icon), not in a browser tab. */
export function isStandalone(): boolean {
  try {
    return matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
  } catch {
    return false
  }
}

/** iPhone/iPad Safari: no install prompt; students add it from the Share menu. */
export function isIos(): boolean {
  const ua = navigator.userAgent
  return /iPhone|iPad|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
}

export async function promptInstall(): Promise<void> {
  const event = state.installEvent
  if (!event) return
  await event.prompt()
  const { outcome } = await event.userChoice
  set({ installEvent: null, installed: outcome === 'accepted' })
}

/** Activate the waiting service worker; the page reloads when it takes over. */
export function applyUpdate(): void {
  if (waitingWorker) waitingWorker.postMessage({ type: 'SKIP_WAITING' })
  else window.location.reload()
}

function watchForUpdates(registration: ServiceWorkerRegistration) {
  const markWaiting = (worker: ServiceWorker | null) => {
    // Only an *update*: the first install has no controller yet.
    if (worker && navigator.serviceWorker.controller) {
      waitingWorker = worker
      set({ updateReady: true })
    }
  }
  markWaiting(registration.waiting)
  registration.addEventListener('updatefound', () => {
    const worker = registration.installing
    worker?.addEventListener('statechange', () => {
      if (worker.state === 'installed') markWaiting(worker)
    })
  })
  // Check again when the app comes back to the foreground (installed apps stay open for days).
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') registration.update().catch(() => {})
  })
}

export function startPwa(): void {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault() // show our own button instead of the mini-infobar
    set({ installEvent: e as BeforeInstallPromptEvent })
  })
  window.addEventListener('appinstalled', () => set({ installEvent: null, installed: true }))
  window.addEventListener('online', () => set({ online: true }))
  window.addEventListener('offline', () => set({ online: false }))

  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return
  let reloading = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading || !waitingWorker) return
    reloading = true
    window.location.reload()
  })
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(watchForUpdates)
      .catch(() => {
        // No offline support (e.g. private mode); the site still works online.
      })
  })
}
