# Mermaid Online Editor

A zero-backend Mermaid diagram editor that runs entirely in the browser and
deploys as a static site to GitHub Pages.

## Features

- Live preview with 300ms debounce (CodeMirror 6 editor, Mermaid syntax highlighting)
- Multi-file workspace: tabbed files persisted in `localStorage`, surviving reloads
  (double-click a tab to rename, `+` to add, `×` to delete)
- Save to GitHub Gist: each save of the same file becomes a new revision of the
  same secret gist — git-backed version history with zero backend. Requires a
  classic personal access token with the `gist` scope (fine-grained tokens do
  not support the Gist API); the token stays in your browser's localStorage.
- Share diagrams via compressed URL hash (`#pako:` — deflate + base64url, no
  server needed); opening a share link imports it as a new tab
- Export as SVG or PNG (client-side rasterization)
- Built-in examples: flowchart, sequence, class, state, gantt, pie

## Development

```bash
npm install
npm run dev      # local dev server
npm test         # run vitest suite
npm run build    # production build to dist/
```

## Deployment (GitHub Pages)

Pushing to `main` triggers `.github/workflows/deploy.yml`, which tests,
builds, and publishes `dist/` via `actions/deploy-pages`.

One-time setup: in the repository settings, set
**Settings → Pages → Source** to **GitHub Actions**.

`vite.config.js` uses `base: './'` so the build works at any Pages path
(`https://<user>.github.io/<repo>/`) without configuration.

## Architecture

```
Editor (CodeMirror) --debounce--> mermaid.render() --SVG--> Preview
        |                                                     |
        +--> URL hash share / localStorage draft / SVG-PNG export
```

No backend: sharing encodes the whole diagram into the URL fragment, which
never leaves the browser.
