import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' makes built asset URLs relative, so the site works when served
// from a GitHub Pages project path (https://<user>.github.io/<repo>/).
export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
})
