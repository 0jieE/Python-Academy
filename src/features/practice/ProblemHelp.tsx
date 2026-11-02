import { BookOpen, Lightbulb } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MdxContent } from '@/components/mdx/MdxContent'

/** Hints revealed one at a time. */
export function Hints({ hints }: { hints: string[] }) {
  const [shown, setShown] = useState(0)
  if (hints.length === 0) return null
  return (
    <section aria-labelledby="hints-heading" className="space-y-2">
      <h2 id="hints-heading" className="font-semibold">
        Hints
      </h2>
      {shown > 0 && (
        <ol className="list-decimal space-y-1 pl-5 text-sm" aria-live="polite">
          {hints.slice(0, shown).map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ol>
      )}
      {shown < hints.length && (
        <Button variant="outline" className="h-10" onClick={() => setShown((n) => n + 1)}>
          <Lightbulb aria-hidden />
          {shown === 0 ? `Show a hint (${hints.length} available)` : `Show hint ${shown + 1} of ${hints.length}`}
        </Button>
      )}
    </section>
  )
}

/** Editorial MDX, loaded only when the student asks for it. */
export function Editorial({ sourcePath }: { sourcePath: string }) {
  const [open, setOpen] = useState(false)
  return (
    <section aria-labelledby="editorial-heading" className="space-y-2">
      <h2 id="editorial-heading" className="font-semibold">
        Editorial
      </h2>
      {open ? (
        <div className="rounded-lg border p-4">
          <MdxContent sourcePath={sourcePath} />
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">Try the problem first — the editorial shows a full solution.</p>
          <Button variant="outline" className="h-10" onClick={() => setOpen(true)}>
            <BookOpen aria-hidden /> Show editorial
          </Button>
        </>
      )}
    </section>
  )
}
