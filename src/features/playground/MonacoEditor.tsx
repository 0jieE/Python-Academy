import Editor, { loader, type OnMount } from '@monaco-editor/react'
import { useEffect, useRef } from 'react'
import { useTheme } from '@/hooks/useTheme'
import type { CodeEditorProps } from './CodeEditor'
import { MONACO_VS_URL } from './config'

// Monaco itself loads from jsDelivr (pinned), never from dist/.
loader.config({ paths: { vs: MONACO_VS_URL } })

export default function MonacoEditor({ value, onChange, onRun, onFocus, label, onLoadError }: CodeEditorProps & { onLoadError: () => void }) {
  const { resolvedTheme } = useTheme()
  const handlers = useRef({ onRun, onFocus })
  useEffect(() => {
    handlers.current = { onRun, onFocus }
  }, [onRun, onFocus])

  // CDN blocked or offline → fall back to the textarea editor.
  useEffect(() => {
    loader.init().catch(onLoadError)
  }, [onLoadError])

  const handleMount: OnMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => handlers.current.onRun())
    editor.onDidFocusEditorText(() => handlers.current.onFocus?.())
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Editor
        height="22rem"
        language="python"
        theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
        value={value}
        onChange={(v) => onChange(v ?? '')}
        onMount={handleMount}
        loading={<p className="p-3 text-sm text-muted-foreground">Loading editor…</p>}
        options={{
          ariaLabel: label,
          minimap: { enabled: false },
          fontSize: 14,
          tabSize: 4,
          insertSpaces: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 12 },
        }}
      />
    </div>
  )
}
