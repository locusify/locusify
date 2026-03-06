import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  server: {
    port: 1046,
    host: true,
    proxy: {
      '/api/functions': {
        target: 'https://dnpxwowhdgwlzhjoxtkx.supabase.co/functions/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/functions/, ''),
        secure: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          map: ['maplibre-gl', 'react-map-gl/maplibre'],
          motion: ['motion'],
          vendor: ['react', 'react-dom', 'react-router'],
        },
      },
    },
  },
})
