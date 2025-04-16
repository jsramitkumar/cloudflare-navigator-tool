
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Define environment variables that should be exposed to the client
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.API_URL || 'https://api.cloudflare.com/client/v4'),
    'import.meta.env.VITE_BACKEND_URL': JSON.stringify(process.env.BACKEND_URL || 'http://localhost:3001'),
    'import.meta.env.VITE_FRONTEND_URL': JSON.stringify(process.env.FRONTEND_URL || 'http://localhost:8080'),
    'import.meta.env.VITE_FRONTEND_PORT': JSON.stringify(process.env.FRONTEND_PORT || '8080'),
    'import.meta.env.VITE_BACKEND_PORT': JSON.stringify(process.env.BACKEND_PORT || '3001'),
  }
}));
