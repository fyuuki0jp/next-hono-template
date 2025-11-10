'use server'

import { GreetingContainer } from '@/features/greeting/server'
import { ApiSchema } from './api/[...route]/route'
import { createHonoClient } from '@/shared/utils/client'
import { Agents } from '@/features/agents'

export default async function HomePage() {
  const client = await createHonoClient<ApiSchema>()
  const greetingApiUrl = client.api.hello.$url().toString()
  const agentsApiUrl = client.api.chat.$url().toString()

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      <GreetingContainer apiBaseUrl={greetingApiUrl} />
      <Agents apiBaseUrl={agentsApiUrl} />
    </main>
  )
}
