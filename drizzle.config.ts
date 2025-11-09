import { config as loadEnv } from 'dotenv'
import { defineConfig } from 'drizzle-kit'
import { join } from 'node:path'

loadEnv()

const nodeEnv = process.env.NODE_ENV ?? 'development'
const usePgliteFlag = process.env.DRIZZLE_USE_PGLITE?.toLowerCase()
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL)
const preferPglite = usePgliteFlag === 'true' || usePgliteFlag === '1'
const preferPostgres = usePgliteFlag === 'false' || usePgliteFlag === '0'
const defaultUsePglite = !preferPostgres && !hasDatabaseUrl && nodeEnv !== 'production'
const usePglite = preferPglite || defaultUsePglite

if (!usePglite && !process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is required when DRIZZLE_USE_PGLITE is disabled or NODE_ENV=production.'
  )
}

const schemaPath = './src/shared/db/schema.ts'
const outDir = './drizzle'

const config = usePglite
  ? defineConfig({
      schema: schemaPath,
      out: outDir,
      dialect: 'postgresql',
      driver: 'pglite',
      dbCredentials: {
        url: process.env.PGLITE_DATA_PATH ?? join(process.cwd(), '.devDatabase')
      },
      strict: true,
      verbose: true
    })
  : defineConfig({
      schema: schemaPath,
      out: outDir,
      dialect: 'postgresql',
      dbCredentials: {
        url: process.env.DATABASE_URL!
      },
      strict: true,
      verbose: true
    })

export default config
