import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": "/src" },
  },
  server: {
    host: "0.0.0.0",
    port: 8003,
    proxy: {
      "/camera": {
        target: "http://172.16.35.120",
        changeOrigin: true,
        secure: false,
      },
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
      "/prod-api": {
        target: "http://172.16.1.106:5057",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/prod-api/, "/api"),
      },
    },
  },
});
