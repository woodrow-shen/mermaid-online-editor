// Browser-side export helpers. No backend: SVG is serialized from the live
// preview node; PNG is rasterized through an offscreen <canvas>.

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
    const { width, height } = svgEl.getBoundingClientRect()
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
