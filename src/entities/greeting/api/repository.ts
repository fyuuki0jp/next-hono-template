import { desc } from 'drizzle-orm'

import type { DbClient } from '../../../shared/db/client'
import { greetings } from '../../../shared/db/schema'
import { fromRow, type GreetingModel } from '@/entities/greeting/model/greeting'

export interface GreetingRepository {
  getLatest(): Promise<GreetingModel>
}

export const createGreetingRepository = (db: DbClient): GreetingRepository => ({
  async getLatest() {
    const [row] = await db.select().from(greetings).orderBy(desc(greetings.id)).limit(1)

    if (!row) {
      throw new Error('Greeting not found')
    }

    return fromRow(row)
  }
})
