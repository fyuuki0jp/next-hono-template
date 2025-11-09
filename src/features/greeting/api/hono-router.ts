import { Hono } from 'hono'

import { greetingServiceFactory } from '../model/factory'

export const greetingApi = new Hono().get('/', async (c) => {
  const service = await greetingServiceFactory()
  const greeting = await service.getGreeting()

  return c.json({ greeting })
})

export type GreetingApiType = typeof greetingApi
