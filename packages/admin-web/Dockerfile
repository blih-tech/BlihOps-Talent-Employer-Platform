# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# Copy workspace files
COPY pnpm-workspace.yaml package.json ./
COPY packages/eslint-config ./packages/eslint-config
COPY packages/prettier-config ./packages/prettier-config
COPY packages/core ./packages/core
COPY packages/shared ./packages/shared
COPY packages/admin-web ./packages/admin-web

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build packages
RUN pnpm --filter @blihops/core build
RUN pnpm --filter @blihops/shared build

# Build Next.js app
WORKDIR /app/packages/admin-web
RUN pnpm build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# Copy workspace files
COPY pnpm-workspace.yaml package.json ./
COPY packages/eslint-config ./packages/eslint-config
COPY packages/prettier-config ./packages/prettier-config
COPY packages/core ./packages/core
COPY packages/shared ./packages/shared
COPY packages/admin-web ./packages/admin-web

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built files from builder
COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/admin-web/.next ./packages/admin-web/.next
COPY --from=builder /app/packages/admin-web/public ./packages/admin-web/public
COPY --from=builder /app/packages/admin-web/package.json ./packages/admin-web/package.json

WORKDIR /app/packages/admin-web

# Expose port
EXPOSE 3001

# Set environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Start the application
CMD ["pnpm", "start"]

