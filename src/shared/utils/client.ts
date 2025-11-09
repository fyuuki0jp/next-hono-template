  
import { Hono } from 'hono'
import { hc } from 'hono/client'
import { headers } from 'next/headers'

export async function createHonoClient<T extends Hono<any,any,any>>() {
  const headerList = await headers()
  const protocol = headerList.get('x-forwarded-proto') ?? 'http'
  const host = headerList.get('host') ?? 'localhost:3000'
  const origin = `${protocol}://${host}`

  const client = hc<T>(origin)
  return client
}