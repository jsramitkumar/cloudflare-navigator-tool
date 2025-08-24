import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: './FE',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./FE/src"),
    },
  },
  server: {
    port: 8080,
    host: true
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
})