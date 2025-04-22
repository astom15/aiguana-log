FROM node:20-alpine AS base

WORKDIR /app

# ---- Dependencies Stage ----
FROM base AS deps
WORKDIR /app

COPY pnpm-lock.yaml ./
COPY package.json ./


COPY apps/api/package.json ./apps/api/

COPY packages/shared-types/package.json ./packages/shared-types/

RUN corepack enable && pnpm install --prod --filter api... --frozen-lockfile

# ---- Runner Stage ----
FROM base AS runner
WORKDIR /app


COPY apps/api/package.json ./

COPY --from=deps /app/node_modules ./node_modules

COPY apps/api/dist ./dist

COPY apps/api/src/prompts ./src/prompts

EXPOSE 3001

CMD [ "node", "dist/index.js" ]

