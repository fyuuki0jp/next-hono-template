import { Hono } from 'hono'
import { hc } from 'hono/client'

/**
 * Configuration for API client
 */
export type ApiClientConfig = {
  baseUrl: string
  headers?: Record<string, string>
}

/**
 * Create a typed Hono client for any API schema
 * This is a thin wrapper around hono/client's hc() function
 * that allows for future extensions like auth headers, retry logic, etc.
 */
export function createApiClient<T extends Hono>(config: ApiClientConfig) {
  const { baseUrl, headers } = config
  return hc<T>(baseUrl, { headers })
}

/**
 * Create a typed Hono client with just a base URL
 * Convenience function for the most common use case
 */
export function createApiClientSimple<T extends Hono>(baseUrl: string) {
  return createApiClient<T>({ baseUrl })
}
