import { useCallback, useEffect, useRef, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { mermaid as mermaidLang } from 'codemirror-lang-mermaid'
import Toolbar from './components/Toolbar.jsx'
import Preview from './components/Preview.jsx'
import { buildShareHash, parseShareHash } from './lib/shareCodec.js'
import { saveDraft, loadDraft, clearDraft } from './lib/storage.js'
import { downloadSvg, downloadPng } from './lib/exporter.js'
import { EXAMPLES, DEFAULT_EXAMPLE } from './examples.js'

// Priority on load: shared link > saved draft > default example.
function initialCode() {
  return (
    parseShareHash(window.location.hash) ??
    loadDraft() ??
    EXAMPLES[DEFAULT_EXAMPLE]
  )
}

const RENDER_DEBOUNCE_MS = 300

export default function App() {
  const [code, setCode] = useState(initialCode)
  const [renderedCode, setRenderedCode] = useState(code)
  const svgRef = useRef(null)

  // Debounce: rendering on every keystroke thrashes mermaid on big diagrams.
  useEffect(() => {
    const t = setTimeout(() => setRenderedCode(code), RENDER_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [code])

  // Autosave draft (also debounced by piggybacking on renderedCode).
  useEffect(() => {
    saveDraft(renderedCode)
  }, [renderedCode])

  const handleSvgReady = useCallback((svg) => {
    svgRef.current = svg
  }, [])

  async function handleShare() {
    const hash = buildShareHash(code)
    const url = `${window.location.origin}${window.location.pathname}${hash}`
    window.history.replaceState(null, '', hash)
    try {
      await navigator.clipboard.writeText(url)
      return true
    } catch {
      // Clipboard blocked (e.g. non-HTTPS); URL bar still holds the link.
      return false
    }
  }

  function handleLoadExample(name) {
    setCode(EXAMPLES[name])
    window.history.replaceState(null, '', window.location.pathname)
  }

  function handleClear() {
    clearDraft()
    window.history.replaceState(null, '', window.location.pathname)
    setCode(EXAMPLES[DEFAULT_EXAMPLE])
  }

  return (
    <div className="app">
      <Toolbar
        onLoadExample={handleLoadExample}
        onShare={handleShare}
        onExportSvg={() => svgRef.current && downloadSvg(svgRef.current)}
        onExportPng={() => svgRef.current && downloadPng(svgRef.current)}
        onClear={handleClear}
      />
      <main className="panes">
        <section className="editor-pane">
          <CodeMirror
            value={code}
            height="100%"
            extensions={[mermaidLang()]}
            onChange={setCode}
          />
        </section>
        <Preview code={renderedCode} onSvgReady={handleSvgReady} />
      </main>
    </div>
  )
}
