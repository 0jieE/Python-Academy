import { useMatches } from 'react-router'

/** Per-route layout hints, set as `handle` in router.tsx. */
export interface RouteHandle {
  /** 'app': full-height page without padding or footer (the IDE). */
  layout?: 'app'
  /** Phone top bar shows a back button to this parent page. */
  back?: { to: string; label: string }
}

/** The deepest route's handle. */
export function useRouteHandle(): RouteHandle {
  const matches = useMatches()
  for (let i = matches.length - 1; i >= 0; i--) {
    const handle = matches[i].handle as RouteHandle | undefined
    if (handle) return handle
  }
  return {}
}
