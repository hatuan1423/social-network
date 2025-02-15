import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [{ find: "~", replacement: resolve(__dirname, "./src") }]
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      "/api/v1": {
        target: "http://localhost:8888",
        changeOrigin: true,
        secure: false,
      },
    },
  },
})


