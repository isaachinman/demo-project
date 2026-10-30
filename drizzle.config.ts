import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  casing: 'snake_case',
  dialect: 'postgresql',
  out: './src/db/migrations',
  schema: './src/db/schema.ts',
})
