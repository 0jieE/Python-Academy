import { Menu, Search } from 'lucide-react'
import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router'
import { Button, buttonVariants } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './ThemeToggle'

// cmdk + dialog load only when search is first opened.
const SearchDialog = lazy(() => import('@/features/search/SearchDialog'))

const nav = [
  { to: '/learn', label: 'Learn' },
  { to: '/problems', label: 'Problems' },
  { to: '/cheat-sheets', label: 'Cheat sheets' },
  { to: '/playground', label: 'Playground' },
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

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchLoaded, setSearchLoaded] = useState(false)
  const openSearch = () => {
    setSearchLoaded(true)
    setSearchOpen(true)
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
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4">
        <Link to="/" className="mr-auto font-semibold tracking-tight">
          <Logo />
        </Link>
        <Button variant="outline" onClick={openSearch} className="h-10 gap-2 px-3 text-muted-foreground lg:w-48 lg:justify-start" aria-keyshortcuts="Control+K Meta+K">
          <Search aria-hidden className="size-4" />
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
        <ThemeToggle />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="size-10 md:hidden" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle>
                <Logo />
              </SheetTitle>
              <SheetDescription className="sr-only">Site navigation</SheetDescription>
            </SheetHeader>
            <nav aria-label="Main" className="flex flex-col gap-1 px-4">
              {nav.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  className={linkClass('h-11 justify-start px-3 text-base')}
                  onClick={() => setOpen(false)}
                >
                  {n.label}
                </NavLink>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
      {searchLoaded && (
        <Suspense fallback={null}>
          <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
        </Suspense>
      )}
    </header>
  )
}
