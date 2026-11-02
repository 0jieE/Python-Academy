import { describe, expect, it } from 'vitest'
import { appendChunk, currentPrompt, inputLinesRead, replayView, toInputLines, type ConsoleLog } from './consoleLog'

describe('console transcript', () => {
  it('merges consecutive chunks of the same kind and keeps the order', () => {
    let log: ConsoleLog = []
    log = appendChunk(log, 'out', 'Name? ')
    log = appendChunk(log, 'in', 'Ana\n')
    log = appendChunk(log, 'out', 'Hi ')
    log = appendChunk(log, 'out', 'Ana\n')
    log = appendChunk(log, 'err', '')
    expect(log).toEqual([
      { kind: 'out', text: 'Name? ' },
      { kind: 'in', text: 'Ana\n' },
      { kind: 'out', text: 'Hi Ana\n' },
    ])
  })

  it('counts input lines read', () => {
    expect(inputLinesRead([{ kind: 'in', text: '1\n2\n' }, { kind: 'out', text: '\n\n' }, { kind: 'in', text: 'x\n' }])).toBe(3)
  })

  it('finds the prompt the program is waiting on', () => {
    expect(currentPrompt([{ kind: 'out', text: 'Welcome!\nEnter N: ' }])).toBe('Enter N:')
    expect(currentPrompt([{ kind: 'out', text: 'How many?\n' }])).toBe('How many?')
    expect(currentPrompt([{ kind: 'out', text: 'x' }, { kind: 'in', text: '1\n' }])).toBe('')
    expect(currentPrompt([])).toBe('')
  })

  it('turns typed or pasted text into input lines', () => {
    expect(toInputLines('3 4')).toEqual(['3 4\n'])
    expect(toInputLines('2\r\n1 2\r\n')).toEqual(['2\n', '1 2\n'])
    expect(toInputLines('')).toEqual(['\n'])
    expect(toInputLines('a\n\nb')).toEqual(['a\n', '\n', 'b\n'])
  })

  it('keeps the previous transcript until the replay catches up', () => {
    const previous: ConsoleLog = [{ kind: 'out', text: 'A? ' }]
    const echoed = replayView(previous, '5\n', [{ kind: 'out', text: 'A? ' }], 0)
    expect(echoed).toEqual([
      { kind: 'out', text: 'A? ' },
      { kind: 'in', text: '5\n' },
    ])
    const caughtUp: ConsoleLog = [
      { kind: 'out', text: 'A? ' },
      { kind: 'in', text: '5\n' },
      { kind: 'out', text: '25\n' },
    ]
    expect(replayView(previous, '5\n', caughtUp, 0)).toBe(caughtUp)
  })
})
