import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: { '@demo-project': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    globals: true,
    include: ['src/**/*.test.ts'],
  },
})
