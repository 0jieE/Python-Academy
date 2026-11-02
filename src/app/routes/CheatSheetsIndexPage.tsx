import { Link } from 'react-router'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { manifest } from '@/content/registry'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function CheatSheetsIndexPage() {
  useDocumentTitle('Cheat sheets')
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Cheat sheets</h1>
      <ul className="grid gap-3 sm:grid-cols-2">
        {manifest.cheatSheets.map((c) => (
          <li key={c.id}>
            <Link to={c.url} className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              <Card className="h-full transition-shadow group-hover:ring-emerald-500/60">
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
