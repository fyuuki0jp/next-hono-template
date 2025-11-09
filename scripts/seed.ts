import { config as loadEnv } from 'dotenv'

loadEnv()

import { closeDb, getDb, schema } from '../src/shared/db/client'

async function seed() {
  const db = await getDb()
  const anyDb = db as any

  const existing = await anyDb.select({ id: schema.greetings.id }).from(schema.greetings).limit(1)

  if (existing.length === 0) {
    await anyDb.insert(schema.greetings).values({ message: 'Hello from Drizzle + PGlite!' })
  }
}

seed()
  .catch(err => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(async () => {
    await closeDb()
  })
