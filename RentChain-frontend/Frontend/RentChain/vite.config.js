import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    hmr: {
      host: '0.0.0.0',
      port: 5173,
    },
    cors: true,
  },
  define: {
    'process.env': {},
    'global': 'window',
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          web3: ['ethers'],
          ui: ['react-icons', 'react-i18next', 'i18next'],
          payments: ['@stripe/stripe-js', '@stripe/react-stripe-js']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: ['ethers', 'react', 'react-dom', 'react-router-dom', 'buffer']
  },
  resolve: {
    alias: {
      'buffer': 'buffer',
      'process': 'process/browser',
    }
  }
})
