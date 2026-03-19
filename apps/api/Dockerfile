FROM oven/bun:latest AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lockb ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN bun install --frozen-lockfile

# Build
FROM base AS build
COPY --from=deps /app/node_modules node_modules
COPY . .
RUN cd apps/api && bun run build

# Production
FROM base AS production
COPY --from=build /app/apps/api/dist dist
COPY --from=build /app/node_modules node_modules

EXPOSE 3000
CMD ["bun", "dist/index.js"]
