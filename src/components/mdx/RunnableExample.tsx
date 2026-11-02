import type { ReactNode } from 'react'
import { RunnableCode } from './RunnableCode'

/**
 * A titled example with sample input. Run feeds `stdin` to the program right
 * on the page; "Type my own input" runs it again asking for input. Nothing
 * here loads Pyodide until Run is pressed.
 *
 *   <RunnableExample stdin="3 4">
 *
 *   ```python
 *   a, b = map(int, input().split())
 *   print(a + b)
 *   ```
 *
 *   </RunnableExample>
 */
export function RunnableExample({ stdin = '', title = 'Example', children }: { stdin?: string; title?: string; children: ReactNode }) {
  return (
    <RunnableCode title={title} stdin={stdin || undefined}>
      {children}
    </RunnableCode>
  )
}
