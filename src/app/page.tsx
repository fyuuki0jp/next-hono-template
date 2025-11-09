'use server'
import { headers } from 'next/headers'
import { hc } from 'hono/client'

import { GreetingContainer } from '@/features/greeting/server'
import { ApiSchema } from './api/[...route]/route'

export default async function HomePage() {
  const headerList = await headers()
  const protocol = headerList.get('x-forwarded-proto') ?? 'http'
  const host = headerList.get('host') ?? 'localhost:3000'
  const origin = `${protocol}://${host}`

  const client = hc<ApiSchema>(origin)
  const greetingApiUrl = client.api.hello.$url().toString()

  return (
    <main className="mx-auto max-w-2xl p-6">
      <GreetingContainer apiBaseUrl={greetingApiUrl} />
    </main>
  )
}
