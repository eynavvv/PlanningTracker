import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
// Last updated: 2026-01-15 - Triggering Vercel redeploy
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5175,
    strictPort: false,
  },
  preview: {
    port: 5175,
    strictPort: false,
  },
})
