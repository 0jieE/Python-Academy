import { PyodideRunner } from './PyodideRunner'

// One runner for the whole app: Python stays loaded when moving between the
// IDE, lessons and problem pages. Consoles use it through useRunSession.
let shared: PyodideRunner | null = null
export function getRunner(): PyodideRunner {
  shared ??= new PyodideRunner()
  return shared
}
