import { describe, expect, it } from 'vitest'
import type { RunResult } from '@/types/runner'
import { describeRun } from './describeRun'

const result = (status: RunResult['status'], durationMs = 12): RunResult => ({ status, stdout: '', stderr: '', durationMs, truncated: false })

describe('describeRun', () => {
  it('describes each outcome', () => {
    expect(describeRun('finished', result('finished'), null)).toBe('Finished in 12 ms')
    expect(describeRun('error', result('error', 0), null)).toBe('Finished with an error (see below)')
    expect(describeRun('loading', result('timeout', 5000), null)).toBe('Time limit exceeded — stopped after 5.0 s · Restarting Python…')
    expect(describeRun('running', null, null)).toBe('Running…')
  })

  it('reports a load failure, not a Python error', () => {
    expect(describeRun('error', result('error', 0), 'Could not load Python from https://cdn…')).toBe('Python could not start')
  })
})
