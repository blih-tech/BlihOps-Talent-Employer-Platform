# Environment Variables Template

This document contains the environment variable templates for all packages. Copy these to `.env` files in the respective locations.

## Root `.env.example`

```bash
# Database Configuration
POSTGRES_USER=blihops
POSTGRES_PASSWORD=change_me_secure_password
POSTGRES_DB=blihops_db
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}?schema=public

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://${REDIS_HOST}:${REDIS_PORT}

# API Backend Configuration
API_PORT=3000
API_URL=http://localhost:${API_PORT}
NODE_ENV=development

# JWT Configuration
JWT_SECRET=change_me_jwt_secret_key_min_32_chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=change_me_refresh_secret_key_min_32_chars
JWT_REFRESH_EXPIRES_IN=30d

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=change_me_telegram_bot_token
TELEGRAM_WEBHOOK_URL=
TELEGRAM_TALENT_CHANNEL_ID=
TELEGRAM_JOB_CHANNEL_ID=

# File Storage Configuration
APP_STORAGE_PATH=./storage
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document

# Admin Web Configuration
ADMIN_WEB_PORT=3001
ADMIN_WEB_URL=http://localhost:${ADMIN_WEB_PORT}
NEXTAUTH_URL=http://localhost:${ADMIN_WEB_PORT}
NEXTAUTH_SECRET=change_me_nextauth_secret_min_32_chars

# Observability
SENTRY_DSN=
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX_REQUESTS=100

# Staging Environment Configuration
# These variables are used when running docker-compose.staging.yml
POSTGRES_USER_STAGING=blihops_staging
POSTGRES_PASSWORD_STAGING=change_me_staging_password
POSTGRES_DB_STAGING=blihops_staging_db
APP_STORAGE_PATH_STAGING=./storage-staging
# Staging uses different ports: PostgreSQL (5433), Redis (6380)
# Staging DATABASE_URL: postgresql://${POSTGRES_USER_STAGING}:${POSTGRES_PASSWORD_STAGING}@localhost:5433/${POSTGRES_DB_STAGING}?schema=public
# Staging REDIS_URL: redis://localhost:6380
```

## `packages/api-backend/.env.example`

```bash
# Database Configuration
DATABASE_URL=postgresql://blihops:change_me_secure_password@localhost:5432/blihops_db?schema=public

# Redis Configuration
REDIS_URL=redis://localhost:6379

# API Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=change_me_jwt_secret_key_min_32_chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=change_me_refresh_secret_key_min_32_chars
JWT_REFRESH_EXPIRES_IN=30d

# File Storage
APP_STORAGE_PATH=./storage
MAX_FILE_SIZE=10485760

# Observability
SENTRY_DSN=
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX_REQUESTS=100
```

## `packages/telegram-bot/.env.example`

```bash
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=change_me_telegram_bot_token
TELEGRAM_WEBHOOK_URL=
TELEGRAM_TALENT_CHANNEL_ID=
TELEGRAM_JOB_CHANNEL_ID=

# API Backend URL
API_URL=http://localhost:3000

# Redis Configuration (for sessions)
REDIS_URL=redis://localhost:6379

# Node Environment
NODE_ENV=development

# Observability
SENTRY_DSN=
LOG_LEVEL=info
```

## `packages/admin-web/.env.example`

```bash
# Next.js Configuration
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=change_me_nextauth_secret_min_32_chars

# Database (for Auth.js)
DATABASE_URL=postgresql://blihops:change_me_secure_password@localhost:5432/blihops_db?schema=public

# Observability
NEXT_PUBLIC_SENTRY_DSN=
LOG_LEVEL=info
```

## Staging Environment Setup

The staging environment uses separate Docker Compose configuration and different ports to avoid conflicts with development:

**Staging Ports:**
- PostgreSQL: `5433` (development uses `5432`)
- Redis: `6380` (development uses `6379`)

**Starting Staging Environment:**
```bash
# Start staging services
docker-compose -f docker-compose.staging.yml up -d

# View staging logs
docker-compose -f docker-compose.staging.yml logs -f

# Stop staging services
docker-compose -f docker-compose.staging.yml down
```

**Staging Environment Variables:**
- All staging services use variables with `_STAGING` suffix
- Staging database and Redis are completely separate from development
- Staging storage volume: `app_storage_staging` (mounted to `./storage-staging` by default)

## Usage

1. Copy the appropriate template to create `.env` files in each package directory
2. Update all values marked with `change_me_*`
3. Never commit `.env` files to version control
4. Use `scripts/validate-env.js` to validate environment variables before starting the application
5. For staging, ensure staging-specific variables are set in your `.env` file



