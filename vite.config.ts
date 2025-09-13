import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Generate version in MMDDYYYY.HHMM format
const generateVersion = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${month}${day}${year}.${hours}${minutes}`;
};

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  define: {
    'import.meta.env.VITE_VERSION': JSON.stringify(generateVersion()),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./FE/src"),
    },
  },
  root: "./FE",
  publicDir: "public",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
}));