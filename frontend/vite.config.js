import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: { allowedHosts: true, host: '0.0.0.0', port: 10000 }
})
