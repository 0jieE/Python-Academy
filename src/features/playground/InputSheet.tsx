import { CornerDownLeft, Square } from 'lucide-react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { useId, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

export interface InputExample {
  label: string
  text: string
}

export interface InputSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The line the program printed before asking (e.g. "Enter N:"). */
  prompt: string
  /** While the program continues with the line just sent. */
  busy: boolean
  examples?: InputExample[]
  onSend: (text: string) => void
  onEndInput: () => void
  onStop: () => void
}

/**
 * Pops up when a running program calls input(). A bottom sheet on phones
 * (sits above the keyboard), a small dialog on larger screens. It stays open
 * while the program continues, so the keyboard doesn't bounce between lines.
 */
export function InputSheet({ open, onOpenChange, prompt, busy, examples = [], onSend, onEndInput, onStop }: InputSheetProps) {
  const [text, setText] = useState('')
  // Keep showing the prompt that was asked while the program continues or the sheet closes.
  const [shownPrompt, setShownPrompt] = useState(prompt)
  if (open && !busy && prompt !== shownPrompt) setShownPrompt(prompt)
  const field = useRef<HTMLTextAreaElement>(null)
  const hintId = useId()
  const rows = Math.min(6, text.split('\n').length)

  const send = () => {
    if (busy) return
    onSend(text)
    setText('')
    field.current?.focus()
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/25 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 motion-reduce:animate-none" />
        <DialogPrimitive.Content
          onOpenAutoFocus={(e) => {
            e.preventDefault()
            field.current?.focus()
          }}
          className="input-sheet fixed inset-x-0 bottom-0 z-50 grid gap-3 rounded-t-2xl border-t bg-popover px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] text-popover-foreground shadow-[0_-8px_30px_rgb(0_0_0/0.18)] outline-none data-open:animate-in data-open:slide-in-from-bottom data-closed:animate-out data-closed:slide-out-to-bottom motion-reduce:animate-none sm:inset-x-auto sm:bottom-auto sm:top-[28%] sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:rounded-2xl sm:border sm:pt-4 sm:data-open:slide-in-from-bottom-4 sm:data-closed:slide-out-to-bottom-4"
        >
          <div aria-hidden className="mx-auto h-1 w-10 rounded-full bg-muted-foreground/30 sm:hidden" />
          <div className="space-y-1">
            <DialogPrimitive.Title className="text-base font-semibold">Your program is waiting for input</DialogPrimitive.Title>
            {shownPrompt ? (
              <DialogPrimitive.Description className="console-prompt">{shownPrompt}</DialogPrimitive.Description>
            ) : (
              <DialogPrimitive.Description className="sr-only">Type the next line of input.</DialogPrimitive.Description>
            )}
          </div>

          <div className="flex items-end gap-2">
            <textarea
              ref={field}
              value={text}
              rows={rows}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault()
                  send()
                } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
                  e.preventDefault()
                  if (!busy) onEndInput()
                }
              }}
              aria-label="Input line"
              aria-describedby={hintId}
              enterKeyHint="send"
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              className="input-field min-h-11 flex-1 resize-none rounded-xl border bg-background px-3 py-2.5 font-mono text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <Button variant="run" onClick={send} disabled={busy} aria-label="Send line" className="size-11 shrink-0 rounded-xl">
              <CornerDownLeft aria-hidden className="size-5" />
            </Button>
          </div>

          {examples.length > 0 && (
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
              {examples.map((ex) => (
                <Button
                  key={ex.label}
                  variant="outline"
                  className="h-10 shrink-0 rounded-full px-4"
                  onClick={() => {
                    setText(ex.text.replace(/\r\n?/g, '\n').replace(/\n$/, ''))
                    field.current?.focus()
                  }}
                >
                  Use {ex.label.toLowerCase()}
                </Button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onStop} className="h-10 px-3 text-muted-foreground">
              <Square aria-hidden className="size-3.5 fill-current" /> Stop
            </Button>
            <Button variant="outline" onClick={onEndInput} disabled={busy} className="ml-auto h-10 px-4" title="Ctrl+D">
              End input
            </Button>
          </div>
          <p id={hintId} className="-mt-1 text-xs text-muted-foreground">
            Enter sends a line. Paste several lines at once. End input means “no more lines” (EOF).
          </p>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
