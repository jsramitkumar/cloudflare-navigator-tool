import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Generate version timestamp
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const buildTime = `${month}${day}${year}.${hours}${minutes}`;

  // Update version.json with current build time
  const versionPath = path.resolve(__dirname, 'public/version.json');
  try {
    const versionData = {
      version: "1.0.0",
      buildTime: buildTime,
      commitHash: "",
      branch: "main"
    };
    fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2));
  } catch (error) {
    console.warn('Could not update version.json:', error.message);
  }

  return {
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
});