/** Previous / next item around `id` in an already-ordered list. */
export function neighbours<T extends { id: string }>(list: readonly T[], id: string): { prev?: T; next?: T } {
  const i = list.findIndex((item) => item.id === id)
  if (i === -1) return {}
  return { prev: list[i - 1], next: list[i + 1] }
}
