'use server'

import { greetingServiceFactory } from '../model/factory'
import { Greeting } from './Greeting'

type GreetingContainerProps = {
  apiBaseUrl: string
}

export const GreetingContainer = async ({ apiBaseUrl }: GreetingContainerProps) => {
  const service = await greetingServiceFactory()
  const greeting = await service.getGreeting()

  return <Greeting initialGreeting={greeting} apiBaseUrl={apiBaseUrl} />
}
