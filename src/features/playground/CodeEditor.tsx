import { lazy, Suspense, useState } from 'react'
import { cn } from '@/lib/utils'

const MonacoEditor = lazy(() => import('./MonacoEditor'))

export interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  /** Ctrl/⌘+Enter. */
  onRun: () => void
  /** Good moment to start loading Python. */
  onFocus?: () => void
  label: string
  className?: string
}

/** Monaco on desktop (fine pointer, ≥ 768 px); a plain textarea on touch / narrow screens. */
function prefersMonaco() {
  try {
    return window.matchMedia('(pointer: fine) and (min-width: 768px)').matches
  } catch {
    return false
  }
}

export function CodeEditor(props: CodeEditorProps) {
  const [useMonaco, setUseMonaco] = useState(prefersMonaco)
  if (!useMonaco) return <TextareaEditor {...props} />
  return (
    // While Monaco downloads, the textarea is already usable.
    <Suspense fallback={<TextareaEditor {...props} />}>
      <MonacoEditor {...props} onLoadError={() => setUseMonaco(false)} />
    </Suspense>
  )
}

export function TextareaEditor({ value, onChange, onRun, onFocus, label, className }: CodeEditorProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      onKeyDown={(e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault()
          onRun()
        }
      }}
      aria-label={label}
      spellCheck={false}
      autoCapitalize="off"
      autoCorrect="off"
      autoComplete="off"
      wrap="off"
      className={cn(
        'block min-h-72 w-full resize-y rounded-lg border bg-background p-3 font-mono text-base leading-relaxed outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:text-sm',
        className,
      )}
    />
  )
}
