import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { parseExcerpt, search, type SearchHit } from './pagefindClient'

/** Result of the last finished search, tagged with the query it answers. */
type Answer = { query: string; hits: SearchHit[] } | { query: string; error: string }

type State =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'results'; hits: SearchHit[] }
  | { kind: 'unavailable'; message: string }

export default function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState<Answer | null>(null)
  const [selected, setSelected] = useState('')
  const navigate = useNavigate()
  const q = query.trim()

  useEffect(() => {
    if (!q) return
    let cancelled = false
    const timer = setTimeout(() => {
      search(q)
        .then((hits) => !cancelled && setAnswer({ query: q, hits }))
        .catch(() => {
          if (cancelled) return
          setAnswer({
            query: q,
            error: import.meta.env.DEV
              ? 'Search works in the production build. Run `npm run build && npm run preview` to try it.'
              : 'Search could not load. Check your connection and try again.',
          })
        })
    }, 150)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [q])

  // While a new query is pending, keep showing the previous hits (no flicker).
  const state: State = !q
    ? { kind: 'idle' }
    : answer && 'error' in answer
      ? { kind: 'unavailable', message: answer.error }
      : answer
        ? { kind: 'results', hits: answer.hits }
        : { kind: 'loading' }

  // cmdk keeps the highlighted item across result changes; if it vanished,
  // highlight the first hit so Enter always goes somewhere.
  const hits = state.kind === 'results' ? state.hits : []
  const highlighted = hits.some((h) => h.url === selected) ? selected : (hits[0]?.url ?? '')

  const go = (url: string) => {
    onOpenChange(false)
    setQuery('')
    navigate(url)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="top-[10%] translate-y-0 overflow-hidden p-0 sm:top-1/4 sm:max-w-xl">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <DialogDescription className="sr-only">Search lessons, cheat sheets and problems</DialogDescription>
        {/* Pagefind already ranks results; cmdk must not filter them again. */}
        <Command shouldFilter={false} value={highlighted} onValueChange={setSelected} className="rounded-none!">
          <CommandInput value={query} onValueChange={setQuery} placeholder="Search lessons, cheat sheets, problems…" className="h-11 text-base sm:text-sm" />
          <CommandList className="max-h-[60dvh]">
            {state.kind === 'loading' && <p className="px-3 py-6 text-center text-sm text-muted-foreground">Searching…</p>}
            {state.kind === 'unavailable' && <p className="px-3 py-6 text-center text-sm text-muted-foreground">{state.message}</p>}
            {state.kind === 'idle' && <p className="px-3 py-6 text-center text-sm text-muted-foreground">Try “split”, “prefix sum” or “sys.stdin”.</p>}
            {state.kind === 'results' && answer?.query === q && <CommandEmpty>No results for “{q}”.</CommandEmpty>}
            {state.kind === 'results' &&
              state.hits.map((hit) => (
                <CommandItem key={hit.url} value={hit.url} onSelect={() => go(hit.url)} className="flex-col items-start gap-1 py-2.5">
                  <span className="flex w-full items-center gap-2">
                    <span className="font-medium">{hit.title}</span>
                    {hit.kind && (
                      <Badge variant="secondary" className="ml-auto">
                        {hit.kind}
                      </Badge>
                    )}
                  </span>
                  <span className="line-clamp-2 text-xs text-muted-foreground">
                    {parseExcerpt(hit.excerpt).map((part, i) =>
                      part.mark ? (
                        <mark key={i} className="rounded-sm bg-amber-200/70 px-0.5 text-foreground dark:bg-amber-500/30">
                          {part.text}
                        </mark>
                      ) : (
                        part.text
                      ),
                    )}
                  </span>
                </CommandItem>
              ))}
          </CommandList>
        </Command>
        <p aria-live="polite" className="sr-only">
          {state.kind === 'results' ? `${state.hits.length} results` : ''}
        </p>
      </DialogContent>
    </Dialog>
  )
}
