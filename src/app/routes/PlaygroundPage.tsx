import { Playground } from '@/features/playground/Playground'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

/** Full-screen IDE (route handle `layout: 'app'` drops the page padding and footer). */
export default function PlaygroundPage() {
  useDocumentTitle('IDE')
  return <Playground />
}
