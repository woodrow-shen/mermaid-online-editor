import { useCallback, useEffect, useRef, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { mermaid as mermaidLang } from 'codemirror-lang-mermaid'
import Toolbar from './components/Toolbar.jsx'
import TabBar from './components/TabBar.jsx'
import Preview from './components/Preview.jsx'
import { buildShareHash, parseShareHash } from './lib/shareCodec.js'
import {
  loadWorkspace,
  saveWorkspace,
  createFile,
  renameFile,
  deleteFile,
  updateCode,
  setGistId,
} from './lib/files.js'
import { saveGist, gistFilename, loadToken, saveToken } from './lib/gist.js'
import { downloadSvg, downloadPng } from './lib/exporter.js'
import { EXAMPLES, DEFAULT_EXAMPLE } from './examples.js'

// A shared link opens as a NEW tab so it never clobbers local work.
function initialWorkspace() {
  let ws = loadWorkspace()
  const shared = parseShareHash(window.location.hash)
  if (shared) ws = createFile(ws, null, shared)
  return ws
}

const RENDER_DEBOUNCE_MS = 300

const TOKEN_PROMPT = `Saving to a GitHub Gist needs a CLASSIC personal access token with the "gist" scope (fine-grained tokens do not support gists).

Create one at: https://github.com/settings/tokens/new?scopes=gist

The token is stored only in this browser's localStorage.

Paste token:`

export default function App() {
  const [ws, setWs] = useState(initialWorkspace)
  const [renderedCode, setRenderedCode] = useState(
    () => ws.files.find((f) => f.id === ws.activeId)?.code ?? '',
  )
  const [gistStatus, setGistStatus] = useState(null) // {state, url?, message?}
  const svgRef = useRef(null)

  const activeFile = ws.files.find((f) => f.id === ws.activeId) ?? ws.files[0]

  // Consume the share hash once it has been imported as a tab, so a reload
  // doesn't import a duplicate.
  useEffect(() => {
    if (window.location.hash.startsWith('#pako:')) {
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])

  // Debounce: rendering on every keystroke thrashes mermaid on big diagrams.
  useEffect(() => {
    const t = setTimeout(() => setRenderedCode(activeFile.code), RENDER_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [activeFile.code])

  // Persist the whole workspace on any change (files are small text).
  useEffect(() => {
    saveWorkspace(ws)
  }, [ws])

  const handleSvgReady = useCallback((svg) => {
    svgRef.current = svg
  }, [])

  async function handleShare() {
    const hash = buildShareHash(activeFile.code)
    const url = `${window.location.origin}${window.location.pathname}${hash}`
    try {
      await navigator.clipboard.writeText(url)
      return true
    } catch {
      // Clipboard blocked (e.g. non-HTTPS) — show the link via prompt instead.
      window.prompt('Copy this share link:', url)
      return false
    }
  }

  async function handleSaveGist() {
    let token = loadToken()
    if (!token) {
      token = window.prompt(TOKEN_PROMPT)?.trim()
      if (!token) return
      saveToken(token)
    }
    setGistStatus({ state: 'saving' })
    try {
      const { id, htmlUrl } = await saveGist({
        token,
        gistId: activeFile.gistId,
        filename: gistFilename(activeFile.name),
        content: activeFile.code,
        description: `Mermaid diagram: ${activeFile.name}`,
      })
      setWs((w) => setGistId(w, activeFile.id, id))
      setGistStatus({ state: 'ok', url: htmlUrl })
    } catch (err) {
      // An invalid token would fail every future save too — drop it so the
      // next attempt re-prompts.
      if (/bad credentials|requires authentication/i.test(String(err))) saveToken(null)
      setGistStatus({ state: 'error', message: String(err.message || err) })
    }
  }

  function handleLoadExample(name) {
    setWs((w) => createFile(w, null, EXAMPLES[name]))
  }

  function handleReset() {
    if (!window.confirm('Replace the current file content with the default example?')) return
    setWs((w) => updateCode(w, w.activeId, EXAMPLES[DEFAULT_EXAMPLE]))
  }

  return (
    <div className="app">
      <Toolbar
        onLoadExample={handleLoadExample}
        onShare={handleShare}
        onSaveGist={handleSaveGist}
        gistStatus={gistStatus}
        onExportSvg={() => svgRef.current && downloadSvg(svgRef.current, `${activeFile.name}.svg`)}
        onExportPng={() => svgRef.current && downloadPng(svgRef.current, `${activeFile.name}.png`)}
        onClear={handleReset}
      />
      <TabBar
        files={ws.files}
        activeId={ws.activeId}
        onSelect={(id) => setWs((w) => ({ ...w, activeId: id }))}
        onCreate={() => setWs((w) => createFile(w))}
        onRename={(id, name) => setWs((w) => renameFile(w, id, name))}
        onDelete={(id) => setWs((w) => deleteFile(w, id))}
      />
      <main className="panes">
        <section className="editor-pane">
          <CodeMirror
            value={activeFile.code}
            height="100%"
            extensions={[mermaidLang()]}
            onChange={(code) => setWs((w) => updateCode(w, w.activeId, code))}
          />
        </section>
        <Preview code={renderedCode} onSvgReady={handleSvgReady} />
      </main>
    </div>
  )
}
