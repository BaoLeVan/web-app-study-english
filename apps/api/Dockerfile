# syntax=docker/dockerfile:1.7
# Multi-stage build for the NestJS API.
#
# Stage 1: install all workspace deps using the lockfile (cacheable).
# Stage 2: build apps/api + generate prisma client.
# Stage 3: production image with only what we need to run dist/main.js.

ARG NODE_VERSION=20-alpine

FROM node:${NODE_VERSION} AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /repo
RUN corepack enable
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json .npmrc ./
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json  ./packages/types/
COPY apps/api/package.json        ./apps/api/
COPY apps/web/package.json        ./apps/web/
RUN pnpm install --frozen-lockfile

FROM node:${NODE_VERSION} AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /repo
RUN corepack enable
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/packages/config/node_modules ./packages/config/node_modules
COPY --from=deps /repo/packages/types/node_modules ./packages/types/node_modules
COPY --from=deps /repo/apps/api/node_modules ./apps/api/node_modules
COPY . .
RUN pnpm --filter api prisma:generate
RUN pnpm --filter api build

FROM node:${NODE_VERSION} AS runner
RUN apk add --no-cache libc6-compat openssl tini
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000
RUN corepack enable
# Bring in everything we need to run: prebuilt dist, generated prisma client,
# prisma CLI (so migrations run on startup), node_modules, and source-of-truth
# schema for db pushes.
COPY --from=builder /repo/apps/api/dist                          ./dist
COPY --from=builder /repo/apps/api/prisma                        ./prisma
COPY --from=builder /repo/node_modules                           ./node_modules
COPY --from=builder /repo/apps/api/node_modules                  ./apps/api_node_modules
COPY --from=builder /repo/apps/api/package.json                  ./package.json
EXPOSE 4000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
