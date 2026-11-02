import { ListIndentDecrease, ListIndentIncrease, Redo2, Undo2 } from 'lucide-react'
import type { ReactNode, RefObject } from 'react'
import { cn } from '@/lib/utils'
import type { EditorHandle } from './types'

const SYMBOLS = ['(', ')', ':', '[', ']', '=', '"', "'", '#', '_', ',', '.', '+', '-', '*', '/', '%', '<', '>', '{', '}', '!']

/**
 * Symbols that phone keyboards hide behind extra taps. Buttons don't take
 * focus (pointerdown is cancelled), so the keyboard stays open while typing.
 */
export function KeyBar({ editor, className, children }: { editor: RefObject<EditorHandle | null>; className?: string; children?: ReactNode }) {
  const key = (label: string, onPress: () => void, content: ReactNode = label) => (
    <button
      key={label}
      type="button"
      aria-label={label}
      onPointerDown={(e) => e.preventDefault()}
      onClick={onPress}
      className="keybar-key"
    >
      {content}
    </button>
  )
  return (
    <div role="toolbar" aria-label="Code symbols" className={cn('keybar', className)}>
      <div className="keybar-scroll">
        {key('Indent', () => editor.current?.insert('    '), <ListIndentIncrease aria-hidden className="size-4" />)}
        {key('Outdent', () => editor.current?.dedent(), <ListIndentDecrease aria-hidden className="size-4" />)}
        {SYMBOLS.map((s) => key(s, () => editor.current?.insert(s)))}
        {key('Undo', () => editor.current?.undo(), <Undo2 aria-hidden className="size-4" />)}
        {key('Redo', () => editor.current?.redo(), <Redo2 aria-hidden className="size-4" />)}
      </div>
      {children}
    </div>
  )
}
