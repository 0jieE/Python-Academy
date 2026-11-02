import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'

/**
 * After client-side navigation, move focus to the new page's <h1> so screen
 * reader and keyboard users start at the top of the new content. Skips the
 * first load (the browser already starts at the top). Waits for the heading
 * if the page renders it a little later.
 */
export function useFocusHeadingOnNavigate(containerId = 'main') {
  const { pathname } = useLocation()
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const container = document.getElementById(containerId)
    if (!container) return

    const focusHeading = () => {
      const h1 = container.querySelector('h1')
      if (!h1) return false
      if (!h1.hasAttribute('tabindex')) h1.setAttribute('tabindex', '-1')
      h1.focus({ preventScroll: true })
      return true
    }
    if (focusHeading()) return

    const observer = new MutationObserver(() => {
      if (focusHeading()) observer.disconnect()
    })
    observer.observe(container, { childList: true, subtree: true })
    const timer = setTimeout(() => observer.disconnect(), 5000)
    return () => {
      observer.disconnect()
      clearTimeout(timer)
    }
  }, [pathname, containerId])
}
