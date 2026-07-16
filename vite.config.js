import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// When deploying to GitHub Pages under https://<user>.github.io/birdie-quest/
// the base must match the repo name. Override via VITE_BASE if you fork/rename.
const base = process.env.VITE_BASE ?? '/birdie-quest/'

export default defineConfig({
  plugins: [react()],
  base,
})
