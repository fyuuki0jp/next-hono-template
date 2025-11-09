# Copilot Usage Notes

## Project Snapshot

- Next.js 16 App Router + React 19 + TypeScript + Tailwind 4; `app/layout.tsx` sets metadata and wraps `AppProviders` for React Query.
- Persistence uses Drizzle ORM on in-memory PGlite; `shared/db/client.ts` also seeds the `greetings` table on first run.
- Dependency injection relies on `velona` factories (`shared/di/container.ts`, `entities/greeting/api/factory.ts`, `features/greeting/model/factory.ts`).
- `pnpm` is canonical for workflows (`pnpm install|dev|build|start|lint`); ESLint extends `next/core-web-vitals`.

## Architecture & Data Flow

- `app/page.tsx` is a `'use server'` entry: it derives the request origin from headers, builds an `hc<ApiSchema>` client, and hands the `/api` base URL to feature containers.
- Server entry `features/greeting/server/index.ts` re-exports `'use server'` `GreetingContainer` plus service/API factories; browser entry `features/greeting/index.ts` exposes client hooks/components.
- API routing is centralized in `app/api/[...route]/route.ts` by mounting feature routers on `new Hono().basePath('/api')`; always refresh the exported `ApiSchema` when adding routes.
- Greeting read path: container → `greetingServiceFactory` → `entities/greeting/api/repository.ts` → Drizzle `greetings` table → entity parser `parseGreeting` for schema enforcement.

## Patterns to Follow

- Keep FSD dependency flow `app -> features -> entities -> shared`; mark server-only modules with `'use server'` and client hooks/components with `'use client'`.
- Compose new services with `velona.depend`, wiring lower-layer factories and re-exporting types from feature `server` and `index.ts` entry points.
- Extend APIs by registering routes in `app/api/[...route]/route.ts`, defining feature routers (see `features/greeting/api/hono-router.ts`), and exposing fetchers via `api/factory.ts` ala `GreetingApiFetchers`.
- Client data hooks should mirror `useGreeting`: accept initial server data, derive `queryKey`, call typed fetchers, and validate payloads with entity parsers.

## Working Effectively

- Tailwind utilities load from `app/globals.css`; add tokens and component styles inside `@layer` blocks rather than editing generated CSS.
- New Drizzle tables live in `shared/db/schema.ts`; ensure `prepareDatabase()` in `shared/db/client.ts` seeds any required defaults.
- When adjusting DI, update corresponding `Factory` types (e.g., `GreetingServiceFactory`) so dependent layers stay typed.
- API responses should remain object-wrapped with stable keys (current handlers return `{ greeting }`) to keep client parsing simple.
