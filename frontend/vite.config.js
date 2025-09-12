import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// קובץ הגדרות של Vite
export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: [
      "sales-frontend-z2m7.onrender.com",  // ה־URL של ה-Render שלך
    ],
    host: '0.0.0.0',
    port: 10000
  },
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})
