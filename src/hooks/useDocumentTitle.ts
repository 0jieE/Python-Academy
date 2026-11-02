import { useEffect } from 'react'

export const SITE_TITLE = 'PyAcademy · Python contest training'

/** Sets `<title>` to "<title> · PyAcademy" (or the site title when omitted). */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · PyAcademy` : SITE_TITLE
  }, [title])
}
