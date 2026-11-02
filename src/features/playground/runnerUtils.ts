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

export type StreamName = 'stdout' | 'stderr'

/**
 * Caps total output (stdout + stderr) at `maxChars` and batches small writes
 * so a print() in a tight loop doesn't send thousands of messages.
 */
export class OutputLimiter {
  used = 0
  truncated = false
  private pending: Record<StreamName, string> = { stdout: '', stderr: '' }
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
    if (this.truncated || !text) return
    const room = this.maxChars - this.used
    if (text.length >= room) {
      text = text.slice(0, room)
      this.truncated = true
    }
    this.used += text.length
    this.pending[stream] += text
    if (this.truncated || this.pending.stdout.length + this.pending.stderr.length >= this.flushChars || this.now() - this.lastFlush >= this.flushMs) {
      this.flush()
    }
  }

  flush(): void {
    for (const stream of ['stdout', 'stderr'] as const) {
      if (this.pending[stream]) {
        this.send(stream, this.pending[stream])
        this.pending[stream] = ''
      }
    }
    this.lastFlush = this.now()
  }
}
