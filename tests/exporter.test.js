import { describe, it, expect } from 'vitest'
import { getExportSize, EXPORT_PADDING } from '../src/lib/exporter.js'

function makeSvg(attrs) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  for (const [k, v] of Object.entries(attrs)) svg.setAttribute(k, v)
  return svg
}

describe('getExportSize', () => {
  it('uses intrinsic viewBox dimensions, not on-screen size', () => {
    // mermaid emits width="100%" + a max-width style; the viewBox holds the
    // real diagram size. Export must use the latter so PNG scale does not
    // depend on how the preview pane happened to be sized.
    const svg = makeSvg({ viewBox: '0 0 800 600', width: '100%' })
    const { width, height } = getExportSize(svg)
    expect(width).toBe(800 + EXPORT_PADDING * 2)
    expect(height).toBe(600 + EXPORT_PADDING * 2)
  })

  it('adds safety padding so font-metric drift cannot clip edge text', () => {
    expect(EXPORT_PADDING).toBeGreaterThan(0)
  })

  it('handles a viewBox with a non-zero origin', () => {
    const svg = makeSvg({ viewBox: '-8 -8 416 316' })
    const { width, height } = getExportSize(svg)
    expect(width).toBe(416 + EXPORT_PADDING * 2)
    expect(height).toBe(316 + EXPORT_PADDING * 2)
  })

  it('falls back to width/height attributes when viewBox is absent', () => {
    const svg = makeSvg({ width: '300', height: '150' })
    const { width, height } = getExportSize(svg)
    expect(width).toBe(300 + EXPORT_PADDING * 2)
    expect(height).toBe(150 + EXPORT_PADDING * 2)
  })
})
