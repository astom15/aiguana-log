FROM node:20-alpine AS base

WORKDIR /app

# ---- Dependencies Stage ----
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --prod --frozen-lockfile

# ---- Build Stage (if not already built in CI) ----
# If your CI already builds everything, you might copy artifacts instead.
# But building here ensures the image is self-contained.
# FROM base AS builder
# WORKDIR /app
# COPY . .
# RUN corepack enable && pnpm install --frozen-lockfile
# RUN pnpm build # Assuming build script is 'tsc'

FROM base AS runner
WORKDIR /app
COPY package.json ./
COPY --from=deps /app/node_modules ./node_modules
# Copy the compiled application code from the build stage or local build output
# If building in CI before docker build: COPY ./dist ./dist
# If building inside docker (using builder stage): COPY --from=builder /app/dist ./dist
COPY ./dist ./dist 

# Copy runtime files if needed (e.g., prompt files)
# Ensure the path is correct relative to the Dockerfile location
COPY ./src/prompts ./src/prompts

EXPOSE 3001

# Define the command to run your app using the start script from package.json
# Heroku will inject the $PORT environment variable
CMD [ "node", "dist/index.js" ]

