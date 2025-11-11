# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 (App Router) + Hono + Drizzle ORM full-stack template. The architecture hosts a Hono-based API at `src/app/api/[...route]/route.ts` and uses `hono/client` from Next.js pages to access those APIs. The project demonstrates a practical implementation using dependency injection (Velona), layered architecture (Repository/Service), and Feature-Sliced Design principles.

## Development Commands

**Package Manager:** This project uses `pnpm` as the canonical package manager.

```bash
# Development
pnpm install              # Install dependencies
pnpm dev                 # Start Next.js dev server (includes Hono API)

# Building & Production
pnpm build               # Production build
pnpm start               # Start production server

# Code Quality
pnpm lint                # Run ESLint
pnpm format              # Format code with Prettier
pnpm format:check        # Check formatting without writing
pnpm typecheck           # Run TypeScript type checking

# Testing
pnpm test                # Run tests with Vitest
pnpm test:ui             # Run tests with Vitest UI
pnpm test:coverage       # Run tests with coverage report

# Database Operations
pnpm db:generate         # Generate migrations from schema
pnpm db:migrate          # Apply migrations
pnpm db:push             # Push schema directly to database
pnpm db:seed             # Seed database with initial data (scripts/seed.ts)
```

## Architecture Overview

### Layer Structure (Feature-Sliced Design)

The project enforces strict layer dependencies via ESLint boundaries plugin:

- `app/` → can import from: widgets, features, entities, shared
- `features/` → can import from: entities, shared
- `entities/` → can import from: shared
- `shared/` → can import from: shared only

**Important:** These boundaries are enforced at the ESLint level in `eslint.config.mjs`. Do not violate these import rules.

### Data Flow Pattern

**Server-side flow:**
```
app/page.tsx → features/greeting/server → greetingServiceFactory →
features/greeting/api/repository.ts → Drizzle → greetings table →
parseGreeting (entity validation) → Result<T, E>
```

**API flow:**
```
app/api/[...route]/route.ts → Hono app → feature routers →
service layer (Result<T, E>) → repository layer (Result<T, E>) → database
```

**Client-side flow:**
```
Client component → useGreeting hook → API fetchers (shared/api/client) →
/api endpoints → validation with entity parsers
```

### Error Handling with Result Type

This project uses a **Result type** instead of exceptions for explicit error handling:

```typescript
import { ok, err, type Result } from '@/shared/lib/result'

// Repository layer
export const createGreetingRepository = (db: DbClient): GreetingRepository => ({
  async getLatest(): Promise<Result<GreetingModel, GreetingRepositoryError>> {
    try {
      const [row] = await db.select().from(greetings).orderBy(desc(greetings.id)).limit(1)
      if (!row) {
        return err({ type: 'not_found', message: 'Greeting not found' })
      }
      return ok(fromRow(row))
    } catch (error) {
      return err({ type: 'database_error', message: 'Failed to fetch', cause: error })
    }
  }
})

// Service layer - passes through Result
export const createGreetingService = (repository: GreetingRepository): GreetingService => ({
  getGreeting: () => repository.getLatest()
})

// API layer - converts Result to HTTP response
export const greetingApi = new Hono().get('/', async (c) => {
  const result = await service.getGreeting()
  if (!result.ok) {
    return c.json({ error: result.error.message }, result.error.type === 'not_found' ? 404 : 500)
  }
  return c.json({ greeting: result.value })
})
```

**Key utilities:**
- `ok(value)`, `err(error)` - constructors
- `isOk()`, `isErr()` - type guards
- `map()`, `andThen()`, `match()` - functional composition
- `tryCatch()`, `tryCatchAsync()` - wrap throwing code

**Important:** All repository and service methods should return `Result<T, E>` instead of throwing exceptions.

### Key Files for API Extension

1. **`src/app/api/[...route]/route.ts`**: Central API router
   - Mount feature routers here using `app.route(path, router)`
   - **CRITICAL:** Update `ApiSchema` export when adding routes

2. **Feature API Router**: `features/{feature}/api/hono-router.ts`
   - Define Hono routes for the feature
   - Handle Result type and convert to HTTP responses
   - Export typed router for ApiSchema

3. **Feature API Factory**: `features/{feature}/api/factory.ts`
   - Use `createApiClientSimple<T>()` from `@/shared/api/client`
   - Create typed Hono client fetchers
   - Export fetcher functions for client hooks

4. **Client Hooks**: `features/{feature}/hook/use*.ts`
   - Accept initial server data
   - Use React Query with typed fetchers
   - Validate responses with entity parsers
   - Handle error responses from API

