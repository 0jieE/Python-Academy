/**
 * localStorage implementation of ProgressStore.
 *
 * Rules:
 *  - Key: PROGRESS_STORAGE_KEY ("pyacademy:progress"); value includes schemaVersion.
 *  - Every read/write in try/catch: storage can be full, disabled (private mode)
 *    or throw SecurityError. On failure fall back to in-memory (`available` = false)
 *    so the UI can show a banner.
 *  - Unknown/older schemaVersion → run migrations (migrations.ts) → save.
 *    Corrupt JSON → back it up under "pyacademy:progress:corrupt-<ts>" and reset.
 *  - Cross-tab sync is done by the caller via the `storage` event (useProgress).
 */
import { CURRENT_PROGRESS_SCHEMA, PROGRESS_STORAGE_KEY, type Progress, type ProgressStore } from '@/types/progress'
import { migrate } from './migrations'

export const emptyProgress = (): Progress => ({
  schemaVersion: CURRENT_PROGRESS_SCHEMA,
  completedLessonIds: [],
  attemptedProblemIds: [],
  solvedSampleProblemIds: [],
  updatedAt: new Date(0).toISOString(),
})

/** localStorage if it really works (some private modes expose it but throw on write). */
export function probeLocalStorage(): Storage | null {
  try {
    const storage = window.localStorage
    const probe = 'pyacademy:probe'
    storage.setItem(probe, '1')
    storage.removeItem(probe)
    return storage
  } catch {
    return null
  }
}

export class ImportError extends Error {}

export class LocalProgressStore implements ProgressStore {
  /** False when storage is blocked or failing: progress lives in memory only. */
  available: boolean
  /** Set when stored data was unreadable and was backed up + reset. */
  recoveredFromCorrupt = false
  private memory: Progress = emptyProgress()
  private readonly storage: Storage | null
  private readonly now: () => number

  constructor(storage: Storage | null = probeLocalStorage(), now: () => number = Date.now) {
    this.storage = storage
    this.available = storage !== null
    this.now = now
  }

  load(): Progress {
    if (!this.storage || !this.available) return this.memory
    let raw: string | null
    try {
      raw = this.storage.getItem(PROGRESS_STORAGE_KEY)
    } catch {
      this.available = false
      return this.memory
    }
    if (raw === null) return (this.memory = emptyProgress())

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      return this.recoverCorrupt(raw)
    }
    const progress = migrate(parsed)
    if (!progress) return this.recoverCorrupt(raw)
    this.memory = progress
    if ((parsed as { schemaVersion?: unknown }).schemaVersion !== CURRENT_PROGRESS_SCHEMA) this.save(progress)
    return progress
  }

  save(progress: Progress): void {
    this.memory = progress
    if (!this.storage || !this.available) return
    try {
      this.storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress))
    } catch {
      this.available = false // quota exceeded or storage revoked
    }
  }

  reset(): void {
    this.memory = emptyProgress()
    if (!this.storage || !this.available) return
    try {
      this.storage.removeItem(PROGRESS_STORAGE_KEY)
    } catch {
      this.available = false
    }
  }

  exportJson(): string {
    return JSON.stringify(this.load(), null, 2)
  }

  /** Replace progress with an exported file's contents. Throws ImportError if it isn't valid. */
  importJson(json: string): Progress {
    let parsed: unknown
    try {
      parsed = JSON.parse(json)
    } catch {
      throw new ImportError('That file is not valid JSON.')
    }
    const progress = migrate(parsed)
    if (!progress) throw new ImportError('That file is not a PyAcademy progress export (or comes from a newer version of the site).')
    this.save(progress)
    return progress
  }

  private recoverCorrupt(raw: string): Progress {
    this.recoveredFromCorrupt = true
    try {
      this.storage?.setItem(`${PROGRESS_STORAGE_KEY}:corrupt-${this.now()}`, raw)
      this.storage?.removeItem(PROGRESS_STORAGE_KEY)
    } catch {
      // Can't back up (quota) — still continue with fresh progress.
    }
    return (this.memory = emptyProgress())
  }
}
