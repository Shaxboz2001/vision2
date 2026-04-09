import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": "/src" },
  },
  server: {
    host: "0.0.0.0",
    port: 8003,
    https: {
      key: fs.readFileSync(
        path.resolve(__dirname, "cert/STAR_uzbeksteel_uz.key"),
      ),
      cert: fs.readFileSync(
        path.resolve(__dirname, "cert/STAR_uzbeksteel_uz.CRT"),
      ),
    },
    hmr: {
      host: "ai.uzbeksteel.uz",
      protocol: "wss",
      port: 8003,
      clientPort: 8003,
    },
    proxy: {
      "/camera": {
        target: "http://172.16.35.120",
        changeOrigin: true,
        secure: false,
      },
      "/camera-ws": {
        target: "ws://172.16.55.12:1984",
        ws: true,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/camera-ws/, "/api/ws"),
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
      "/voice-api": {
        target: "https://ai.uzbeksteel.uz:8006",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/voice-api/, ""),
      },
    },
  },
});
