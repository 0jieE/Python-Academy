import { useId } from 'react'
import { NavLink } from 'react-router'
import { DoneMark } from '@/features/progress/LessonProgress'
import { cn } from '@/lib/utils'

export interface SidebarGroup {
  title: string
  items: { id: string; title: string; url: string }[]
}

/** Category lists with the current page highlighted. Shown from the `lg` breakpoint. */
export function LessonSidebar({ groups, label, completedIds = [] }: { groups: SidebarGroup[]; label: string; completedIds?: string[] }) {
  const baseId = useId()
  return (
    <aside className="hidden lg:block">
      <nav aria-label={label} className="sticky top-20 max-h-[calc(100dvh-6rem)] space-y-6 overflow-y-auto pr-2 text-sm">
        {groups.map((g, gi) => (
          <div key={g.title}>
            <p id={`${baseId}-${gi}`} className="mb-2 px-3 font-semibold">
              {g.title}
            </p>
            <ul aria-labelledby={`${baseId}-${gi}`} className="space-y-0.5">
              {g.items.map((item) => (
                <li key={item.id}>
                  <NavLink
                    to={item.url}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center justify-between gap-2 rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                        isActive && 'bg-muted font-medium text-foreground',
                      )
                    }
                  >
                    {item.title}
                    <DoneMark done={completedIds.includes(item.id)} />
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
