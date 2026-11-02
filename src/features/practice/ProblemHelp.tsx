import { BookOpen, Lightbulb } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MdxContent } from '@/components/mdx/MdxContent'

/** Hints revealed one at a time. */
export function Hints({ hints }: { hints: string[] }) {
  const [shown, setShown] = useState(0)
  if (hints.length === 0) return null
  return (
    <section aria-labelledby="hints-heading" className="space-y-2 p-3 pl-3.5">
      <div className="flex items-center justify-between gap-3">
        <h2 id="hints-heading" className="flex items-center gap-2 font-semibold">
          <Lightbulb aria-hidden className="size-4 text-amber-600 dark:text-amber-400" />
          Hints
          <span className="text-sm font-normal text-muted-foreground tabular-nums">
            <span aria-hidden>{shown}/{hints.length}</span>
            <span className="sr-only">({shown} of {hints.length} shown)</span>
          </span>
        </h2>
        {shown < hints.length && (
          <Button variant="outline" className="h-10" onClick={() => setShown((n) => n + 1)}>
            {shown === 0 ? 'Show a hint' : 'Next hint'}
          </Button>
        )}
      </div>
      {shown > 0 && (
        <ol className="list-decimal space-y-1 pl-5 text-sm" aria-live="polite">
          {hints.slice(0, shown).map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ol>
      )}
    </section>
  )
}

/** Editorial MDX, loaded only when the student asks for it. */
export function Editorial({ sourcePath }: { sourcePath: string }) {
  const [open, setOpen] = useState(false)
  if (open) {
    return (
      <section aria-labelledby="editorial-heading" className="space-y-2 p-3 pl-3.5">
        <h2 id="editorial-heading" className="flex items-center gap-2 font-semibold">
          <BookOpen aria-hidden className="size-4 text-emerald-700 dark:text-emerald-400" />
          Editorial
        </h2>
        <div>
          <MdxContent sourcePath={sourcePath} />
        </div>
      </section>
    )
  }
  return (
    <section aria-labelledby="editorial-heading" className="flex items-center justify-between gap-3 p-3 pl-3.5">
      <div className="min-w-0">
        <h2 id="editorial-heading" className="flex items-center gap-2 font-semibold">
          <BookOpen aria-hidden className="size-4 text-emerald-700 dark:text-emerald-400" />
          Editorial
        </h2>
        <p className="text-xs text-muted-foreground">Try the problem first.</p>
      </div>
      <Button variant="outline" className="h-10" onClick={() => setOpen(true)}>
        Show editorial
      </Button>
    </section>
  )
}
