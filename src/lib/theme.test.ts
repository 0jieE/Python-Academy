import { describe, expect, it } from 'vitest'
import indexHtml from '../../index.html?raw'
import { nextThemePreference, parseThemePreference, resolveTheme, THEME_STORAGE_KEY } from './theme'

describe('theme', () => {
  it('treats missing or unknown stored values as system', () => {
    expect(parseThemePreference(null)).toBe('system')
    expect(parseThemePreference('blue')).toBe('system')
    expect(parseThemePreference('dark')).toBe('dark')
  })

  it('resolves system from the OS preference', () => {
    expect(resolveTheme('system', true)).toBe('dark')
    expect(resolveTheme('system', false)).toBe('light')
    expect(resolveTheme('light', true)).toBe('light')
  })

  it('cycles light → dark → system → light', () => {
    expect(nextThemePreference('light')).toBe('dark')
    expect(nextThemePreference('dark')).toBe('system')
    expect(nextThemePreference('system')).toBe('light')
  })

  it('index.html no-flash script uses the same storage key', () => {
    expect(indexHtml).toContain(`'${THEME_STORAGE_KEY}'`)
  })
})
