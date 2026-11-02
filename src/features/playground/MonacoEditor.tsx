import Editor, { loader, type BeforeMount, type OnMount } from '@monaco-editor/react'
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

  // vs-dark's comment green (#608b4e) is below WCAG AA contrast; brighten it.
  const handleBeforeMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme('pyacademy-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [{ token: 'comment', foreground: '7ca668' }],
      colors: {},
    })
  }

  const handleMount: OnMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => handlers.current.onRun())
    editor.onDidFocusEditorText(() => handlers.current.onFocus?.())
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Editor
        height="22rem"
        language="python"
        theme={resolvedTheme === 'dark' ? 'pyacademy-dark' : 'light'}
        value={value}
        onChange={(v) => onChange(v ?? '')}
        beforeMount={handleBeforeMount}
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
