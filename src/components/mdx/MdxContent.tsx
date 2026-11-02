import { MDXProvider } from '@mdx-js/react'
import type { MDXComponents } from 'mdx/types'
import { Suspense, use } from 'react'
import { loadMdx } from '@/content/registry'
import { Callout } from './Callout'
import { Complexity } from './Complexity'
import { Answer, Exercise } from './Exercise'
import { KeyIdea } from './KeyIdea'
import { MdxLink } from './MdxLink'
import { CodeBlock } from './RunnableCode'
import { RunnableExample } from './RunnableExample'

/** Components available inside every MDX file without importing them. */
const mdxComponents: MDXComponents = {
  a: MdxLink,
  pre: CodeBlock,
  Callout,
  KeyIdea,
  Exercise,
  Answer,
  Complexity,
  RunnableExample,
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
      <div className="lesson-prose prose prose-neutral max-w-none dark:prose-invert prose-code:before:content-none prose-code:after:content-none">
        <Content />
      </div>
    </MDXProvider>
  )
}
