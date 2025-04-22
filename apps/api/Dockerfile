# apps/api/Dockerfile

# Use an official Node.js runtime as a parent image
FROM node:20-alpine AS base
# Set a default workdir
WORKDIR /app

# ---- Dependencies Stage ----
# Prepare production dependencies using pnpm deploy
FROM base AS deps
WORKDIR /app

# Copy lockfile and root package.json first
COPY pnpm-lock.yaml ./
COPY package.json ./

# Copy necessary package.json files for workspace resolution
COPY apps/api/package.json ./apps/api/
COPY apps/shared-types/package.json ./apps/shared-types/ 

# Use pnpm deploy to copy the target package ('api') and its prod dependencies
# to a deployment directory './out'. It uses the lockfile to ensure correct versions.
# Ensure 'api' matches the "name" field in apps/api/package.json
RUN corepack enable && pnpm deploy --prod --filter api ./out
# The output in './out' will contain the pruned node_modules and package files for 'api'

# ---- Runner Stage ----
# Create a new clean stage for the final image
FROM base AS runner
WORKDIR /app

# Copy the specific package.json for runtime info (e.g., start script)
# Copy it from the original location in the build context
COPY apps/api/package.json ./

# Copy production node_modules AND package files from the './out' directory created by pnpm deploy
COPY --from=deps /app/out/node_modules ./node_modules
# Copy the compiled application code from the build output created by CI
COPY apps/api/dist ./dist
# Copy runtime files if needed (e.g., prompt files)
COPY apps/api/src/prompts ./src/prompts

# Expose the port the app runs on (Heroku assigns $PORT dynamically)
EXPOSE 3001

# Define the command to run your app using the start script from package.json
# Heroku will inject the $PORT environment variable
CMD [ "node", "dist/index.js" ]

