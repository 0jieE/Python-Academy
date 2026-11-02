import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function PlaygroundPage() {
  useDocumentTitle('Playground')
  // TODO(T9): lazy-load <Playground /> (Monaco + stdin box + Run/Stop + output panes).
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Playground</h1>
      <p className="text-muted-foreground">
        Write Python, give it input, and run it in your browser. Coming in ticket T9.
      </p>
    </div>
  )
}
