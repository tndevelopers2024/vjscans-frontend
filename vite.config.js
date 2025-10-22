import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  // =======================
  // ✅ Server Configuration
  // =======================
  server: {
    port: 5173, // Keep consistent with your frontend
    strictPort: true, // Prevent random port changes (avoids CORS mismatch)
    host: true, // Allow access from LAN or mobile devices if needed

    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://vjscanslabs.vercel.app",
        "https://vjscans.vercel.app",
      ],
      credentials: true,
    },

    // ✅ Ensure stable Hot Reloading (HMR)
    hmr: {
      protocol: "ws", // WebSocket
      host: "localhost",
      clientPort: 5173,
    },

    // ✅ Optional if you see reloads on file save in some environments
    watch: {
      usePolling: true,
    },

    // ✅ Optional proxy for local backend API
    proxy: {
      "/api": {
        target: "http://localhost:5006", // your backend dev URL
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // =======================
  // ✅ Build Configuration
  // =======================
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 1000,
  },
});
