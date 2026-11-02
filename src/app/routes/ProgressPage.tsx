import { ChartNoAxesColumnIncreasing } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { ProgressDashboard } from '@/features/progress/ProgressDashboard'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function ProgressPage() {
  useDocumentTitle('My progress')
  return (
    <div className="tone-progress space-y-6">
      <PageHeader tone="progress" icon={ChartNoAxesColumnIncreasing} title="My progress">
        <p className="text-sm text-foreground/80">
          Saved only in this browser. Clearing browser data or switching devices removes it, so use Export to keep a copy.
        </p>
      </PageHeader>
      <ProgressDashboard />
    </div>
  )
}
