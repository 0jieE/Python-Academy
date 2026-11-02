import { RefreshCw, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { applyUpdate, usePwa } from './pwaState'

/** Offline strip under the header, and a "new version" pill above the tab bar. */
export function AppNotices() {
  const { online, updateReady } = usePwa()
  return (
    <>
      {!online && (
        <p role="status" className="flex items-center justify-center gap-2 border-b bg-muted px-4 py-1.5 text-center text-xs text-muted-foreground">
          <WifiOff aria-hidden className="size-3.5 shrink-0" />
          Offline. Pages you've opened still work, and Python runs if it loaded once before.
        </p>
      )}
      {updateReady && (
        <div role="status" className="update-pill">
          <span>A new version is ready.</span>
          <Button size="sm" onClick={applyUpdate} className="h-9 rounded-full px-3">
            <RefreshCw aria-hidden /> Reload
          </Button>
        </div>
      )}
    </>
  )
}
