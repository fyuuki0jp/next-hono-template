'use server'

import { GreetingContainer } from '@/features/greeting/server'
import { ApiSchema } from './api/[...route]/route'
import { createHonoClient } from '@/shared/utils/client'

export default async function HomePage() {

  const client = await createHonoClient<ApiSchema>()
  const greetingApiUrl = client.api.hello.$url().toString()

  return (
    <main className="mx-auto max-w-2xl p-6">
      <GreetingContainer apiBaseUrl={greetingApiUrl} />
    </main>
  )
}
