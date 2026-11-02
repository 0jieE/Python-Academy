import { BookOpen, ChartNoAxesColumnIncreasing, Dumbbell, House, SquareTerminal } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import { cn } from '@/lib/utils'

const tabs = [
  { to: '/', label: 'Home', icon: House, match: (p: string) => p === '/' },
  { to: '/learn', label: 'Learn', icon: BookOpen, match: (p: string) => p.startsWith('/learn') || p.startsWith('/cheat-sheets') },
  { to: '/problems', label: 'Practice', icon: Dumbbell, match: (p: string) => p.startsWith('/problems') },
  { to: '/playground', label: 'IDE', icon: SquareTerminal, match: (p: string) => p.startsWith('/playground') },
  { to: '/progress', label: 'Progress', icon: ChartNoAxesColumnIncreasing, match: (p: string) => p.startsWith('/progress') },
]

/** Phone navigation: a bottom tab bar within thumb reach (hidden from md up, where the header nav shows). */
export function AppTabBar() {
  const { pathname } = useLocation()
  return (
    <nav aria-label="Main" className="tabbar md:hidden">
      <ul className="grid grid-cols-5">
        {tabs.map(({ to, label, icon: Icon, match }) => {
          const active = match(pathname)
          return (
            <li key={to}>
              <Link to={to} viewTransition aria-current={active ? 'page' : undefined} className="tabbar-link">
                <span className={cn('tabbar-pill', active && 'is-active')}>
                  <Icon aria-hidden className="size-5" strokeWidth={active ? 2.25 : 1.75} />
                </span>
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
