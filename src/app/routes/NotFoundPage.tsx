import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <div className="space-y-3 py-16 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="text-muted-foreground">That lesson or page doesn’t exist (yet).</p>
      <Link to="/" className="text-emerald-700 underline underline-offset-4 dark:text-emerald-400">Back to the roadmap</Link>
    </div>
  )
}
