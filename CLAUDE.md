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
entities/greeting/api/repository.ts → Drizzle → greetings table →
parseGreeting (entity validation)
```

**API flow:**
```
app/api/[...route]/route.ts → Hono app → feature routers →
service layer → repository layer → database
```

**Client-side flow:**
```
Client component → useGreeting hook → API fetchers (hono/client) →
/api endpoints → validation with entity parsers
```

### Key Files for API Extension

1. **`src/app/api/[...route]/route.ts`**: Central API router
   - Mount feature routers here using `app.route(path, router)`
   - **CRITICAL:** Update `ApiSchema` export when adding routes

2. **Feature API Router**: `features/{feature}/api/hono-router.ts`
   - Define Hono routes for the feature
   - Export typed router for ApiSchema

3. **Feature API Factory**: `features/{feature}/api/factory.ts`
   - Create typed Hono client fetchers using `hc<FeatureApiType>`
   - Export fetcher functions for client hooks

4. **Client Hooks**: `features/{feature}/hook/use*.ts`
   - Accept initial server data
   - Use React Query with typed fetchers
   - Validate responses with entity parsers

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

Environment variables:
- `DRIZZLE_USE_PGLITE`: `true`/`1` for PGlite, `false`/`0` for PostgreSQL
- `PGLITE_DATA_PATH`: File path for PGlite data (default: `.devDatabase`)
- `DATABASE_URL`: PostgreSQL connection string (required for Postgres mode)
- `PG_MAX_CONNECTIONS`: Connection pool size (default: 10)
- `PG_SSL`: Enable SSL for PostgreSQL (default: false)
- `NODE_ENV`: PGlite is prohibited in production

**Database schema**: All Drizzle tables are defined in `src/shared/db/schema.ts`

## Working with Features

### Adding a New Feature

1. Create feature directory structure following the greeting example:
   ```
   features/{feature}/
     api/
       hono-router.ts    # Hono route definitions
       factory.ts        # Client fetcher factory
     model/
       service.ts        # Business logic
       factory.ts        # Service DI factory
     hook/
       use{Feature}.ts   # Client hooks
     ui/
       {Feature}Container.tsx
     server/
       index.ts          # Server entry (re-exports with 'use server')
     index.ts            # Client entry
   ```

2. Register the API route in `src/app/api/[...route]/route.ts`:
   ```typescript
   import { featureApi } from '@/features/{feature}/server'
   const api = app.route('/feature-path', featureApi)
   export type ApiSchema = typeof api  // Update this!
   ```

3. Create repository in `entities/{entity}/api/repository.ts`

4. Wire up DI factories from repository → service → API fetchers

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

## API Response Conventions

- Always wrap responses in objects with stable keys (e.g., `{ greeting: "..." }`)
- This keeps client parsing simple and consistent
- Validate all responses with entity parsers (see `entities/{entity}/model/`)

## Testing & Seeding

- Run `pnpm db:seed` after migrations to populate initial data
- Seed script location: `scripts/seed.ts`
- After seeding, `GET /api/hello` should return a greeting message
