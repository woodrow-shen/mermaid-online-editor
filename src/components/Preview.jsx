import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'strict',
  theme: 'default',
})

let renderSeq = 0

export default function Preview({ code, onSvgReady }) {
  const containerRef = useRef(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const id = `mermaid-render-${++renderSeq}`
    async function render() {
      if (!code.trim()) {
        if (containerRef.current) containerRef.current.innerHTML = ''
        setError(null)
        return
      }
      try {
        const { svg } = await mermaid.render(id, code)
        if (cancelled || !containerRef.current) return
        containerRef.current.innerHTML = svg
        setError(null)
        onSvgReady?.(containerRef.current.querySelector('svg'))
      } catch (err) {
        if (cancelled) return
        // Keep the last good diagram on screen; only surface the message.
        setError(String(err.message || err))
        // mermaid.render can leave a dangling error node behind on failure.
        document.getElementById(id)?.remove()
      }
    }
    render()
    return () => {
      cancelled = true
    }
  }, [code, onSvgReady])

  return (
    <div className="preview-pane">
      {error && <pre className="preview-error">{error}</pre>}
      <div className="preview-canvas" ref={containerRef} />
    </div>
  )
}
