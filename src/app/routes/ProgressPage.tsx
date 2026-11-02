export default function ProgressPage() {
  // TODO(T11): completed lessons, attempted/solved-sample problems, export/import/reset.
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My progress</h1>
      <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
        Progress is saved only in this browser on this device. Clearing browser data or switching devices removes it.
      </p>
    </div>
  )
}
