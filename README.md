# LinguoFlow

Personalized English-learning web app (video, vocabulary, shadowing, listening, dictation) built on the **Lumina Learn** design system (`design/`).

## Stack
- **Web:** Next.js 14 (App Router) + React 18 + Tailwind + TanStack Query + Zustand
- **API:** NestJS + Prisma + PostgreSQL, BullMQ/Redis, Web Push
- **Speech:** browser-native Web Speech API + server-side custom scorer (Wagner-Fischer alignment)
- **Monorepo:** Turborepo + pnpm workspaces; shared `@repo/types`, `@repo/config`

## Layout
```
apps/web    Next.js frontend
apps/api    NestJS backend + Prisma
packages/types   Shared Zod DTOs + enums + models
packages/config  Shared Tailwind preset (ported from design/tokens.json) + tsconfig base
design/     Source of truth for UI (do not edit casually)
```

## Local development

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
pnpm --filter api test            # 54 unit tests (SRS, streak, subtitle, speech scorer, dictation, series, achievements)
pnpm --filter api typecheck
pnpm --filter web typecheck
pnpm --filter web build
```

## Production deploy (Docker)

The repo ships two production Dockerfiles (`apps/api/Dockerfile`, `apps/web/Dockerfile`) and a `docker-compose.prod.yml` that wires Postgres + Redis + API + Web behind one `docker compose up`.

### 1. Generate VAPID keys for Web Push

```bash
npx web-push generate-vapid-keys
```

### 2. Create a `.env` next to `docker-compose.prod.yml`

```bash
POSTGRES_PASSWORD=change-me-strong-password
JWT_SECRET=$(openssl rand -base64 32)
WEB_ORIGIN=https://your-domain.example
NEXT_PUBLIC_API_URL=https://api.your-domain.example/api
VAPID_PUBLIC_KEY=<from step 1>
VAPID_PRIVATE_KEY=<from step 1>
VAPID_SUBJECT=mailto:admin@your-domain.example
```

### 3. Build + start

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

The API container runs `prisma migrate deploy` automatically on each start, so first boot creates the schema. Seed the achievement + topic catalogue once:

```bash
docker compose -f docker-compose.prod.yml exec api npx prisma db seed
```

### 4. Health check

```bash
curl http://localhost:4000/api/health
# {"status":"ok","info":{"database":{"status":"up"}}, ...}
```

## Environment variables

| Var | Where | Purpose |
|---|---|---|
| `DATABASE_URL` | api | Postgres connection string |
| `JWT_SECRET` | api | Signs access + refresh tokens — **set a random 32+ byte value** |
| `WEB_ORIGIN` | api | CORS allowlist + cookie origin |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | api | Web Push (no value = push silently no-ops) |
| `NEXT_PUBLIC_API_URL` | web build-time | Absolute URL the browser hits |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | web build-time | Public key the browser uses to subscribe |
| `REDIS_HOST` / `REDIS_PORT` | api | BullMQ + caching |

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every push + PR to main:
typecheck (shared types → api → web) → api tests → next build. Cached via the
pnpm store keyed on `pnpm-lock.yaml`.

## Rate limiting

`@nestjs/throttler` applies a 60-rpm default ceiling globally. Auth endpoints are
tighter — see `apps/api/src/modules/auth/auth.controller.ts`:

| Endpoint | Limit |
|---|---|
| `POST /api/auth/register` | 5 / min |
| `POST /api/auth/login` | 10 / min |
| `POST /api/auth/refresh` | 20 / min |
| `POST /api/auth/forgot-password` | 3 / min |
