import { useParams } from 'react-router'
import { MdxContent } from '@/components/mdx/MdxContent'
import { findProblem } from '@/content/registry'
import NotFoundPage from './NotFoundPage'

export default function ProblemPage() {
  const problem = findProblem(useParams().slug)
  if (!problem) return <NotFoundPage />

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <article className="space-y-6">
        <header>
          <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-400">{problem.difficulty}</p>
          <h1 className="text-2xl font-bold">{problem.title}</h1>
        </header>
        <MdxContent sourcePath={problem.statementPath} />
        <section>
          <h2 className="font-semibold">Input</h2>
          <p className="text-sm">{problem.inputSpec}</p>
          <h2 className="mt-4 font-semibold">Output</h2>
          <p className="text-sm">{problem.outputSpec}</p>
          <h2 className="mt-4 font-semibold">Constraints</h2>
          <ul className="list-disc pl-5 text-sm">{problem.constraints.map((c) => <li key={c}>{c}</li>)}</ul>
        </section>
        <section className="space-y-3">
          {problem.sampleTests.map((t, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold">{t.name ?? `Sample ${i + 1}`} · input</p>
                <pre className="overflow-x-auto rounded bg-muted p-2 text-sm">{t.input}</pre>
              </div>
              <div>
                <p className="text-xs font-semibold">expected output</p>
                <pre className="overflow-x-auto rounded bg-muted p-2 text-sm">{t.expectedOutput}</pre>
              </div>
            </div>
          ))}
        </section>
        {/* TODO(T10): hints (reveal one at a time) + editorial behind a "Show editorial" button */}
      </article>
      <section aria-label="Code editor" className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
        {/* TODO(T10): <PracticeWorkbench problem={problem} /> — Monaco + Run samples + compare */}
        Editor and “Run samples” arrive in ticket T10.
      </section>
    </div>
  )
}
