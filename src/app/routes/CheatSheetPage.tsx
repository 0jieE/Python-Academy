import { useParams } from 'react-router'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { LessonSidebar } from '@/components/layout/LessonSidebar'
import { PrevNext } from '@/components/layout/PrevNext'
import { MdxContent } from '@/components/mdx/MdxContent'
import { CATEGORY_TITLES, findCheatSheet, manifest } from '@/content/registry'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { neighbours } from '@/lib/neighbours'
import NotFoundPage from './NotFoundPage'

const sidebarGroups = [{ title: CATEGORY_TITLES['cheat-sheets'], items: manifest.cheatSheets }]

export default function CheatSheetPage() {
  const sheet = findCheatSheet(useParams().slug)
  useDocumentTitle(sheet?.title ?? 'Page not found')
  if (!sheet) return <NotFoundPage />
  const { prev, next } = neighbours(manifest.cheatSheets, sheet.id)
  return (
    <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
      <LessonSidebar label="Cheat sheets" groups={sidebarGroups} />
      <article className="mx-auto w-full max-w-4xl min-w-0 space-y-6">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Cheat sheets', to: '/cheat-sheets' }, { label: sheet.title }]} />
        <h1 className="text-3xl font-bold">{sheet.title}</h1>
        <MdxContent sourcePath={sheet.sourcePath} />
        <PrevNext prev={prev} next={next} label="Cheat sheet navigation" />
      </article>
    </div>
  )
}
