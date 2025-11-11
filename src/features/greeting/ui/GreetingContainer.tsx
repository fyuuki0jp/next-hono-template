'use server'

import { greetingServiceFactory } from '../model/factory'
import { Greeting } from './Greeting'

type GreetingContainerProps = {
  apiBaseUrl: string
}

export const GreetingContainer = async ({ apiBaseUrl }: GreetingContainerProps) => {
  const service = await greetingServiceFactory()
  const result = await service.getGreeting()

  if (!result.ok) {
    // Handle error case - could be a dedicated error UI component
    return (
      <div className="text-destructive">
        Error loading greeting: {result.error.message}
      </div>
    )
  }

  return <Greeting initialGreeting={result.value} apiBaseUrl={apiBaseUrl} />
}
