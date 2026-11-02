import { Suspense } from 'react'
import { Outlet, ScrollRestoration } from 'react-router'
import { AppTabBar } from '@/components/layout/AppTabBar'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { AppNotices } from '@/features/pwa/AppNotices'
import { StorageBanner } from '@/features/progress/StorageBanner'
import { useFocusHeadingOnNavigate } from '@/hooks/useFocusHeadingOnNavigate'
import { cn } from '@/lib/utils'
import { useRouteHandle } from './routeHandle'

export function RootLayout() {
  useFocusHeadingOnNavigate('main')
  // The IDE fills the screen like an app; on phones it brings its own toolbar.
  const app = useRouteHandle().layout === 'app'
  return (
    <div className={cn('flex flex-col', app ? 'h-dvh' : 'min-h-dvh')}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-background focus:px-3 focus:py-2">
        Skip to content
      </a>
      <SiteHeader className={app ? 'max-md:hidden' : undefined} />
      <AppNotices />
      <StorageBanner />
      <main id="main" className={app ? 'flex min-h-0 flex-1 flex-col' : 'mx-auto w-full max-w-6xl flex-1 px-4 pt-5 pb-8 md:py-8'}>
        <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
          <Outlet />
        </Suspense>
      </main>
      {!app && (
        <footer className="hidden border-t px-4 py-6 text-center text-xs text-muted-foreground md:block">
          Practice site for Python contests. Sample tests run in your browser and are not an official judge.
        </footer>
      )}
      <AppTabBar />
      <ScrollRestoration />
    </div>
  )
}
