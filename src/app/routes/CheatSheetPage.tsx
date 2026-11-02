import { useParams } from 'react-router'
import { MdxContent } from '@/components/mdx/MdxContent'
import { findCheatSheet } from '@/content/registry'
import NotFoundPage from './NotFoundPage'

export default function CheatSheetPage() {
  const sheet = findCheatSheet(useParams().slug)
  if (!sheet) return <NotFoundPage />
  return (
    <article className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-3xl font-bold">{sheet.title}</h1>
      <MdxContent sourcePath={sheet.sourcePath} />
    </article>
  )
}
