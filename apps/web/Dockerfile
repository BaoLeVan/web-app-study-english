# syntax=docker/dockerfile:1.7
# Multi-stage build for the Next.js web app.

ARG NODE_VERSION=20-alpine

FROM node:${NODE_VERSION} AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /repo
RUN corepack enable
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json .npmrc ./
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json  ./packages/types/
COPY apps/api/package.json        ./apps/api/
COPY apps/web/package.json        ./apps/web/
RUN pnpm install --frozen-lockfile

FROM node:${NODE_VERSION} AS builder
WORKDIR /repo
RUN corepack enable
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/web/node_modules ./apps/web/node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter web build

FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs
COPY --from=builder /repo/apps/web/public           ./public
COPY --from=builder /repo/apps/web/.next            ./.next
COPY --from=builder /repo/apps/web/node_modules     ./node_modules
COPY --from=builder /repo/apps/web/package.json     ./package.json
USER nextjs
EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "3000"]
