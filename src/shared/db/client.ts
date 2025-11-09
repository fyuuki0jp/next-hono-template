import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'

import { PGlite } from '@electric-sql/pglite'
import { drizzle as drizzlePgLite } from 'drizzle-orm/pglite'
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema'

const nodeEnv = process.env.NODE_ENV ?? 'development'
const preference = process.env.DRIZZLE_USE_PGLITE?.toLowerCase()
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL)
const preferPglite = preference === 'true' || preference === '1'
const preferPostgres = preference === 'false' || preference === '0'
const defaultUsePglite = !preferPostgres && !hasDatabaseUrl && nodeEnv !== 'production'
const usePglite = preferPglite || defaultUsePglite

if (!usePglite && !process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required when DRIZZLE_USE_PGLITE is disabled or NODE_ENV=production.')
}

const pglitePath = process.env.PGLITE_DATA_PATH ?? join(process.cwd(), '.local', 'pglite.dev.db')

if (usePglite) {
  mkdirSync(dirname(pglitePath), { recursive: true })
}

const pgliteClient = usePglite ? new PGlite(pglitePath) : null
const postgresClient = usePglite
  ? null
  : postgres(process.env.DATABASE_URL!, {
      max: Number(process.env.PG_MAX_CONNECTIONS ?? 10),
      ssl: process.env.PG_SSL === 'true' || process.env.PG_SSL === '1'
    })

const db = (usePglite
  ? drizzlePgLite(pgliteClient!, { schema })
  : drizzlePostgres(postgresClient!, { schema }))

export type DbClient = typeof db

export async function getDb(): Promise<DbClient> {
  return db
}

export async function closeDb() {
  if (postgresClient) {
    await postgresClient.end({})
  }
  if (pgliteClient) {
    await pgliteClient.close()
  }
}

export { schema }
