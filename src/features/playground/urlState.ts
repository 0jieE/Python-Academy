/**
 * Code + stdin carried in the playground URL hash:
 *   /playground#code=<urlencoded>&stdin=<urlencoded>
 * The hash never reaches the server and survives refresh. Lesson pages import
 * this tiny module only — never the runner.
 */
export interface PlaygroundState {
  code: string
  stdin: string
}

export function encodePlaygroundHash(state: Partial<PlaygroundState>): string {
  const params = new URLSearchParams()
  if (state.code) params.set('code', state.code)
  if (state.stdin) params.set('stdin', state.stdin)
  return params.toString()
}

export function decodePlaygroundHash(hash: string): Partial<PlaygroundState> {
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  const out: Partial<PlaygroundState> = {}
  const code = params.get('code')
  const stdin = params.get('stdin')
  if (code !== null) out.code = code
  if (stdin !== null) out.stdin = stdin
  return out
}

export function playgroundUrl(state: Partial<PlaygroundState>): string {
  const hash = encodePlaygroundHash(state)
  return hash ? `/playground#${hash}` : '/playground'
}
