import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: [
      "sales-frontend-z2m7.onrender.com"   
    ],
    host: '0.0.0.0',
    port: 10000
  },
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  build: {
    chunkSizeWarningLimit: 4000, 
    outDir: 'dist'
  }
})
