# apps/api/Dockerfile

# Use an official Node.js runtime as a parent image
FROM node:20-alpine AS base
WORKDIR /app

# ---- Dependencies Stage ----
# Install only production dependencies for this package
FROM base AS deps
WORKDIR /app

# Copy only the necessary files for installing this package's deps
# We only need the package.json for the api package itself now.
# Lockfile is still useful for speeding up installs if base image changes.
COPY pnpm-lock.yaml ./
COPY apps/api/package.json ./

# Install ONLY production dependencies based on the copied package.json
# Use --no-frozen-lockfile as suggested by error message to bypass lockfile mismatch
RUN corepack enable && pnpm install --prod --no-frozen-lockfile

# ---- Runner Stage ----
# Create a new clean stage for the final image
FROM base AS runner
WORKDIR /app

# Copy the specific package.json for runtime info (e.g., start script)
COPY apps/api/package.json ./

# Copy production node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules
# Copy the compiled application code from the build output created by CI
# This assumes the CI build step ran successfully before docker build
COPY apps/api/dist ./dist
# Copy runtime files if needed (e.g., prompt files)
COPY apps/prompts ./dist/prompts

# Expose the port the app runs on (Heroku assigns $PORT dynamically)
EXPOSE 3001

# Define the command to run your app using the start script from package.json
# Heroku will inject the $PORT environment variable
CMD [ "node", "dist/index.js" ]

