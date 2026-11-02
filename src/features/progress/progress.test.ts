import { describe, expect, it } from 'vitest'
import { PROGRESS_STORAGE_KEY, type Progress } from '@/types/progress'
import { emptyProgress, ImportError, LocalProgressStore } from './localProgressStore'
import { migrate } from './migrations'
import { problemStatus, recordLessonVisit, recordSampleRun, setLessonComplete } from './progressOps'

/** In-memory Storage; `failWrites` simulates a full / blocked storage. */
class FakeStorage implements Storage {
  data = new Map<string, string>()
  failWrites = false
  failReads = false
  get length() {
    return this.data.size
  }
  clear() {
    this.data.clear()
  }
  getItem(k: string) {
    if (this.failReads) throw new DOMException('denied', 'SecurityError')
    return this.data.get(k) ?? null
  }
  key(i: number) {
    return [...this.data.keys()][i] ?? null
  }
  removeItem(k: string) {
    this.data.delete(k)
  }
  setItem(k: string, v: string) {
    if (this.failWrites) throw new DOMException('full', 'QuotaExceededError')
    this.data.set(k, v)
  }
}

const sample = (): Progress => ({ ...emptyProgress(), completedLessonIds: ['fund-input-output'], updatedAt: '2026-11-01T00:00:00.000Z' })

describe('LocalProgressStore', () => {
  it('starts empty and round-trips save → load', () => {
    const storage = new FakeStorage()
    const store = new LocalProgressStore(storage)
    expect(store.load()).toEqual(emptyProgress())
    store.save(sample())
    expect(new LocalProgressStore(storage).load()).toEqual(sample())
  })

  it('backs up corrupt JSON and resets without throwing', () => {
    const storage = new FakeStorage()
    storage.setItem(PROGRESS_STORAGE_KEY, '{not json')
    const store = new LocalProgressStore(storage, () => 123)
    expect(store.load()).toEqual(emptyProgress())
    expect(store.recoveredFromCorrupt).toBe(true)
    expect(storage.getItem(`${PROGRESS_STORAGE_KEY}:corrupt-123`)).toBe('{not json')
    expect(storage.getItem(PROGRESS_STORAGE_KEY)).toBeNull()
  })

  it('treats valid JSON with the wrong shape as corrupt', () => {
    const storage = new FakeStorage()
    storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({ schemaVersion: 1, completedLessonIds: 'oops' }))
    expect(new LocalProgressStore(storage).load()).toEqual(emptyProgress())
  })

  it('migrates old data on load and saves it back', () => {
    const storage = new FakeStorage()
    storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({ completedLessonIds: ['a', 7], solvedSampleProblemIds: ['p'] }))
    const loaded = new LocalProgressStore(storage).load()
    expect(loaded).toMatchObject({ schemaVersion: 1, completedLessonIds: ['a'], attemptedProblemIds: [], solvedSampleProblemIds: ['p'] })
    expect(JSON.parse(storage.getItem(PROGRESS_STORAGE_KEY)!).schemaVersion).toBe(1)
  })

  it('falls back to memory when storage is missing or fails', () => {
    const none = new LocalProgressStore(null)
    expect(none.available).toBe(false)
    none.save(sample())
    expect(none.load()).toEqual(sample())

    const storage = new FakeStorage()
    const store = new LocalProgressStore(storage)
    storage.failWrites = true
    store.save(sample())
    expect(store.available).toBe(false)
    expect(store.load()).toEqual(sample())

    const blocked = new FakeStorage()
    blocked.failReads = true
    const s2 = new LocalProgressStore(blocked)
    expect(s2.load()).toEqual(emptyProgress())
    expect(s2.available).toBe(false)
  })

  it('exports and imports progress; rejects bad files', () => {
    const a = new LocalProgressStore(new FakeStorage())
    a.save(sample())
    const json = a.exportJson()
    const b = new LocalProgressStore(new FakeStorage())
    expect(b.importJson(json)).toEqual(sample())
    expect(b.load()).toEqual(sample())
    expect(() => b.importJson('nope')).toThrow(ImportError)
    expect(() => b.importJson('{"schemaVersion": 99}')).toThrow(ImportError)
    expect(b.load()).toEqual(sample()) // a failed import changes nothing
  })

  it('reset clears progress', () => {
    const storage = new FakeStorage()
    const store = new LocalProgressStore(storage)
    store.save(sample())
    store.reset()
    expect(store.load()).toEqual(emptyProgress())
  })
})

describe('migrate', () => {
  it('rejects non-objects and future versions', () => {
    expect(migrate(null)).toBeNull()
    expect(migrate([1])).toBeNull()
    expect(migrate({ ...sample(), schemaVersion: 2 })).toBeNull()
  })

  it('accepts current data unchanged', () => {
    expect(migrate(sample())).toEqual(sample())
  })
})

describe('progressOps', () => {
  const now = new Date('2026-11-02T10:00:00.000Z')

  it('marks and unmarks lessons without duplicates', () => {
    let p = setLessonComplete(emptyProgress(), 'x', true, now)
    p = setLessonComplete(p, 'x', true, now)
    expect(p.completedLessonIds).toEqual(['x'])
    expect(p.updatedAt).toBe(now.toISOString())
    expect(setLessonComplete(p, 'x', false, now).completedLessonIds).toEqual([])
  })

  it('records the last visited lesson', () => {
    expect(recordLessonVisit(emptyProgress(), { id: 'x', url: '/learn/a/x' }, now).lastVisitedLesson).toEqual({ id: 'x', url: '/learn/a/x', at: now.toISOString() })
  })

  it('keeps a problem solved after a later failing run', () => {
    let p = recordSampleRun(emptyProgress(), 'p', false, now)
    expect(problemStatus(p, 'p')).toBe('attempted')
    p = recordSampleRun(p, 'p', true, now)
    expect(problemStatus(p, 'p')).toBe('solved')
    p = recordSampleRun(p, 'p', false, now)
    expect(problemStatus(p, 'p')).toBe('solved')
    expect(problemStatus(p, 'other')).toBe('new')
  })
})
