export const DRAFT_KEY = 'mermaid-editor.draft'

export function saveDraft(code) {
  if (!code) return
  try {
    localStorage.setItem(DRAFT_KEY, code)
  } catch {
    // Quota exceeded or storage disabled — drafts are best-effort.
  }
}

export function loadDraft() {
  try {
    return localStorage.getItem(DRAFT_KEY)
  } catch {
    return null
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {
    // ignore
  }
}
