import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
  server: {
    allowedHosts: true
  },
  // Env vars: VITE_ prefix for client-side exposure
  // Support both VITE_SUPABASE_URL and SUPABASE_URL patterns
  define: {},
})
