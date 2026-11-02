import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from 'react'
import { PROGRESS_STORAGE_KEY, type Progress } from '@/types/progress'
import { LocalProgressStore } from './localProgressStore'
import { recordLessonVisit } from './progressOps'

/**
 * App-wide progress state on top of a ProgressStore. Components read it with
 * useProgress(); updates go through `update()` so every page re-renders and
 * other tabs follow via the `storage` event.
 */
export class ProgressController {
  readonly store: LocalProgressStore
  private progress: Progress
  private listeners = new Set<() => void>()

  constructor(store: LocalProgressStore) {
    this.store = store
    this.progress = store.load()
  }

  get = () => this.progress

  subscribe = (listener: () => void) => {
    if (this.listeners.size === 0) window.addEventListener('storage', this.onStorage)
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
      if (this.listeners.size === 0) window.removeEventListener('storage', this.onStorage)
    }
  }

  update = (fn: (p: Progress) => Progress) => {
    const next = fn(this.progress)
    this.store.save(next)
    this.set(next)
  }

  /** Replace everything (import / reset). */
  reload = () => this.set(this.store.load())

  private set(next: Progress) {
    this.progress = next
    this.listeners.forEach((l) => l())
  }

  // Another tab changed progress (or cleared storage: key === null).
  private onStorage = (e: StorageEvent) => {
    if (e.key === PROGRESS_STORAGE_KEY || e.key === null) this.reload()
  }
}

let defaultController: ProgressController | null = null
function getDefaultController() {
  defaultController ??= new ProgressController(new LocalProgressStore())
  return defaultController
}

/** Override for tests or a future RemoteProgressStore; defaults to localStorage. */
export const ProgressContext = createContext<ProgressController | null>(null)

export function useProgress() {
  const controller = useContext(ProgressContext) ?? getDefaultController()
  const progress = useSyncExternalStore(controller.subscribe, controller.get)
  const update = useCallback((fn: (p: Progress) => Progress) => controller.update(fn), [controller])
  return { progress, update, controller, storageAvailable: controller.store.available, recoveredFromCorrupt: controller.store.recoveredFromCorrupt }
}

/** Remembers the lesson for the home page "Continue" card. */
export function useRecordLessonVisit(lesson: { id: string; url: string } | undefined) {
  const { update } = useProgress()
  const id = lesson?.id
  const url = lesson?.url
  useEffect(() => {
    if (id && url) update((p) => recordLessonVisit(p, { id, url }))
  }, [id, url, update])
}
