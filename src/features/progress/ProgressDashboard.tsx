import { Download, RotateCcw, Upload } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { findLessonById, manifest } from '@/content/registry'
import { ImportError } from './localProgressStore'
import { useProgress } from './useProgress'

export function ProgressDashboard() {
  const { progress, controller } = useProgress()
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const importHelpId = useId()

  const lessons = manifest.lessons
  const completed = lessons.filter((l) => progress.completedLessonIds.includes(l.id))
  const solved = manifest.problems.filter((p) => progress.solvedSampleProblemIds.includes(p.id))
  const attempted = manifest.problems.filter((p) => progress.attemptedProblemIds.includes(p.id) && !progress.solvedSampleProblemIds.includes(p.id))
  const last = progress.lastVisitedLesson && findLessonById(progress.lastVisitedLesson.id)

  const exportFile = () => {
    const blob = new Blob([controller.store.exportJson()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pyacademy-progress-${new Date().toISOString().slice(0, 10)}.json`
    document.body.append(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setMessage({ text: 'Progress exported. Keep the file to restore it on another device or browser.' })
  }

  const importFile = async (file: File | undefined) => {
    if (!file) return
    try {
      const imported = controller.store.importJson(await file.text())
      controller.reload()
      setMessage({ text: `Progress imported: ${imported.completedLessonIds.length} lessons completed, ${imported.solvedSampleProblemIds.length} problems solved.` })
    } catch (err) {
      setMessage({ text: err instanceof ImportError ? err.message : 'Could not read that file.', error: true })
    } finally {
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const reset = () => {
    controller.store.reset()
    controller.reload()
    setConfirmReset(false)
    setMessage({ text: 'Progress reset.' })
  }

  return (
    <div className="space-y-6">
      <dl className="grid gap-3 sm:grid-cols-3">
        <Stat label="Lessons completed" value={`${completed.length} / ${lessons.length}`} />
        <Stat label="Problems solved (samples)" value={`${solved.length} / ${manifest.problems.length}`} />
        <Stat label="Problems attempted" value={String(attempted.length + solved.length)} />
      </dl>

      {last && (
        <p className="text-sm">
          Last lesson: <Link to={last.url} className="font-medium underline underline-offset-4">{last.title}</Link>
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle><h2>Completed lessons</h2></CardTitle>
          </CardHeader>
          <CardContent>
            {completed.length === 0 ? (
              <p className="text-sm text-muted-foreground">None yet — use “Mark as complete” at the end of a lesson.</p>
            ) : (
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {completed.map((l) => <li key={l.id}><Link to={l.url} className="underline-offset-4 hover:underline">{l.title}</Link></li>)}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle><h2>Problems</h2></CardTitle>
            <CardDescription>“Solved” means your code passed every sample — not an official verdict.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {solved.length + attempted.length === 0 && <p className="text-muted-foreground">No problems tried yet.</p>}
            {solved.length > 0 && (
              <ul className="list-disc space-y-1 pl-5">
                {solved.map((p) => <li key={p.id}><Link to={p.url} className="underline-offset-4 hover:underline">{p.title}</Link> — solved</li>)}
              </ul>
            )}
            {attempted.length > 0 && (
              <ul className="list-disc space-y-1 pl-5">
                {attempted.map((p) => <li key={p.id}><Link to={p.url} className="underline-offset-4 hover:underline">{p.title}</Link> — attempted</li>)}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <section aria-labelledby="backup-heading" className="space-y-3">
        <h2 id="backup-heading" className="font-semibold">Back up or move your progress</h2>
        <p id={importHelpId} className="text-sm text-muted-foreground">
          Export saves a small JSON file. Import replaces the progress in this browser with the file’s contents.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={exportFile} className="h-10 px-4"><Download aria-hidden /> Export</Button>
          <Button variant="outline" className="h-10 px-4" aria-describedby={importHelpId} onClick={() => fileInput.current?.click()}>
            <Upload aria-hidden /> Import…
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept=".json,application/json"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(e) => void importFile(e.target.files?.[0])}
          />
          <Button variant="destructive" className="h-10 px-4" onClick={() => setConfirmReset(true)}>
            <RotateCcw aria-hidden /> Reset…
          </Button>
        </div>
        <p role="status" aria-live="polite" className={message?.error ? 'text-sm text-destructive' : 'text-sm text-muted-foreground'}>
          {message?.text}
        </p>
      </section>

      <Dialog open={confirmReset} onOpenChange={setConfirmReset}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset all progress?</DialogTitle>
            <DialogDescription>
              This removes completed lessons and problem results from this browser. Export first if you might want them back.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="h-10 px-4">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" className="h-10 px-4" onClick={reset}>Reset progress</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-2xl font-semibold tabular-nums">{value}</dd>
    </div>
  )
}
