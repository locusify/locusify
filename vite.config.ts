import process from 'node:process'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return {
    plugins: [react(), tailwindcss(), tsconfigPaths()],
    server: {
      port: 1046,
      host: true,
      proxy: {
        '/api/functions': {
          target: `${env.VITE_SUPABASE_URL}/functions/v1`,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api\/functions/, ''),
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
  }
})
