import { useCallback, useSyncExternalStore } from 'react'
import {
  applyTheme,
  readStoredTheme,
  resolveTheme,
  storeTheme,
  THEME_STORAGE_KEY,
  type ResolvedTheme,
  type ThemePreference,
} from '@/lib/theme'

const media = () => window.matchMedia('(prefers-color-scheme: dark)')

// Module-level store: one source of truth for every component using the hook.
let preference: ThemePreference = readStoredTheme()
const listeners = new Set<() => void>()

function update(next: ThemePreference) {
  preference = next
  applyTheme(resolveTheme(preference, media().matches))
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (listeners.size === 1) {
    media().addEventListener('change', onSystemChange)
    window.addEventListener('storage', onStorage)
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      media().removeEventListener('change', onSystemChange)
      window.removeEventListener('storage', onStorage)
    }
  }
}

// OS theme flipped while preference is "system".
function onSystemChange() {
  update(preference)
}

// Another tab changed the preference.
function onStorage(e: StorageEvent) {
  if (e.key === THEME_STORAGE_KEY || e.key === null) update(readStoredTheme())
}

function getResolved(): ResolvedTheme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, () => preference)
  const resolvedTheme = useSyncExternalStore(subscribe, getResolved)
  const setTheme = useCallback((next: ThemePreference) => {
    storeTheme(next)
    update(next)
  }, [])
  return { theme, resolvedTheme, setTheme }
}
