/**
 * Pyodide is loaded from jsDelivr, NOT bundled into dist/:
 *  - keeps ~13 MB of runtime off Render's free-tier bandwidth allowance
 *  - students' browsers cache it across visits
 * Version is pinned to the exact `pyodide` npm version in package.json.
 * Override with VITE_PYODIDE_INDEX_URL (e.g. to self-host under /pyodide/).
 */
export const PYODIDE_VERSION = '314.0.7'

export const PYODIDE_INDEX_URL: string =
  import.meta.env.VITE_PYODIDE_INDEX_URL ?? `https://cdn.jsdelivr.net/npm/pyodide@${PYODIDE_VERSION}/`

export const RUN_DEFAULTS = {
  timeLimitMs: 5_000, // playground; problems may set their own
  maxOutputChars: 200_000,
} as const
