# Agent Guidelines for Little John

## Build/Lint/Test Commands
- **Backend**: `cd packages/backend && bun run check` (type-check + lint), `bun run lint:fix`, `bun run dev`
- **Frontend**: `cd packages/frontend && bun run check`, `bun run build`, `bun run dev`
- **Test**: `bun test` for all tests, `bun test <file-path>` for single test file
- **Database**: `cd packages/backend && bun run db:migrate` (dev), `bun run db:push` (schema push), `bun run db:studio`

## Runtime & Tools
- **Always use Bun**: Use `bun` instead of node/npm/pnpm/yarn. Bun auto-loads `.env` files.
- **No unnecessary packages**: Use `Bun.serve()` not Express, `bun:sqlite` not better-sqlite3, built-in WebSocket not `ws`

## Code Style
- **TypeScript**: Strict mode enabled. Use explicit types, avoid `any`. Enable `noUncheckedIndexedAccess`.
- **Imports**: Absolute imports from features (`./features/auth`). Use named exports for features, default for routes.
- **Framework**: Backend uses Hono, Frontend uses React 19 + shadcn/ui + Tailwind CSS
- **Error handling**: Use try/catch, return proper HTTP status codes, log errors with context
- **Naming**: camelCase for variables/functions, PascalCase for components/types, SCREAMING_SNAKE_CASE for constants
- **Formatting**: 2-space indent, single quotes for strings, trailing commas, semicolons required
- **Linting**: Oxlint configured for TypeScript, React, unicorn, and import rules

## Architecture
- **Monorepo**: Workspaces in `packages/` - backend (Hono API), frontend (React), sandbox (experiments)
- **Features**: Organize by feature in `src/features/<feature-name>/{index.ts,routes.ts,types.ts}`
- **Database**: Prisma with PostgreSQL. Run migrations before schema changes.
- **Auth**: Better Auth integration - routes auto-mounted at `/api/auth/*`
- **Environment**: Config in `src/config/env.ts`, type-safe env access via exported const object
