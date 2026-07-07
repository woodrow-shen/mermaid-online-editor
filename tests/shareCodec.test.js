import { describe, it, expect } from 'vitest'
import { encodeShare, decodeShare, buildShareHash, parseShareHash } from '../src/lib/shareCodec.js'
import { AGENT_WORKFLOW_DIAGRAM } from './fixtures.js'

describe('encodeShare / decodeShare', () => {
  it('round-trips a simple diagram', () => {
    const code = 'graph TD\n  A --> B'
    expect(decodeShare(encodeShare(code))).toBe(code)
  })

  it('round-trips a diagram with unicode emoji and CJK text', () => {
    expect(decodeShare(encodeShare(AGENT_WORKFLOW_DIAGRAM))).toBe(AGENT_WORKFLOW_DIAGRAM)
    const cjk = 'graph LR\n  甲[開始] --> 乙[結束]'
    expect(decodeShare(encodeShare(cjk))).toBe(cjk)
  })

  it('produces a URL-safe string (no +, /, =, #, ?)', () => {
    const encoded = encodeShare(AGENT_WORKFLOW_DIAGRAM)
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('compresses large diagrams smaller than plain base64', () => {
    const encoded = encodeShare(AGENT_WORKFLOW_DIAGRAM)
    const plainB64Len = Math.ceil(new TextEncoder().encode(AGENT_WORKFLOW_DIAGRAM).length * 4 / 3)
    expect(encoded.length).toBeLessThan(plainB64Len)
  })

  it('throws on corrupted payloads', () => {
    expect(() => decodeShare('not-valid-deflate!!!')).toThrow()
  })
})

describe('buildShareHash / parseShareHash', () => {
  it('builds a #pako: prefixed hash and parses it back', () => {
    const hash = buildShareHash(AGENT_WORKFLOW_DIAGRAM)
    expect(hash.startsWith('#pako:')).toBe(true)
    expect(parseShareHash(hash)).toBe(AGENT_WORKFLOW_DIAGRAM)
  })

  it('returns null for an empty or unrelated hash', () => {
    expect(parseShareHash('')).toBeNull()
    expect(parseShareHash('#/some/route')).toBeNull()
  })

  it('returns null (not throw) for a corrupted share hash', () => {
    expect(parseShareHash('#pako:garbage!!!')).toBeNull()
  })
})
