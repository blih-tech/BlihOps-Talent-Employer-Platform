---
name: Monorepo Setup Configuration
overview: Set up the complete monorepo infrastructure including pnpm workspace, TypeScript configuration, development tooling (ESLint, Prettier, Commitlint), Docker Compose for development, and pre-commit hooks. Skip CI/CD setup for now.
todos:
  - id: setup-pnpm-workspace
    content: Create pnpm-workspace.yaml and root package.json with workspace configuration
    status: completed
  - id: setup-git
    content: Create/update .gitignore with all necessary exclusions
    status: completed
  - id: setup-typescript
    content: Create root tsconfig.json, tsconfig.base.json, and package-specific TypeScript configs
    status: completed
    dependencies:
      - setup-pnpm-workspace
  - id: setup-eslint
    content: Create shared ESLint config package with base, NestJS, and Next.js configs
    status: completed
    dependencies:
      - setup-pnpm-workspace
  - id: setup-prettier
    content: Create shared Prettier config package and configure formatting
    status: completed
    dependencies:
      - setup-pnpm-workspace
  - id: setup-commitlint
    content: Configure Commitlint with conventional commits format
    status: completed
    dependencies:
      - setup-pnpm-workspace
  - id: setup-husky
    content: Set up Husky and lint-staged for pre-commit hooks
    status: completed
    dependencies:
      - setup-eslint
      - setup-prettier
      - setup-commitlint
  - id: setup-docker-compose
    content: Create docker-compose.yml with PostgreSQL 16+, Redis 7+, and file storage volumes
    status: completed
  - id: setup-dockerfiles
    content: Create Dockerfile templates for api-backend, telegram-bot, and admin-web
    status: completed
  - id: setup-env-config
    content: Create .env.example files and environment validation script
    status: completed
  - id: setup-staging
    content: Create docker-compose.staging.yml for staging environment
    status: completed
    dependencies:
      - setup-docker-compose
---

# Project 1.1: Monorepo Setup & Configuration

## Overview

Set up the complete monorepo infrastructure with pnpm workspaces, TypeScript configuration, development tooling, Docker Compose, and pre-commit hooks. This establishes the foundation for all subsequent development work.

## Tasks to Complete

### Task 1.1.1: Initialize Monorepo Structure

#### 1.1.1.1: pnpm Workspace Configuration

- Create `pnpm-workspace.yaml` at root with workspace packages:
- `packages/*` (all packages)
- `packages/core`
- `packages/shared`
- `packages/api-backend`
- `packages/telegram-bot`
- `packages/admin-web`
- Create root `package.json` with:
- Workspace scripts (build, test, lint, format)
- Dev dependencies (TypeScript, pnpm, etc.)
- Package manager configuration
- Scripts for common monorepo operations

#### 1.1.1.2: Git Repository Setup

- Create/update `.gitignore` with:
- Node modules
- Build outputs
- Environment files (.env, .env.local)
- IDE files
- OS files
- Docker volumes
- Logs
- Note: Branch protection rules configured in Git hosting platform (not in repo)
- Pre-commit hooks will be set up in Task 1.1.2

#### 1.1.1.3: TypeScript Configuration

- Create root `tsconfig.json` (base configuration)
- Create `tsconfig.base.json` (shared base config for all packages)
- Create package-specific `tsconfig.json` files:
- `packages/core/tsconfig.json` (extends base)
- `packages/shared/tsconfig.json` (extends base)
- `packages/api-backend/tsconfig.json` (NestJS-specific)
- `packages/telegram-bot/tsconfig.json` (Node.js-specific)
- `packages/admin-web/tsconfig.json` (Next.js-specific)
- Configure path aliases for shared packages
- Set strict mode and appropriate compiler options

### Task 1.1.2: Development Tooling Setup

#### 1.1.2.1: ESLint Configuration

- Create `packages/eslint-config/` shared config package
- Install dependencies: `@typescript-eslint/*`, `eslint-config-prettier`
- Create base ESLint config for TypeScript
- Create NestJS-specific ESLint config
- Create Next.js-specific ESLint config
- Configure in each package's `package.json`
- Set up ESLint ignore files

#### 1.1.2.2: Prettier Configuration

- Create `packages/prettier-config/` shared config package
- Create `.prettierrc.js` with shared config
- Create `.prettierignore` file
- Configure format scripts in root and packages
- Set up format-on-save (IDE configuration note)

#### 1.1.2.3: Commitlint Configuration

- Install `@commitlint/cli`, `@commitlint/config-conventional`
- Create `commitlint.config.js` at root
- Configure conventional commit format
- Set up commit message validation

