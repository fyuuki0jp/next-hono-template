import { depend } from 'velona'

import type { GreetingApiType } from './hono-router'
import { createApiClientSimple } from '@/shared/api/client'

export type GreetingApiConfig = {
  baseUrl: string
}

type GreetingApiClient = ReturnType<typeof createApiClientSimple<GreetingApiType>>

type GreetingApiDependencies = {
  createClient: (config: GreetingApiConfig) => GreetingApiClient
}

const createFetchers = (client: GreetingApiClient) => ({
  hello: client.index.$get
})

export type GreetingApiFetchers = ReturnType<typeof createFetchers>
export type GreetingApiKey = keyof GreetingApiFetchers
export type GreetingApiFn = GreetingApiFetchers[keyof GreetingApiFetchers]

export const greetingApiFetcherFactory = depend<
  GreetingApiDependencies,
  [GreetingApiConfig],
  GreetingApiFetchers
>(
  {
    createClient: ({ baseUrl }) => createApiClientSimple<GreetingApiType>(baseUrl)
  },
  ({ createClient }, config) => {
    const client = createClient(config)
    return createFetchers(client)
  }
)

export const createGreetingApiFetchers = (config: GreetingApiConfig) =>
  greetingApiFetcherFactory(config)
