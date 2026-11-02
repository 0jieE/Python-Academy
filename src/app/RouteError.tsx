import { useEffect, useState } from 'react'
import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import { Button } from '@/components/ui/button'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { claimChunkReload, isChunkLoadError } from '@/lib/chunkError'

/**
 * Route error boundary. A failed chunk load (usually: the site was redeployed
 * while this tab was open) reloads the page once; anything else — or a second
 * chunk failure — shows a friendly message instead of a white screen.
 */
export default function RouteError() {
  const error = useRouteError()
  const chunkError = isChunkLoadError(error)
  const [reloading] = useState(() => chunkError && claimChunkReload())
  useDocumentTitle('Something went wrong')

  useEffect(() => {
    if (reloading) window.location.reload()
  }, [reloading])

  if (reloading) {
    return (
      <p role="status" className="py-16 text-center text-muted-foreground">
        Loading the latest version of the site…
      </p>
    )
  }

  const notFound = isRouteErrorResponse(error) && error.status === 404
  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">{notFound ? 'Page not found' : 'Something went wrong'}</h1>
      <p className="text-muted-foreground">
        {chunkError
          ? 'Part of the page could not be downloaded. The site may have just been updated, or your connection dropped.'
          : notFound
            ? 'That page doesn’t exist (yet).'
            : 'This page hit an unexpected error. Reloading usually fixes it.'}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button className="h-10 px-4" onClick={() => window.location.reload()}>
          Reload page
        </Button>
        <Button asChild variant="outline" className="h-10 px-4">
          <Link to="/">Back to the roadmap</Link>
        </Button>
      </div>
      {import.meta.env.DEV && error instanceof Error && (
        <pre className="overflow-x-auto rounded bg-muted p-3 text-left text-xs">{error.stack ?? error.message}</pre>
      )}
    </div>
  )
}
