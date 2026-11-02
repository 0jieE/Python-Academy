import { ChevronLeft, Download, Search } from 'lucide-react'
import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router'
import { useRouteHandle } from '@/app/routeHandle'
import { Button, buttonVariants } from '@/components/ui/button'
import { promptInstall, usePwa } from '@/features/pwa/pwaState'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './ThemeToggle'

// cmdk + dialog load only when search is first opened.
const SearchDialog = lazy(() => import('@/features/search/SearchDialog'))

const nav = [
  { to: '/learn', label: 'Learn' },
  { to: '/problems', label: 'Problems' },
  { to: '/cheat-sheets', label: 'Cheat sheets' },
  { to: '/playground', label: 'IDE' },
  { to: '/progress', label: 'My progress' },
]

// NavLink's className is a function, which Radix Slot can't merge — so no <Button asChild> here.
const linkClass =
  (extra: string) =>
  ({ isActive }: { isActive: boolean }) =>
    cn(buttonVariants({ variant: 'ghost' }), extra, isActive && 'bg-muted text-foreground')

function Logo() {
  return (
    <>
      Py<span className="text-emerald-700 dark:text-emerald-400">Academy</span>
    </>
  )
}

/**
 * Desktop: logo, section links, search, theme.
 * Phone: an app bar — logo on top-level pages, a back button on nested ones
 * (sections live in the bottom tab bar).
 */
export function SiteHeader({ className }: { className?: string }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchLoaded, setSearchLoaded] = useState(false)
  const { back } = useRouteHandle()
  const { installEvent } = usePwa()
  const navigate = useNavigate()
  const openSearch = () => {
    setSearchLoaded(true)
    setSearchOpen(true)
  }

  // Back = the previous page when it was inside the app, otherwise the parent section.
  const goBack = () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (idx > 0) navigate(-1)
    else if (back) navigate(back.to)
  }

  // Ctrl/⌘ + K opens search from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchLoaded(true)
        setSearchOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header className={cn('app-header sticky top-0 z-40 border-b bg-background/95 backdrop-blur', className)}>
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-1 px-2 md:gap-2 md:px-4">
        {back && (
          <Button variant="ghost" onClick={goBack} className="h-10 gap-0.5 pr-3 pl-1.5 text-base md:hidden">
            <ChevronLeft aria-hidden className="size-6" />
            {back.label}
          </Button>
        )}
        <Link to="/" className={cn('mr-auto px-2 font-semibold tracking-tight', back && 'max-md:sr-only')}>
          <Logo />
        </Link>
        {back && <span className="mr-auto md:hidden" />}
        <Button variant="outline" onClick={openSearch} className="h-10 gap-2 px-3 text-muted-foreground max-md:border-0 max-md:shadow-none lg:w-48 lg:justify-start" aria-keyshortcuts="Control+K Meta+K">
          <Search aria-hidden className="size-5 md:size-4" />
          <span className="sr-only lg:not-sr-only">Search…</span>
          <kbd aria-hidden className="ml-auto hidden rounded border bg-muted px-1.5 font-mono text-[0.7rem] text-foreground lg:inline">Ctrl K</kbd>
        </Button>
        <nav aria-label="Main" className="hidden gap-1 md:flex">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} className={linkClass('h-9 px-3')}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        {installEvent && (
          <Button variant="ghost" size="icon" className="size-10" aria-label="Install app" title="Install app" onClick={() => void promptInstall()}>
            <Download className="size-5" />
          </Button>
        )}
        <ThemeToggle />
      </div>
      {searchLoaded && (
        <Suspense fallback={null}>
          <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
        </Suspense>
      )}
    </header>
  )
}
