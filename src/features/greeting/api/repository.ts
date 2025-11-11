import { desc } from 'drizzle-orm'

import type { DbClient } from '../../../shared/db/client'
import { greetings } from '../../../shared/db/schema'
import { fromRow, type GreetingModel } from '@/entities/greeting/model/greeting'
import { ok, err, type Result } from '@/shared/lib/result'

export type GreetingRepositoryError =
  | { type: 'not_found'; message: string }
  | { type: 'database_error'; message: string; cause?: unknown }

export interface GreetingRepository {
  getLatest(): Promise<Result<GreetingModel, GreetingRepositoryError>>
}

export const createGreetingRepository = (db: DbClient): GreetingRepository => ({
  async getLatest() {
    try {
      const [row] = await db.select().from(greetings).orderBy(desc(greetings.id)).limit(1)

      if (!row) {
        return err({ type: 'not_found', message: 'Greeting not found' })
      }

      return ok(fromRow(row))
    } catch (error) {
      return err({
        type: 'database_error',
        message: 'Failed to fetch greeting from database',
        cause: error
      })
    }
  }
})
