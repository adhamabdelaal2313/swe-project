import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
  // Ensure public assets are properly handled
  publicDir: 'public',
  build: {
    // Ensure static assets are copied correctly
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // Preserve asset file names
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
