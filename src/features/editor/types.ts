import type { Ref } from 'react'

/** Commands for the symbol key bar (works on the CodeMirror editor; the textarea fallback ignores them). */
export interface EditorHandle {
  insert(text: string): void
  dedent(): void
  undo(): void
  redo(): void
  focus(): void
}

export interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  /** Ctrl/⌘+Enter. */
  onRun: () => void
  /** Good moment to start loading Python. */
  onFocus?: () => void
  label: string
  className?: string
  editorRef?: Ref<EditorHandle>
}