### API Client Factory Pattern

**Shared utilities** (`src/shared/api/`):
```typescript
// For client-side usage
import { createApiClientSimple } from '@/shared/api/client'
const client = createApiClientSimple<ApiType>(baseUrl)

// For Server Components
import { createServerApiClient } from '@/shared/api/server-client'
const client = await createServerApiClient<ApiType>()
```

**Feature factory** (`features/{feature}/api/factory.ts`):
```typescript
import { createApiClientSimple } from '@/shared/api/client'

export const featureApiFetcherFactory = depend(
  { createClient: ({ baseUrl }) => createApiClientSimple<FeatureApiType>(baseUrl) },
  ({ createClient }, config) => {
    const client = createClient(config)
    return { fetchMethod: client.route.$get }
  }
)
```

**Important:** Always use shared API client utilities instead of calling `hc()` directly.

### Dependency Injection with Velona

The project uses Velona for DI. Key pattern:

```typescript
// Dependency definition
export const dbFactory = depend({ getDb }, ({ getDb }) => getDb())

// Service factory depending on repository
export const greetingServiceFactory = depend(
  { repository: greetingRepositoryFactory },
  ({ repository }) => createGreetingService(repository)
)
```

**Important:** When modifying DI chains, update corresponding `Factory` types to maintain type safety throughout dependent layers.

### Database Configuration

The database client (`src/shared/db/client.ts`) supports both PGlite (in-memory) and PostgreSQL:

- **PGlite mode**: Enabled by default in development when `DATABASE_URL` is not set
- **PostgreSQL mode**: Required in production or when `DRIZZLE_USE_PGLITE=false`

**Environment Variables:**

All environment variables are **type-safe** via `src/types/env.d.ts`:
- `DRIZZLE_USE_PGLITE`: `'true'` | `'false'` | `'1'` | `'0'`
- `PGLITE_DATA_PATH`: File path for PGlite data (default: `.devDatabase`)
- `DATABASE_URL`: PostgreSQL connection string (required for Postgres mode)
- `PG_MAX_CONNECTIONS`: Connection pool size (default: 10)
- `PG_SSL`: `'true'` | `'false'` | `'1'` | `'0'`
- `NODE_ENV`: `'development'` | `'production'` | `'test'`

TypeScript will provide autocomplete and type checking for `process.env` without runtime validation, maintaining compile-time optimizations.

**Database schema**: All Drizzle tables are defined in `src/shared/db/schema.ts`

## Working with Features

### Adding a New Feature

1. Create feature directory structure following the greeting example:
   ```
   features/{feature}/
     api/
       hono-router.ts         # Hono route definitions (handles Result type)
       repository.ts          # Data access layer (returns Result)
       repository.test.ts     # Repository tests
       factory.ts             # Client fetcher factory (uses shared/api/client)
     model/
       service.ts             # Business logic (returns Result)
       service.test.ts        # Service tests
       repository-factory.ts  # Repository DI factory
       factory.ts             # Service DI factory
     hook/
       use{Feature}.ts        # Client hooks
     ui/
       {Feature}Container.tsx
     server/
       index.ts               # Server entry (re-exports with 'use server')
     index.ts                 # Client entry
   ```

2. Create entity model in `entities/{entity}/model/`:
   ```
   entities/{entity}/
     model/
       {entity}.ts            # Zod schemas, types, parsers
       {entity}.test.ts       # Model/parser tests
     ui/                      # Shared presentational components (optional)
   ```

3. Register the API route in `src/app/api/[...route]/route.ts`:
   ```typescript
   import { featureApi } from '@/features/{feature}/server'
   const api = app.route('/feature-path', featureApi)
   export type ApiSchema = typeof api  // Update this!
   ```

4. Wire up DI factories: repository-factory → service factory → API fetchers

**Important:** Repositories belong in `features/` (not `entities/`). Entities should only contain data models and validation.

### Server vs Client Boundaries

- Mark server-only modules with `'use server'` directive
- Mark client hooks/components with `'use client'` directive
- Server entry: `features/{feature}/server/index.ts` (re-exports server-safe code)
- Client entry: `features/{feature}/index.ts` (re-exports client hooks/components)

## Styling

- Tailwind CSS 4 is configured
- Global styles: `src/app/globals.css`
- Add custom utilities and component styles inside `@layer` blocks
- Use `cn()` utility from `src/lib/utils.ts` for conditional class merging
- **shadcn/ui components**: Generated in `src/shared/ui/` (configured in `components.json`)

