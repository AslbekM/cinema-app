import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/app/',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5095',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: '../wwwroot/app',
    emptyOutDir: true
  }
})
