import { MDXProvider } from '@mdx-js/react'
import type { MDXComponents } from 'mdx/types'
import { Suspense, use } from 'react'
import { loadMdx } from '@/content/registry'
import { Callout } from './Callout'

/** Components available inside every MDX file without importing them. */
const mdxComponents: MDXComponents = {
  Callout,
  // T9 will add: <RunnableExample code="..." stdin="..." />  (opens the playground lazily)
}

// Cache promises so React's `use()` sees the same promise across re-renders.
const cache = new Map<string, ReturnType<typeof loadMdx>>()
function getModule(path: string) {
  let p = cache.get(path)
  if (!p) {
    p = loadMdx(path)
    cache.set(path, p)
  }
  return p
}

/** Renders an MDX file by its manifest path; shows a placeholder while its chunk loads. */
export function MdxContent({ sourcePath }: { sourcePath: string }) {
  return (
    <Suspense fallback={<p role="status" className="text-muted-foreground">Loading…</p>}>
      <MdxBody sourcePath={sourcePath} />
    </Suspense>
  )
}

function MdxBody({ sourcePath }: { sourcePath: string }) {
  const { default: Content } = use(getModule(sourcePath))
  return (
    <MDXProvider components={mdxComponents}>
      <div className="lesson-prose prose prose-neutral max-w-none dark:prose-invert">
        <Content />
      </div>
    </MDXProvider>
  )
}
