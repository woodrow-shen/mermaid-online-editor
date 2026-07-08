import { DRAFT_KEY } from './storage.js'
import { EXAMPLES, DEFAULT_EXAMPLE } from '../examples.js'

export const FILES_KEY = 'mermaid-editor.files.v1'

function makeId() {
  return `f-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function makeFile(name, code) {
  return { id: makeId(), name, code, updatedAt: Date.now() }
}

function untitledName(files) {
  const taken = new Set(files.map((f) => f.name))
  let n = files.length + 1
  while (taken.has(`untitled-${n}`)) n++
  return `untitled-${n}`
}

function defaultWorkspace() {
  // Migrate the pre-tabs single draft, if one exists.
  let legacy = null
  try {
    legacy = localStorage.getItem(DRAFT_KEY)
    if (legacy) localStorage.removeItem(DRAFT_KEY)
  } catch {
    // storage unavailable — fall through to the default example
  }
  const file = makeFile('untitled-1', legacy || EXAMPLES[DEFAULT_EXAMPLE])
  return { files: [file], activeId: file.id }
}

export function loadWorkspace() {
  try {
    const raw = localStorage.getItem(FILES_KEY)
    if (raw) {
      const ws = JSON.parse(raw)
      if (Array.isArray(ws.files) && ws.files.length > 0) return ws
    }
  } catch {
    // corrupted JSON or storage unavailable — start fresh
  }
  // Persist immediately so the draft migration (which consumes the legacy
  // key) is idempotent — React StrictMode double-invokes initializers.
  const ws = defaultWorkspace()
  saveWorkspace(ws)
  return ws
}

export function saveWorkspace(ws) {
  try {
    localStorage.setItem(FILES_KEY, JSON.stringify(ws))
  } catch {
    // Quota exceeded or storage disabled — persistence is best-effort.
  }
}

export function createFile(ws, name, code = '') {
  const file = makeFile(name || untitledName(ws.files), code)
  return { files: [...ws.files, file], activeId: file.id }
}

function patchFile(ws, id, patch) {
  return {
    ...ws,
    files: ws.files.map((f) => (f.id === id ? { ...f, ...patch } : f)),
  }
}

export function renameFile(ws, id, name) {
  return patchFile(ws, id, { name, updatedAt: Date.now() })
}

export function updateCode(ws, id, code) {
  return patchFile(ws, id, { code, updatedAt: Date.now() })
}

export function setGistId(ws, id, gistId) {
  return patchFile(ws, id, { gistId })
}

export function deleteFile(ws, id) {
  if (ws.files.length <= 1) return ws // never leave zero files
  const idx = ws.files.findIndex((f) => f.id === id)
  const files = ws.files.filter((f) => f.id !== id)
  const activeId =
    ws.activeId === id ? files[Math.max(0, idx - 1)].id : ws.activeId
  return { files, activeId }
}
