// Browser-side export helpers. No backend: SVG is serialized from the live
// preview node; PNG is rasterized through an offscreen <canvas>.

// Extra margin (in SVG units, each side) around the exported image. Offscreen
// rasterization may fall back to slightly wider fonts than the page used when
// mermaid measured the labels; padding keeps edge glyphs inside the canvas.
export const EXPORT_PADDING = 8

// Intrinsic diagram size from the viewBox (mermaid sets width="100%" and a
// max-width style, so on-screen getBoundingClientRect depends on pane layout
// and would rescale the export). Falls back to width/height attributes.
export function getExportSize(svgEl) {
  const viewBox = svgEl.getAttribute('viewBox')
  let width, height
  if (viewBox) {
    const parts = viewBox.trim().split(/[\s,]+/).map(Number)
    width = parts[2]
    height = parts[3]
  } else {
    width = parseFloat(svgEl.getAttribute('width'))
    height = parseFloat(svgEl.getAttribute('height'))
  }
  return {
    width: width + EXPORT_PADDING * 2,
    height: height + EXPORT_PADDING * 2,
  }
}

function triggerDownload(url, filename) {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

export function svgToString(svgEl) {
  const clone = svgEl.cloneNode(true)
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  // Pin the export to intrinsic coordinates: expand the viewBox by the safety
  // padding and replace mermaid's width="100%" / max-width sizing, so the
  // rasterized image matches the diagram regardless of preview-pane layout.
  const viewBox = clone.getAttribute('viewBox')
  if (viewBox) {
    const [x, y, w, h] = viewBox.trim().split(/[\s,]+/).map(Number)
    clone.setAttribute(
      'viewBox',
      `${x - EXPORT_PADDING} ${y - EXPORT_PADDING} ${w + EXPORT_PADDING * 2} ${h + EXPORT_PADDING * 2}`,
    )
  }
  const { width, height } = getExportSize(svgEl)
  clone.setAttribute('width', width)
  clone.setAttribute('height', height)
  clone.style.maxWidth = ''
  return new XMLSerializer().serializeToString(clone)
}

export function downloadSvg(svgEl, filename = 'diagram.svg') {
  const blob = new Blob([svgToString(svgEl)], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  triggerDownload(url, filename)
  URL.revokeObjectURL(url)
}

export function downloadPng(svgEl, filename = 'diagram.png', scale = 2) {
  return new Promise((resolve, reject) => {
    const { width, height } = getExportSize(svgEl)
    const svgData = svgToString(svgEl)
    // data: URI (not blob:) keeps the canvas untainted for toBlob().
    const src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(width * scale))
      canvas.height = Math.max(1, Math.round(height * scale))
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('PNG export failed'))
        const url = URL.createObjectURL(blob)
        triggerDownload(url, filename)
        URL.revokeObjectURL(url)
        resolve()
      }, 'image/png')
    }
    img.onerror = () => reject(new Error('Could not rasterize SVG'))
    img.src = src
  })
}
