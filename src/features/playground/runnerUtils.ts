/**
 * Pure helpers used by the Python worker. Kept free of Pyodide and DOM APIs
 * so they can be unit-tested.
 */

/** Normalize CRLF/CR (pasted from Windows or authored samples) to LF. */
export function normalizeStdin(text: string): string {
  return text.replace(/\r\n?/g, '\n')
}

/**
 * Byte reader for Pyodide's `setStdin({ read })`. Serves the whole stdin
 * exactly once; afterwards returns 0 (= EOF), so `input()` past the end raises
 * EOFError just like a judge, and `sys.stdin.read()` gets everything.
 */
export function createStdinReader(text: string): (buffer: Uint8Array) => number {
  const bytes = new TextEncoder().encode(normalizeStdin(text))
  let pos = 0
  return (buffer) => {
    const n = Math.min(buffer.length, bytes.length - pos)
    buffer.set(bytes.subarray(pos, pos + n))
    pos += n
    return n
  }
}

export interface LineReaderEvents {
  /** A piece of stdin was handed to Python (one line, or part of a very long one). */
  onLine: (text: string) => void
  /** Python wants more input than was typed and `eof` is false. */
  onExhausted: () => void
}

/**
 * Console-mode reader: serves at most ONE line per read() call, so Python's
 * buffered stdin consumes input line by line and each `onLine` lands between
 * the output written before and after that input() — the console can echo the
 * typed text in the right place. At the end: EOF (0) if `eof`, otherwise
 * `onExhausted()` and 0.
 */
export function createLineReader(text: string, eof: boolean, events: LineReaderEvents): (buffer: Uint8Array) => number {
  const bytes = new TextEncoder().encode(normalizeStdin(text))
  const decoder = new TextDecoder()
  let pos = 0
  return (buffer) => {
    if (pos >= bytes.length) {
      if (!eof) events.onExhausted()
      return 0
    }
    const newline = bytes.indexOf(10, pos)
    const lineEnd = newline === -1 ? bytes.length : newline + 1
    const n = Math.min(buffer.length, lineEnd - pos)
    const piece = bytes.subarray(pos, pos + n)
    buffer.set(piece)
    pos += n
    events.onLine(decoder.decode(piece, { stream: true }))
    return n
  }
}

export type StreamName = 'stdout' | 'stderr'

/**
 * Caps total output (stdout + stderr) at `maxChars` and batches small writes
 * so a print() in a tight loop doesn't send thousands of messages. Chunks are
 * sent in the order they were written (a traceback stays after the output
 * that came before it).
 */
export class OutputLimiter {
  used = 0
  truncated = false
  private pending: [StreamName, string][] = []
  private pendingChars = 0
  private closed = false
  private lastFlush: number
  private readonly maxChars: number
  private readonly send: (stream: StreamName, chunk: string) => void
  private readonly now: () => number
  private readonly flushChars: number
  private readonly flushMs: number

  constructor(
    maxChars: number,
    send: (stream: StreamName, chunk: string) => void,
    now: () => number = () => Date.now(),
    flushChars = 8192,
    flushMs = 50,
  ) {
    this.maxChars = maxChars
    this.send = send
    this.now = now
    this.flushChars = flushChars
    this.flushMs = flushMs
    this.lastFlush = now()
  }

  write(stream: StreamName, text: string): void {
    if (this.truncated || this.closed || !text) return
    const room = this.maxChars - this.used
    if (text.length >= room) {
      text = text.slice(0, room)
      this.truncated = true
    }
    this.used += text.length
    const last = this.pending.at(-1)
    if (last?.[0] === stream) last[1] += text
    else this.pending.push([stream, text])
    this.pendingChars += text.length
    if (this.truncated || this.pendingChars >= this.flushChars || this.now() - this.lastFlush >= this.flushMs) {
      this.flush()
    }
  }

  flush(): void {
    for (const [stream, chunk] of this.pending) if (chunk) this.send(stream, chunk)
    this.pending = []
    this.pendingChars = 0
    this.lastFlush = this.now()
  }

  /** Send what is pending, then drop everything written afterwards. */
  close(): void {
    this.flush()
    this.closed = true
  }
}
