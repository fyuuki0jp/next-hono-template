import { Hono } from 'hono'

import { greetingServiceFactory } from '../model/factory'

export const greetingApi = new Hono().get('/', async (c) => {
  const service = await greetingServiceFactory()
  const result = await service.getGreeting()

  if (!result.ok) {
    const { error } = result
    if (error.type === 'not_found') {
      return c.json({ error: error.message }, 404)
    }
    return c.json({ error: error.message }, 500)
  }

  return c.json({ greeting: result.value })
})

export type GreetingApiType = typeof greetingApi
