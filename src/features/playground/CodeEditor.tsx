import { lazy, Suspense } from 'react'
import type { CodeEditorProps } from '@/features/editor/types'
import { cn } from '@/lib/utils'

export type { CodeEditorProps } from '@/features/editor/types'

const PythonEditor = lazy(() => import('@/features/editor/PythonEditor'))

/** CodeMirror (highlighting, auto-indent, brackets); a plain textarea while it loads. */
export function CodeEditor(props: CodeEditorProps) {
  return (
    <Suspense fallback={<TextareaEditor {...props} />}>
      <PythonEditor {...props} />
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
      className={cn('code-editor block w-full resize-none bg-transparent p-3 pl-12 font-mono leading-relaxed outline-none', className)}
    />
  )
}
