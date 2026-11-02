import { Link } from 'react-router'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function NotFoundPage() {
  useDocumentTitle('Page not found')
  return (
    <div className="space-y-3 py-16 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="text-muted-foreground">That lesson or page doesn’t exist (yet).</p>
      <Link to="/" className="text-emerald-700 underline underline-offset-4 dark:text-emerald-400">Back to the roadmap</Link>
    </div>
  )
}
