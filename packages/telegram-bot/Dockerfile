# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json ./
COPY packages/eslint-config ./packages/eslint-config
COPY packages/prettier-config ./packages/prettier-config
COPY packages/core ./packages/core
COPY packages/shared ./packages/shared
COPY packages/telegram-bot ./packages/telegram-bot

# Install dependencies with increased network timeout
RUN pnpm config set network-timeout 300000 && \
    pnpm install --frozen-lockfile

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
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json ./
COPY packages/eslint-config ./packages/eslint-config
COPY packages/prettier-config ./packages/prettier-config
COPY packages/core ./packages/core
COPY packages/shared ./packages/shared
COPY packages/telegram-bot ./packages/telegram-bot

# Install production dependencies only with increased network timeout
# Skip prepare scripts (husky) in production
RUN pnpm config set network-timeout 300000 && \
    pnpm install --frozen-lockfile --prod --ignore-scripts

# Copy built files from builder
COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/telegram-bot/dist ./packages/telegram-bot/dist

WORKDIR /app

# Set environment
ENV NODE_ENV=production

# Start the application
CMD ["node", "packages/telegram-bot/dist/index.js"]




