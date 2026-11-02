import { Play } from 'lucide-react'
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { playgroundUrl } from '@/features/playground/urlState'

/**
 * A highlighted code block (the fenced block inside it, highlighted by Shiki at
 * build time) with an "Open in Playground" link that carries the code and
 * stdin in the URL. Nothing here loads Pyodide or Monaco.
 *
 *   <RunnableExample stdin="3 4">
 *
 *   ```python
 *   a, b = map(int, input().split())
 *   print(a + b)
 *   ```
 *
 *   </RunnableExample>
 */
export function RunnableExample({ stdin = '', title = 'Example', children }: { stdin?: string; title?: string; children: ReactNode }) {
  const codeRef = useRef<HTMLDivElement>(null)
  const [href, setHref] = useState('/playground')

  // The raw code is the text of the highlighted <pre>; read it after render.
  useLayoutEffect(() => {
    const code = codeRef.current?.querySelector('pre')?.textContent ?? ''
    setHref(playgroundUrl({ code: code.replace(/\n+$/, '') + '\n', stdin }))
  }, [stdin, children])

  return (
    <figure className="not-prose my-6 overflow-hidden rounded-lg border">
      <figcaption className="flex items-center justify-between gap-2 border-b bg-muted/50 py-1 pr-1 pl-3 text-sm">
        <span className="font-medium">{title}</span>
        <Button asChild variant="ghost" className="h-10 px-3">
          <Link to={href}>
            <Play aria-hidden />
            Open in Playground
          </Link>
        </Button>
      </figcaption>
      {/* `!`: the unlayered .shiki rule in globals.css beats normal utilities. */}
      <div ref={codeRef} className="[&_.shiki]:my-0! [&_.shiki]:rounded-none! [&_.shiki]:border-0!">
        {children}
      </div>
      {stdin && (
        <div className="border-t bg-muted/30 px-4 py-2 text-sm">
          <p className="text-xs font-medium text-muted-foreground">Input (stdin)</p>
          <pre className="overflow-x-auto font-mono">{stdin}</pre>
        </div>
      )}
    </figure>
  )
}
