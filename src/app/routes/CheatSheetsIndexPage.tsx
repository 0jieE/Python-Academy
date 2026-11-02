import { NotebookTabs } from 'lucide-react'
import { Link } from 'react-router'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { manifest } from '@/content/registry'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function CheatSheetsIndexPage() {
  useDocumentTitle('Cheat sheets')
  return (
    <div className="tone-sheets space-y-6">
      <PageHeader tone="sheets" icon={NotebookTabs} title="Cheat sheets">
        <p className="text-sm text-foreground/80">One-page reviewers to skim before a contest.</p>
      </PageHeader>
      <ul className="grid gap-3 sm:grid-cols-2">
        {manifest.cheatSheets.map((c) => (
          <li key={c.id}>
            <Link to={c.url} className="group block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              <Card className="row-stripe h-full pl-1 transition-shadow group-hover:ring-(--tone)/60">
                <CardHeader>
                  <CardTitle>{c.title}</CardTitle>
                  <CardDescription>{c.summary}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
