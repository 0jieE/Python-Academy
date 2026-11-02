/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional override for where Pyodide is loaded from (default: jsDelivr). */
  readonly VITE_PYODIDE_INDEX_URL?: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
