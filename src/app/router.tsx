import { createBrowserRouter } from 'react-router'
import { RootLayout } from './RootLayout'

/**
 * Route map. Every page is code-split with `lazy` so heavy pages (playground,
 * problems with Monaco) never load on plain lesson pages.
 *
 * BrowserRouter-style URLs need the Render rewrite  /*  →  /index.html.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
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
])
