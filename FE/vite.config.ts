import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 8080,
    host: "0.0.0.0",
    cors: true,
    https: process.env.SSL_ENABLED === 'true' && 
           fs.existsSync('./ssl/cert.pem') && 
           fs.existsSync('./ssl/key.pem') ? {
      cert: fs.readFileSync('./ssl/cert.pem'),
      key: fs.readFileSync('./ssl/key.pem')
    } : false
  },
  preview: {
    port: 8080,
    host: "0.0.0.0",
    cors: true,
    https: process.env.SSL_ENABLED === 'true' && 
           fs.existsSync('./ssl/cert.pem') && 
           fs.existsSync('./ssl/key.pem') ? {
      cert: fs.readFileSync('./ssl/cert.pem'),
      key: fs.readFileSync('./ssl/key.pem')
    } : false
  }
}));