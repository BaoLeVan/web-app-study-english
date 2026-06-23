# LinguoFlow

Personalized English-learning web app (video, vocabulary, shadowing, listening, dictation) built on the **Lumina Learn** design system (`design/`).

## Stack
- **Web:** Next.js 14 (App Router) + React 18 + Tailwind + TanStack Query + Zustand
- **API:** NestJS + Prisma + PostgreSQL, BullMQ/Redis, Web Push, Azure Speech
- **Monorepo:** Turborepo + pnpm workspaces; shared `@repo/types`, `@repo/config`

## Layout
```
apps/web    Next.js frontend
apps/api    NestJS backend + Prisma
packages/types   Shared Zod DTOs + enums + models
packages/config  Shared Tailwind preset (ported from design/tokens.json) + tsconfig base
design/     Source of truth for UI (do not edit casually)
```

## Getting started
```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
docker compose up -d              # postgres, redis, minio
pnpm --filter api prisma:generate
pnpm --filter api prisma:migrate  # first migration
pnpm --filter api prisma:seed
pnpm dev                          # runs web (:3000) + api (:4000)
```

## Tests
```bash
pnpm --filter api test            # SRS algorithm unit tests
```

See the full architecture & roadmap in the approved plan.
