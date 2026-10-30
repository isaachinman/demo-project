import { fileURLToPath } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  build: { outDir: 'dist/web' },
  plugins: [
    tanstackRouter({
      autoCodeSplitting: true,
      generatedRouteTree: './src/web/routeTree.gen.ts',
      routesDirectory: './src/web/routes',
      target: 'react',
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@demo-project': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // API_ORIGIN points the dev server at a different API (e.g. a test container).
    proxy: { '/health': process.env.API_ORIGIN ?? 'http://localhost:3000' },
  },
})
