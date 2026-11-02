import { ProgressDashboard } from '@/features/progress/ProgressDashboard'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function ProgressPage() {
  useDocumentTitle('My progress')
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My progress</h1>
      <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
        Progress is saved only in this browser on this device. Clearing browser data or switching devices removes it — use Export to keep a copy.
      </p>
      <ProgressDashboard />
    </div>
  )
}
