import { createBrowserRouter } from 'react-router'
import RouteError from './RouteError'
import { RootLayout } from './RootLayout'

/**
 * Route map. Every page is code-split with `lazy` so heavy pages (playground,
 * problems with Monaco) never load on plain lesson pages.
 *
 * BrowserRouter-style URLs need the Render rewrite  /*  →  /index.html.
 *
 * Errors: the pathless child route catches page errors (incl. failed chunk
 * loads) inside the layout, so the header stays usable. The root
 * errorElement is the last resort if the layout itself fails.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      {
        errorElement: <RouteError />,
        // Shown inside the layout while the first page's chunk loads.
        hydrateFallbackElement: <p role="status" className="text-muted-foreground">Loading…</p>,
        children: [
          { index: true, lazy: async () => ({ Component: (await import('./routes/HomePage')).default }) },
          { path: 'learn', lazy: async () => ({ Component: (await import('./routes/LearnIndexPage')).default }) },
          { path: 'learn/:category/:slug', lazy: async () => ({ Component: (await import('./routes/LessonPage')).default }) },
          { path: 'cheat-sheets', lazy: async () => ({ Component: (await import('./routes/CheatSheetsIndexPage')).default }) },
          { path: 'cheat-sheets/:slug', lazy: async () => ({ Component: (await import('./routes/CheatSheetPage')).default }) },
          { path: 'problems', lazy: async () => ({ Component: (await import('./routes/ProblemsIndexPage')).default }) },
          { path: 'problems/:slug', lazy: async () => ({ Component: (await import('./routes/ProblemPage')).default }) },
          { path: 'playground', lazy: async () => ({ Component: (await import('./routes/PlaygroundPage')).default }) },
          { path: 'progress', lazy: async () => ({ Component: (await import('./routes/ProgressPage')).default }) },
          { path: '*', lazy: async () => ({ Component: (await import('./routes/NotFoundPage')).default }) },
        ],
      },
    ],
  },
])
