import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwind from "@tailwindcss/vite"
import { resolve } from "path"

const pages = ["index", "zones", "parties", "rentals", "branches", "contact"]

export default defineConfig({
  base: "./",
  plugins: [react(), tailwind()],
  resolve: { alias: { "@": resolve(__dirname, "src"), "@seed": resolve(__dirname, "../php/data/seed.json") } },
  build: {
    outDir: "../build-web",
    emptyOutDir: true,
    assetsDir: "assets",
    chunkSizeWarningLimit: 900,
    rollupOptions: { input: Object.fromEntries(pages.map((p) => [p, resolve(__dirname, p + ".html")])) },
  },
  server: { proxy: { "/api": "http://127.0.0.1:8099" } },
})
