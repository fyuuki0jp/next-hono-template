import { depend } from 'velona'

import { greetingRepositoryFactory } from './repository-factory'
import { createGreetingService } from './service'

export const greetingServiceFactory = depend(
  { repository: greetingRepositoryFactory },
  async ({ repository }) => {
    const repo = await repository()
    return createGreetingService(repo)
  }
)

export type GreetingServiceFactory = typeof greetingServiceFactory
