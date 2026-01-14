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
COPY packages/telegram-bot ./packages/telegram-bot

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build packages
RUN pnpm --filter @blihops/core build
RUN pnpm --filter @blihops/shared build
RUN pnpm --filter @blihops/telegram-bot build

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
COPY packages/telegram-bot ./packages/telegram-bot

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built files from builder
COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/telegram-bot/dist ./packages/telegram-bot/dist

WORKDIR /app

# Set environment
ENV NODE_ENV=production

# Start the application
CMD ["node", "packages/telegram-bot/dist/main.js"]

