import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Check if certificate files exist, otherwise Vite will generate them
// Only use HTTPS in development
let httpsConfig = false
if (process.env.NODE_ENV !== 'production') {
  httpsConfig = true
  try {
    const keyPath = path.resolve(__dirname, 'key.pem')
    const certPath = path.resolve(__dirname, 'cert.pem')
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      httpsConfig = {
        key: fs.readFileSync(keyPath, 'utf8'),
        cert: fs.readFileSync(certPath, 'utf8')
      }
      console.log('✅ Using existing SSL certificates')
    } else {
      console.log('⚠️  No certificates found, Vite will generate them automatically')
    }
  } catch (error) {
    console.log('⚠️  Error loading certificates, using Vite auto-generated certificates:', error.message)
  }
}

export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: 'public',
  server: {
    https: httpsConfig,
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html')
    }
  },
  appType: 'spa'
})

