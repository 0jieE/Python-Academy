/**
 * The console transcript: output, errors and the input the student typed, in
 * the order the program produced / consumed them. Pure helpers (unit-tested).
 */

export type ConsoleKind = 'out' | 'err' | 'in'

export interface ConsoleChunk {
  kind: ConsoleKind
  text: string
}

export type ConsoleLog = readonly ConsoleChunk[]

/** Append text, merging with the previous chunk of the same kind. */
export function appendChunk(log: ConsoleLog, kind: ConsoleKind, text: string): ConsoleLog {
  if (!text) return log
  const last = log.at(-1)
  if (last?.kind === kind) return [...log.slice(0, -1), { kind, text: last.text + text }]
  return [...log, { kind, text }]
}

/** How many complete input lines the program has read so far. */
export function inputLinesRead(log: ConsoleLog): number {
  let n = 0
  for (const c of log) if (c.kind === 'in') for (const ch of c.text) if (ch === '\n') n++
  return n
}

/**
 * The prompt the program is waiting on: the output after the last newline
 * (e.g. "Enter N: "), or the last output line if it ended with a newline.
 */
export function currentPrompt(log: ConsoleLog): string {
  const last = log.at(-1)
  if (!last || last.kind !== 'out') return ''
  const text = last.text.replace(/\n$/, '')
  return text.slice(text.lastIndexOf('\n') + 1).trimEnd()
}

/**
 * What the student typed in the input sheet → stdin lines. Pasted multi-line
 * text becomes several lines; an empty submission is one empty line.
 */
export function toInputLines(typed: string): string[] {
  const text = typed.replace(/\r\n?/g, '\n').replace(/\n$/, '')
  return text.split('\n').map((line) => line + '\n')
}

/**
 * During a replay the program re-prints everything up to the new input. Keep
 * showing the previous transcript (plus the echo of what was just typed) until
 * the replay has read the new input, so the console doesn't flash. With no new
 * input (the student ended the input), the caller shows `live` once the run is done.
 */
export function replayView(previous: ConsoleLog, pendingInput: string, live: ConsoleLog, linesBefore: number): ConsoleLog {
  if (pendingInput && inputLinesRead(live) > linesBefore) return live
  return appendChunk(previous, 'in', pendingInput)
}
