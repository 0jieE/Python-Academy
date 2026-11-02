import { Playground } from '@/features/playground/Playground'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function PlaygroundPage() {
  useDocumentTitle('Playground')
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Playground</h1>
        <p className="text-muted-foreground">
          Write Python, give it input, and run it in your browser. Python 3 runs on your device — nothing is sent to a server.
        </p>
      </header>
      <Playground />
    </div>
  )
}
