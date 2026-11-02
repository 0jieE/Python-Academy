import { Download, Share, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { isIos, isStandalone, promptInstall, usePwa } from './pwaState'

const DISMISS_KEY = 'pyacademy:install-dismissed'

function wasDismissed() {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    return false
  }
}

/** Home-page invitation to add the app to the home screen (hidden once installed or dismissed). */
export function InstallCard() {
  const { installEvent, installed } = usePwa()
  const [dismissed, setDismissed] = useState(wasDismissed)
  const ios = isIos()
  if (dismissed || installed || isStandalone() || (!installEvent && !ios)) return null

  const dismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // Storage blocked: it comes back next visit.
    }
  }

  return (
    <aside aria-label="Install the app" className="flex max-w-xl items-start gap-3 rounded-xl border bg-card p-4">
      <img src="/icons/icon-192.png" alt="" className="size-11 shrink-0 rounded-[0.7rem]" />
      <div className="min-w-0 flex-1 space-y-2">
        <p className="font-medium">Keep PyAcademy on your phone</p>
        {installEvent ? (
          <>
            <p className="text-sm text-muted-foreground">Lessons, problems and the IDE open from your home screen and work offline.</p>
            <Button variant="run" className="h-10 px-4" onClick={() => void promptInstall()}>
              <Download aria-hidden /> Install app
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            In Safari, tap <Share aria-label="Share" className="inline size-4 align-text-bottom" /> then <strong className="font-medium text-foreground">Add to Home Screen</strong>. Lessons, problems and the IDE then work offline.
          </p>
        )}
      </div>
      <Button variant="ghost" size="icon" className="-mt-1 -mr-1 size-10" aria-label="Dismiss" onClick={dismiss}>
        <X className="size-4.5" />
      </Button>
    </aside>
  )
}
