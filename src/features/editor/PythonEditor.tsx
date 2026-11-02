/**
 * CodeMirror 6 Python editor (bundled, so it works offline in the installed
 * app). Touch-friendly: native selection handles, phone keyboards, and the
 * KeyBar for symbols that phone keyboards hide.
 *
 * Loaded lazily by CodeEditor — never on lesson pages.
 */
import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete'
import { defaultKeymap, history, historyKeymap, indentLess, indentWithTab, redo, undo } from '@codemirror/commands'
import { python } from '@codemirror/lang-python'
import { bracketMatching, HighlightStyle, indentOnInput, indentUnit, syntaxHighlighting } from '@codemirror/language'
import { EditorState } from '@codemirror/state'
import { drawSelection, EditorView, highlightActiveLine, highlightActiveLineGutter, keymap, lineNumbers } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'
import { useEffect, useImperativeHandle, useLayoutEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import type { CodeEditorProps } from './types'

// Colours come from CSS variables (globals.css) so light/dark switch without rebuilding the editor.
const highlight = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.definitionKeyword, t.moduleKeyword, t.operatorKeyword], color: 'var(--syn-keyword)' },
  { tag: [t.string, t.special(t.string), t.docString], color: 'var(--syn-string)' },
  { tag: [t.comment, t.lineComment], color: 'var(--syn-comment)', fontStyle: 'italic' },
  { tag: [t.number, t.bool, t.null, t.self], color: 'var(--syn-number)' },
  { tag: [t.function(t.variableName), t.function(t.propertyName), t.function(t.definition(t.variableName))], color: 'var(--syn-function)' },
  { tag: [t.className, t.definition(t.className)], color: 'var(--syn-class)' },
  { tag: [t.escape, t.special(t.variableName)], color: 'var(--syn-class)' },
])

const theme = EditorView.theme({
  '&': { height: '100%', backgroundColor: 'transparent', color: 'var(--foreground)' },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': { fontFamily: 'var(--font-mono)', lineHeight: '1.6' },
  '.cm-content': { padding: '10px 0', caretColor: 'var(--editor-caret)' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--editor-caret)', borderLeftWidth: '2px' },
  '.cm-gutters': { backgroundColor: 'transparent', color: 'var(--muted-foreground)', border: 'none', paddingLeft: '4px' },
  '.cm-activeLine': { backgroundColor: 'var(--editor-active-line)' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--foreground)' },
  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground': { backgroundColor: 'var(--editor-selection)' },
  '.cm-matchingBracket': { backgroundColor: 'var(--editor-selection)', outline: 'none' },
  '.cm-tooltip': { border: '1px solid var(--border)', backgroundColor: 'var(--popover)', color: 'var(--popover-foreground)', borderRadius: '8px' },
  '.cm-tooltip-autocomplete > ul > li': { padding: '6px 10px' },
  '.cm-tooltip-autocomplete > ul > li[aria-selected]': { backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' },
})

export default function PythonEditor({ value, onChange, onRun, onFocus, label, className, editorRef }: CodeEditorProps) {
  const host = useRef<HTMLDivElement>(null)
  const view = useRef<EditorView | null>(null)
  const latest = useRef({ onChange, onRun, onFocus })
  useLayoutEffect(() => {
    latest.current = { onChange, onRun, onFocus }
  })

  // Create once; later `value` changes (reset, imported code) are pushed in below.
  useEffect(() => {
    const v = new EditorView({
      parent: host.current!,
      state: EditorState.create({
        doc: value,
        extensions: [
          lineNumbers(),
          highlightActiveLineGutter(),
          highlightActiveLine(),
          history(),
          drawSelection(),
          indentOnInput(),
          bracketMatching(),
          closeBrackets(),
          autocompletion({ icons: false }),
          python(),
          indentUnit.of('    '),
          EditorState.tabSize.of(4),
          syntaxHighlighting(highlight),
          theme,
          keymap.of([
            {
              key: 'Mod-Enter',
              run: () => {
                latest.current.onRun()
                return true
              },
            },
            ...closeBracketsKeymap,
            ...completionKeymap,
            ...defaultKeymap,
            ...historyKeymap,
            indentWithTab,
          ]),
          EditorView.contentAttributes.of({
            'aria-label': label,
            'aria-multiline': 'true',
            autocapitalize: 'off',
            autocorrect: 'off',
            spellcheck: 'false',
          }),
          EditorView.updateListener.of((u) => {
            if (u.docChanged) latest.current.onChange(u.state.doc.toString())
            if (u.focusChanged && u.view.hasFocus) latest.current.onFocus?.()
          }),
        ],
      }),
    })
    view.current = v
    return () => {
      v.destroy()
      view.current = null
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- created once; `value` is synced by the next effect
  }, [])

  useEffect(() => {
    const v = view.current
    if (v && v.state.doc.toString() !== value) v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: value } })
  }, [value])

  useImperativeHandle(
    editorRef,
    () => ({
      insert(text: string) {
        const v = view.current
        if (!v) return
        v.dispatch(v.state.replaceSelection(text), { scrollIntoView: true, userEvent: 'input.type' })
        v.focus()
      },
      dedent() {
        if (view.current) indentLess(view.current)
      },
      undo() {
        if (view.current) undo(view.current)
      },
      redo() {
        if (view.current) redo(view.current)
      },
      focus() {
        view.current?.focus()
      },
    }),
    [],
  )

  return <div ref={host} className={cn('code-editor', className)} />
}
