import { useProgress } from './useProgress'

/** Shown site-wide when progress can't be saved, or saved data had to be reset. */
export function StorageBanner() {
  const { storageAvailable, recoveredFromCorrupt } = useProgress()
  if (storageAvailable && !recoveredFromCorrupt) return null
  return (
    <div role="status" className="border-b bg-amber-50 px-4 py-2 text-center text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
      {!storageAvailable
        ? 'Your browser is blocking site storage (private mode?). Progress works for now but is lost when you close this tab. Use Export on “My progress” to keep it.'
        : 'Your saved progress could not be read, so it was reset. A backup copy was kept in this browser.'}
    </div>
  )
}
