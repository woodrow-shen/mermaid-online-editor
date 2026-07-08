// GitHub Gist client. Each save of the same file is a new revision of the
// same gist, giving git-backed version history with zero backend.
// NOTE: the Gist API requires a CLASSIC personal access token with the
// `gist` scope — fine-grained tokens do not support gists.

const API = 'https://api.github.com/gists'

export function gistFilename(name) {
  return (
    name
      .replace(/[^A-Za-z0-9._-]+/g, '-')
      .replace(/^-+|-+$/g, '') + '.mmd'
  )
}

export async function saveGist(
  { token, gistId, filename, content, description },
  fetchImpl = fetch,
) {
  if (!token) throw new Error('A GitHub token with the gist scope is required')
  const url = gistId ? `${API}/${gistId}` : API
  const res = await fetchImpl(url, {
    method: gistId ? 'PATCH' : 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description: description || 'Mermaid diagram',
      ...(gistId ? {} : { public: false }),
      files: { [filename]: { content } },
    }),
  })
  if (!res.ok) {
    let message = `HTTP ${res.status}`
    try {
      const body = await res.json()
      if (body.message) message = body.message
    } catch {
      // non-JSON error body — keep the HTTP status message
    }
    throw new Error(`Gist save failed: ${message}`)
  }
  const body = await res.json()
  return { id: body.id, htmlUrl: body.html_url }
}

const TOKEN_KEY = 'mermaid-editor.gist-token'

export function loadToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function saveToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // storage unavailable — token just won't persist
  }
}
