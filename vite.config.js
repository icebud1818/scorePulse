import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// When deploying to GitHub Pages under https://<user>.github.io/scorePulse/
// the base must match the repo name. Override via VITE_BASE if you fork/rename.
const base = process.env.VITE_BASE ?? '/scorePulse/'

export default defineConfig({
  plugins: [react()],
  base,
})
