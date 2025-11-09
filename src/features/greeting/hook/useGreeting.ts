'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { parseGreeting, type GreetingModel } from '@/entities/greeting/model/greeting'
import { createGreetingApiFetchers, type GreetingApiKey } from '../api/factory'

type UseGreetingOptions = {
  initialGreeting: GreetingModel
  apiBaseUrl: string
  apiKey?: GreetingApiKey
}

export const useGreeting = ({
  initialGreeting,
  apiBaseUrl,
  apiKey = 'hello'
}: UseGreetingOptions) => {
  const fetchers = useMemo(() => createGreetingApiFetchers({ baseUrl: apiBaseUrl }), [apiBaseUrl])
  const contextualFetcher = fetchers[apiKey]

  if (!contextualFetcher) {
    throw new Error('Greeting API fetcher が解決できませんでした')
  }

  const { data, refetch, isPending } = useQuery<GreetingModel>({
    queryKey: ['greeting', apiKey, apiBaseUrl],
    queryFn: async () => {
      const response = await contextualFetcher()
      const payload = await response.json()
      return parseGreeting(payload.greeting)
    },
    initialData: initialGreeting
  })

  return {
    greeting: data,
    refresh: refetch,
    isPending
  }
}
