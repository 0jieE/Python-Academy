/**
 * Light/dark/system theme. The `dark` class on <html> drives Tailwind's
 * `dark:` variant, the shadcn tokens and the Shiki code-block colours.
 *
 * The inline script in index.html applies the class before first paint
 * (no flash). It duplicates THEME_STORAGE_KEY and the resolve rule —
 * keep both in sync (theme.test.ts checks the key).
 */
export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'pyacademy:theme'
export const THEME_ORDER: readonly ThemePreference[] = ['light', 'dark', 'system']

export function parseThemePreference(value: unknown): ThemePreference {
  return value === 'light' || value === 'dark' ? value : 'system'
}

export function resolveTheme(pref: ThemePreference, systemPrefersDark: boolean): ResolvedTheme {
  if (pref === 'system') return systemPrefersDark ? 'dark' : 'light'
  return pref
}

export function nextThemePreference(pref: ThemePreference): ThemePreference {
  return THEME_ORDER[(THEME_ORDER.indexOf(pref) + 1) % THEME_ORDER.length]
}

export function readStoredTheme(): ThemePreference {
  try {
    return parseThemePreference(localStorage.getItem(THEME_STORAGE_KEY))
  } catch {
    return 'system'
  }
}

export function storeTheme(pref: ThemePreference): void {
  try {
    if (pref === 'system') localStorage.removeItem(THEME_STORAGE_KEY)
    else localStorage.setItem(THEME_STORAGE_KEY, pref)
  } catch {
    // Storage blocked (private mode, quota): the choice lasts for this page only.
  }
}

export function applyTheme(theme: ResolvedTheme): void {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.style.colorScheme = theme
}