## API Response Conventions

- Always wrap responses in objects with stable keys (e.g., `{ greeting: "..." }`)
- Success: `{ data: value }` or `{ greeting: "..." }`
- Error: `{ error: "message" }` with appropriate HTTP status code
- Validate all responses with entity parsers (see `entities/{entity}/model/`)

## Testing

This project uses **Vitest** for unit and integration testing.

### Test Structure

Tests are co-located with source files using the `*.test.ts(x)` naming convention:

```
src/
├── entities/greeting/model/
│   ├── greeting.ts
│   └── greeting.test.ts        # Entity/Parser tests
├── features/greeting/
│   ├── model/
│   │   ├── service.ts
│   │   └── service.test.ts     # Service layer tests
│   └── api/
│       ├── hono-router.ts
│       └── hono-router.test.ts # API integration tests
└── shared/utils/
    └── client.test.ts
```

### Testing Strategies by Layer

**Entity Layer (`entities/`):**
- Test Zod schemas and parsers with boundary values
- Example: `parseGreeting()`, `fromRow()`

**Feature Repository Layer (`features/{feature}/api/`):**
- Test with actual database (PGlite in-memory) or mock DbClient
- Test Result type error cases (not_found, database_error)
- Example:
  ```typescript
  import { ok, err } from '@/shared/lib/result'

  it('returns err when row not found', async () => {
    const mockDb = { select: vi.fn().mockReturnValue({ from: vi.fn().mockReturnValue({ orderBy: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue([]) }) }) }) }
    const repo = createGreetingRepository(mockDb)
    const result = await repo.getLatest()
    expect(result.ok).toBe(false)
  })
  ```

**Feature Service Layer (`features/{feature}/model/`):**
- Mock repository to return Result type using `ok()` and `err()`
- Test business logic in isolation
- Example pattern:
  ```typescript
  import { ok, err } from '@/shared/lib/result'

  const mockRepository = {
    getLatest: vi.fn().mockResolvedValue(ok(mockGreeting))
  }
  const service = createGreetingService(mockRepository)
  const result = await service.getGreeting()
  expect(result.ok).toBe(true)
  if (result.ok) {
    expect(result.value).toEqual(mockGreeting)
  }
  ```

**API Layer (`features/{feature}/api/`):**
- Use Hono's `testClient` for integration testing
- Mock Velona factories to return Result type
- Test both success and error responses
- Example:
  ```typescript
  import { testClient } from 'hono/testing'
  import { ok, err } from '@/shared/lib/result'

  vi.mock('../model/factory', () => ({ greetingServiceFactory: vi.fn() }))

  const mockService = {
    getGreeting: vi.fn().mockResolvedValue(ok(mockGreeting))
  }
  vi.mocked(greetingServiceFactory).mockResolvedValue(mockService)

  const client = testClient(greetingApi)
  const response = await client.index.$get()
  expect(response.status).toBe(200)

  // Test error case
  mockService.getGreeting.mockResolvedValue(
    err({ type: 'not_found', message: 'Not found' })
  )
  const errorResponse = await client.index.$get()
  expect(errorResponse.status).toBe(404)
  ```

**React Hooks (`features/{feature}/hook/`):**
- Use `@testing-library/react` for component testing
- Mock API responses with MSW (Mock Service Worker)
- Wrap tests in `QueryClientProvider` for React Query

### Mocking with Velona DI

For Velona-based factories, use the `inject()` method in integration tests:

```typescript
const mockRepository = { getLatest: vi.fn() }
const service = await greetingServiceFactory.inject({
  repository: () => Promise.resolve(mockRepository)
})()
```

### Database Testing

Tests use PGlite in-memory mode by default:
- `DRIZZLE_USE_PGLITE=true` (set in `vitest.setup.ts`)
- `PGLITE_DATA_PATH=memory://` for ephemeral test databases
- No setup/teardown needed for unit tests that mock repositories

### Running Tests

```bash
pnpm test              # Run all tests in watch mode
pnpm test:ui           # Open Vitest UI in browser
pnpm test:coverage     # Generate coverage report
```

### Coverage

Coverage is configured to use the v8 provider and excludes:
- `node_modules/`, `.next/`, build outputs
- Type definition files (`*.d.ts`)
- Config files (`*.config.*`)
- Scripts and test files themselves

## Database Seeding

- Run `pnpm db:seed` after migrations to populate initial data
- Seed script location: `scripts/seed.ts`
- After seeding, `GET /api/hello` should return a greeting message
