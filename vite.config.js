import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Last updated: 2026-01-15 - Triggering Vercel redeploy
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    strictPort: false,
  },
  preview: {
    port: 5175,
    strictPort: false,
  },
})
