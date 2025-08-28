import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./FE/src"),
    },
  },
  root: "./FE",
  publicDir: "./public",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  server: {
    port: 8080,
    host: "0.0.0.0",
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    },
    cors: true
  },
  preview: {
    port: 8080,
    host: "0.0.0.0",
    cors: true
  }
}));