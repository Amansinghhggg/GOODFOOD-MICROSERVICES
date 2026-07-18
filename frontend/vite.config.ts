import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), basicSsl()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
    },
    proxy: {
      '/auth-api': { target: 'http://localhost:3000', changeOrigin: true, rewrite: (path) => path.replace(/^\/auth-api/, '') },
      '/restaurant-api': { target: 'http://localhost:3001', changeOrigin: true, rewrite: (path) => path.replace(/^\/restaurant-api/, '') },
      '/utils-api': { target: 'http://localhost:3002', changeOrigin: true, rewrite: (path) => path.replace(/^\/utils-api/, '') },
      '/realtime-api': { target: 'http://localhost:3003', changeOrigin: true, ws: true, rewrite: (path) => path.replace(/^\/realtime-api/, '') },
      '/rider-api': { target: 'http://localhost:3004', changeOrigin: true, rewrite: (path) => path.replace(/^\/rider-api/, '') },
      '/admin-api': { target: 'http://localhost:3006', changeOrigin: true, rewrite: (path) => path.replace(/^\/admin-api/, '') },
    }
  }
})
