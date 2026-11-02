import { Suspense } from 'react'
import { Outlet, ScrollRestoration } from 'react-router'
import { SiteHeader } from '@/components/layout/SiteHeader'

export function RootLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-background focus:px-3 focus:py-2">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
          <Outlet />
        </Suspense>
      </main>
      <footer className="border-t px-4 py-6 text-center text-xs text-muted-foreground">
        Practice site for Python contests. Sample tests run in your browser and are not an official judge.
      </footer>
      <ScrollRestoration />
    </div>
  )
}
