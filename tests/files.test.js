import { describe, it, expect, beforeEach } from 'vitest'
import {
  FILES_KEY,
  loadWorkspace,
  saveWorkspace,
  createFile,
  renameFile,
  deleteFile,
  updateCode,
  setGistId,
} from '../src/lib/files.js'
import { DRAFT_KEY } from '../src/lib/storage.js'
import { AGENT_WORKFLOW_DIAGRAM } from './fixtures.js'

describe('loadWorkspace', () => {
  beforeEach(() => localStorage.clear())

  it('creates a default workspace with one file when storage is empty', () => {
    const ws = loadWorkspace()
    expect(ws.files).toHaveLength(1)
    expect(ws.activeId).toBe(ws.files[0].id)
    expect(ws.files[0].name).toBeTruthy()
    expect(ws.files[0].code).toBeTruthy()
  })

  it('migrates a legacy single draft into the first file and clears the old key', () => {
    localStorage.setItem(DRAFT_KEY, AGENT_WORKFLOW_DIAGRAM)
    const ws = loadWorkspace()
    expect(ws.files).toHaveLength(1)
    expect(ws.files[0].code).toBe(AGENT_WORKFLOW_DIAGRAM)
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull()
  })

  it('round-trips through saveWorkspace', () => {
    const ws = loadWorkspace()
    const ws2 = createFile(ws, 'second', 'graph LR\n X-->Y')
    saveWorkspace(ws2)
    const loaded = loadWorkspace()
    expect(loaded.files).toHaveLength(2)
    expect(loaded.activeId).toBe(ws2.activeId)
    expect(loaded.files[1].name).toBe('second')
  })

  it('recovers with a default workspace when stored JSON is corrupted', () => {
    localStorage.setItem(FILES_KEY, '{not json')
    const ws = loadWorkspace()
    expect(ws.files).toHaveLength(1)
  })
})

describe('workspace operations (pure)', () => {
  let ws
  beforeEach(() => {
    localStorage.clear()
    ws = loadWorkspace()
  })

  it('createFile adds a file and activates it', () => {
    const ws2 = createFile(ws, 'flow-2', 'graph TD\n A-->B')
    expect(ws2.files).toHaveLength(2)
    const created = ws2.files.find((f) => f.name === 'flow-2')
    expect(ws2.activeId).toBe(created.id)
    expect(ws).not.toBe(ws2) // immutable update
  })

  it('createFile generates unique untitled names when no name given', () => {
    const ws2 = createFile(createFile(ws))
    const names = ws2.files.map((f) => f.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('renameFile changes only the target file', () => {
    const ws2 = createFile(ws, 'b')
    const ws3 = renameFile(ws2, ws2.files[0].id, 'renamed')
    expect(ws3.files[0].name).toBe('renamed')
    expect(ws3.files[1].name).toBe('b')
  })

  it('updateCode updates code and bumps updatedAt', () => {
    const id = ws.activeId
    const before = ws.files[0].updatedAt
    const ws2 = updateCode(ws, id, 'graph LR\n Q-->R')
    expect(ws2.files[0].code).toBe('graph LR\n Q-->R')
    expect(ws2.files[0].updatedAt).toBeGreaterThanOrEqual(before)
  })

  it('deleteFile removes the file and activates a neighbor', () => {
    const ws2 = createFile(ws, 'b')
    const ws3 = deleteFile(ws2, ws2.activeId)
    expect(ws3.files).toHaveLength(1)
    expect(ws3.activeId).toBe(ws3.files[0].id)
  })

  it('deleteFile never leaves zero files', () => {
    const ws2 = deleteFile(ws, ws.activeId)
    expect(ws2.files).toHaveLength(1)
  })

  it('setGistId attaches a gist id to a file', () => {
    const ws2 = setGistId(ws, ws.activeId, 'abc123')
    expect(ws2.files[0].gistId).toBe('abc123')
  })
})
