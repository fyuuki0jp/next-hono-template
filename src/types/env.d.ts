/**
 * Type definitions for environment variables
 * This allows TypeScript to provide autocomplete and type checking for process.env
 */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Node environment
      readonly NODE_ENV: 'development' | 'production' | 'test'

      // Database configuration
      readonly DATABASE_URL?: string
      readonly DRIZZLE_USE_PGLITE?: 'true' | 'false' | '1' | '0'
      readonly PGLITE_DATA_PATH?: string
      readonly PG_MAX_CONNECTIONS?: string
      readonly PG_SSL?: 'true' | 'false' | '1' | '0'

      // Next.js built-in
      readonly NEXT_PUBLIC_VERCEL_URL?: string
      readonly VERCEL_URL?: string

      // Add other environment variables here as needed
      // Example:
      // readonly API_KEY?: string
      // readonly NEXT_PUBLIC_API_URL?: string
    }
  }
}

// This export is necessary to make this file a module
// Without it, the declaration above won't be merged with the global scope
export {}
