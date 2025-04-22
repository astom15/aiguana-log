# apps/api/Dockerfile

# Use an official Node.js runtime as a parent image
FROM node:20-alpine AS base
# Set a default workdir
WORKDIR /app

# ---- Dependencies Stage ----
# Install only production dependencies for this package
FROM base AS deps
WORKDIR /app

# Copy only the necessary files for installing this package's deps
COPY pnpm-lock.yaml ./
COPY apps/api/package.json ./

# Install ONLY production dependencies for the 'api' package
RUN corepack enable
RUN pnpm fetch --prod

# Install production dependencies using only the offline cache
RUN pnpm install -r --offline --prod

# ---- Runner Stage ----
# Create a new clean stage for the final image
FROM base AS runner
WORKDIR /app

# Copy the specific package.json for runtime info (e.g., start script)
COPY apps/api/package.json ./

# Copy production node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules
# Copy the compiled application code from the build output created by CI
COPY apps/api/dist ./dist
# Copy runtime files if needed (e.g., prompt files)
COPY apps/api/src/prompts ./src/prompts

# Expose the port the app runs on (Heroku assigns $PORT dynamically)
EXPOSE 3001

# Define the command to run your app using the start script from package.json
# Heroku will inject the $PORT environment variable
CMD [ "node", "dist/index.js" ]