#### 1.1.2.4: Pre-commit Hooks (Husky + lint-staged)

- Install `husky` and `lint-staged`
- Initialize Husky
- Create `.husky/pre-commit` hook:
- Run lint-staged (lint, format, type-check)
- Run commitlint on commit message
- Configure `lint-staged` in root `package.json`:
- Lint staged files
- Format staged files
- Type-check affected packages

### Task 1.1.3: Docker & Infrastructure Setup

#### 1.1.3.1: Docker Compose Configuration

- Create `docker-compose.yml` at root with:
- PostgreSQL 16+ service:
    - Port 5432
    - Volume: `postgres_data`
    - Environment variables for database setup
- Redis 7+ service:
    - Port 6379
    - Volume: `redis_data`
- File storage volume: `app_storage` (based on Decision 002)
- Create `docker-compose.dev.yml` for development overrides
- Configure health checks for services
- Set up network for service communication

#### 1.1.3.2: Dockerfile Templates

- Create `packages/api-backend/Dockerfile`:
- Multi-stage build
- Node.js 20+ base image
- Prisma setup
- Production optimizations
- Create `packages/telegram-bot/Dockerfile`:
- Node.js 20+ base image
- Production optimizations
- Create `packages/admin-web/Dockerfile`:
- Multi-stage build
- Next.js production build
- Nginx or Node.js server

#### 1.1.3.3: Environment Configuration

- Create `.env.example` at root with:
- Database connection strings
- Redis connection
- API keys placeholders
- Telegram bot token placeholder
- JWT secrets
- File storage paths
- Create `.env.example` for each package if needed
- Create `scripts/validate-env.js` for environment validation
- Document secrets management strategy (use .env files, never commit secrets)

#### 1.1.3.4: Staging Environment Setup

- Create `docker-compose.staging.yml`:
- Separate database instance
- Separate Redis instance
- Environment-specific configurations
- Document staging deployment process

### Task 1.1.4: CI/CD Pipeline Setup

**Status**: Skipped for now (per user request)

## File Structure

```javascript
BlihOps-Talent-Platform/
├── .gitignore
├── .prettierrc.js
├── .prettierignore
├── commitlint.config.js
├── pnpm-workspace.yaml
├── package.json (root)
├── tsconfig.json (root)
├── tsconfig.base.json
├── docker-compose.yml
├── docker-compose.dev.yml
├── docker-compose.staging.yml
├── .env.example
├── .husky/
│   └── pre-commit
├── packages/
│   ├── eslint-config/
│   │   ├── package.json
│   │   ├── index.js (base)
│   │   ├── nestjs.js
│   │   └── nextjs.js
│   ├── prettier-config/
│   │   ├── package.json
│   │   └── index.js
│   ├── core/
│   │   └── tsconfig.json
│   ├── shared/
│   │   └── tsconfig.json
│   ├── api-backend/
│   │   ├── tsconfig.json
│   │   ├── Dockerfile
│   │   └── .env.example
│   ├── telegram-bot/
│   │   ├── tsconfig.json
│   │   └── Dockerfile
│   └── admin-web/
│       ├── tsconfig.json
│       ├── Dockerfile
│       └── .env.example
└── scripts/
    └── validate-env.js
```



## Key Configuration Details

### pnpm Workspace

- Use pnpm 8+ for workspace management
- Configure workspace protocol for internal packages
- Set up proper dependency linking

### TypeScript

- Strict mode enabled
- Path aliases: `@blihops/core`, `@blihops/shared`
- Module resolution: Node16 or Bundler
- Target: ES2022
- Module: ESNext

### ESLint

- TypeScript ESLint recommended rules
- Prettier integration (disable conflicting rules)
- NestJS decorator support
- Next.js specific rules

### Docker

- Use official PostgreSQL 16 and Redis 7 images
- Persistent volumes for data
- Health checks for service dependencies
- Development overrides for hot-reload

## Dependencies

- **Task 1.0.1**: ORM decision (Prisma) - needed for API backend Dockerfile
- **Task 1.0.2**: File storage decision (Docker volumes) - needed for Docker Compose volumes

## Validation

After setup, verify:

1. `pnpm install` works and installs all dependencies
2. `pnpm build` builds all packages
3. `pnpm lint` lints all packages
4. `pnpm format` formats all code
5. `docker-compose up` starts PostgreSQL and Redis
6. Pre-commit hooks run on commit attempt
7. TypeScript compiles without errors

## Notes

- Branch protection rules are configured in Git hosting platform (GitHub/GitLab), not in repository files
- CI/CD will be set up later when ready