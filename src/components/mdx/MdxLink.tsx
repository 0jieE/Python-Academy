import type { ComponentProps } from 'react'
import { Link } from 'react-router'

/** Markdown links: site paths ("/learn/…") navigate in-app; everything else is a normal link. */
export function MdxLink({ href = '', children, ...props }: ComponentProps<'a'>) {
  if (href.startsWith('/') && !href.startsWith('//')) {
    return <Link to={href} {...props}>{children}</Link>
  }
  return <a href={href} {...props}>{children}</a>
}
