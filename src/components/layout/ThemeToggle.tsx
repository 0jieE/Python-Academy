import { Monitor, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'
import { nextThemePreference, type ThemePreference } from '@/lib/theme'

const icons = { light: Sun, dark: Moon, system: Monitor } satisfies Record<ThemePreference, unknown>
const labels: Record<ThemePreference, string> = { light: 'Light', dark: 'Dark', system: 'System' }

/** One button that cycles light → dark → system. */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const next = nextThemePreference(theme)
  const Icon = icons[theme]
  const label = `Theme: ${labels[theme]}. Switch to ${labels[next].toLowerCase()}.`
  return (
    <Button variant="ghost" size="icon" className="size-10" aria-label={label} title={label} onClick={() => setTheme(next)}>
      <Icon className="size-5" />
    </Button>
  )
}
