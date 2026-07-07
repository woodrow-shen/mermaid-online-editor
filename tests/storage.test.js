import { describe, it, expect, beforeEach } from 'vitest'
import { saveDraft, loadDraft, clearDraft, DRAFT_KEY } from '../src/lib/storage.js'
import { AGENT_WORKFLOW_DIAGRAM } from './fixtures.js'

describe('draft storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('saves and loads a draft', () => {
    saveDraft(AGENT_WORKFLOW_DIAGRAM)
    expect(loadDraft()).toBe(AGENT_WORKFLOW_DIAGRAM)
  })

  it('returns null when no draft exists', () => {
    expect(loadDraft()).toBeNull()
  })

  it('clears a saved draft', () => {
    saveDraft('graph TD\n A-->B')
    clearDraft()
    expect(loadDraft()).toBeNull()
  })

  it('does not store empty content as a draft', () => {
    saveDraft('')
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull()
  })
})
