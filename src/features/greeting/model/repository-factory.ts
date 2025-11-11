import { depend } from 'velona'

import { dbFactory } from '../../../shared/di/container'
import { createGreetingRepository } from '../api/repository'

export const greetingRepositoryFactory = depend({ db: dbFactory }, async ({ db }) => {
  const client = await db()
  return createGreetingRepository(client)
})

export type GreetingRepositoryFactory = typeof greetingRepositoryFactory
