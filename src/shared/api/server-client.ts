import { Hono } from 'hono'
import { headers } from 'next/headers'
import { createApiClient } from './client'

/**
 * Create a typed Hono client for server-side use (Server Components, Server Actions)
 * Automatically resolves the base URL from Next.js headers
 */
export async function createServerApiClient<T extends Hono>() {
  const headerList = await headers()
  const protocol = headerList.get('x-forwarded-proto') ?? 'http'
  const host = headerList.get('host') ?? 'localhost:3000'
  const origin = `${protocol}://${host}`

  return createApiClient<T>({ baseUrl: origin })
}
