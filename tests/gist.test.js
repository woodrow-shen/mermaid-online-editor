import { describe, it, expect, vi } from 'vitest'
import { saveGist, gistFilename } from '../src/lib/gist.js'

function fakeFetch(status, body) {
  return vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }))
}

describe('gistFilename', () => {
  it('appends .mmd and sanitizes characters gist rejects', () => {
    expect(gistFilename('my flow')).toBe('my-flow.mmd')
    expect(gistFilename('auth/seq#1')).toBe('auth-seq-1.mmd')
  })
})

describe('saveGist', () => {
  const okBody = { id: 'gist123', html_url: 'https://gist.github.com/u/gist123' }

  it('POSTs a new secret gist when no gistId is given', async () => {
    const f = fakeFetch(201, okBody)
    const res = await saveGist(
      { token: 'tok', filename: 'flow.mmd', content: 'graph TD\n A-->B', description: 'd' },
      f,
    )
    expect(res).toEqual({ id: 'gist123', htmlUrl: okBody.html_url })
    const [url, opts] = f.mock.calls[0]
    expect(url).toBe('https://api.github.com/gists')
    expect(opts.method).toBe('POST')
    expect(opts.headers.Authorization).toBe('Bearer tok')
    const payload = JSON.parse(opts.body)
    expect(payload.public).toBe(false)
    expect(payload.files['flow.mmd'].content).toContain('graph TD')
  })

  it('PATCHes the existing gist when gistId is given (new revision)', async () => {
    const f = fakeFetch(200, okBody)
    await saveGist(
      { token: 'tok', gistId: 'gist123', filename: 'flow.mmd', content: 'x' },
      f,
    )
    const [url, opts] = f.mock.calls[0]
    expect(url).toBe('https://api.github.com/gists/gist123')
    expect(opts.method).toBe('PATCH')
  })

  it('throws a readable error on auth failure', async () => {
    const f = fakeFetch(401, { message: 'Bad credentials' })
    await expect(
      saveGist({ token: 'bad', filename: 'a.mmd', content: 'x' }, f),
    ).rejects.toThrow(/Bad credentials/)
  })

  it('throws when token is missing', async () => {
    await expect(saveGist({ filename: 'a.mmd', content: 'x' }, fakeFetch(201, okBody)))
      .rejects.toThrow(/token/i)
  })
})
