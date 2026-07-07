import { deflate, inflate } from 'pako'

const HASH_PREFIX = '#pako:'

// URL-safe base64 (RFC 4648 §5, padding stripped) so the payload can live
// in a location hash without percent-encoding.
function toBase64Url(bytes) {
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(str) {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export function encodeShare(code) {
  const utf8 = new TextEncoder().encode(code)
  return toBase64Url(deflate(utf8, { level: 9 }))
}

export function decodeShare(encoded) {
  const bytes = fromBase64Url(encoded)
  return new TextDecoder().decode(inflate(bytes))
}

export function buildShareHash(code) {
  return HASH_PREFIX + encodeShare(code)
}

// Returns the decoded diagram, or null if the hash is absent, unrelated
// (e.g. a route) or corrupted. Never throws: a bad share link should fall
// back to the default document, not crash the app.
export function parseShareHash(hash) {
  if (!hash || !hash.startsWith(HASH_PREFIX)) return null
  try {
    return decodeShare(hash.slice(HASH_PREFIX.length))
  } catch {
    return null
  }
}
