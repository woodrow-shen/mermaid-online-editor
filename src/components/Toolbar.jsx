import { useState } from 'react'
import { EXAMPLES } from '../examples.js'

export default function Toolbar({
  onLoadExample,
  onShare,
  onSaveGist,
  gistStatus,
  onExportSvg,
  onExportPng,
  onClear,
}) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const ok = await onShare()
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <header className="toolbar">
      <h1 className="toolbar-title">Mermaid Editor</h1>
      <select
        className="toolbar-select"
        defaultValue=""
        onChange={(e) => {
          if (e.target.value) onLoadExample(e.target.value)
          e.target.value = ''
        }}
      >
        <option value="" disabled>
          Load example…
        </option>
        {Object.keys(EXAMPLES).map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
      {gistStatus?.state === 'ok' && (
        <a className="gist-link" href={gistStatus.url} target="_blank" rel="noreferrer">
          View gist ↗
        </a>
      )}
      {gistStatus?.state === 'error' && (
        <span className="gist-error" title={gistStatus.message}>
          Gist save failed: {gistStatus.message}
        </span>
      )}
      <div className="toolbar-actions">
        <button onClick={onSaveGist} disabled={gistStatus?.state === 'saving'}>
          {gistStatus?.state === 'saving' ? 'Saving…' : 'Save to Gist'}
        </button>
        <button onClick={handleShare}>{copied ? 'Link copied!' : 'Share link'}</button>
        <button onClick={onExportSvg}>Export SVG</button>
        <button onClick={onExportPng}>Export PNG</button>
        <button className="toolbar-danger" onClick={onClear}>
          Reset
        </button>
      </div>
    </header>
  )
}
