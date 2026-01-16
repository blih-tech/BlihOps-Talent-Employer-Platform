# BlihOps Talent & Employer Platform - Folder Structure

Updated folder structure reflecting the finalized architecture (2026 standards).

```
BlihOps-Talent-Platform/
│
├── packages/                          # Monorepo packages (pnpm workspaces)
│   │
│   ├── core/                          # Infrastructure & cross-cutting concerns
│   │   ├── src/
│   │   │   ├── logger/                # Pino structured logging
│   │   │   ├── exceptions/            # Custom exception classes
│   │   │   ├── config/                # Configuration validation
│   │   │   ├── events/                # EventEmitter2 wrapper
│   │   │   └── decorators/            # Shared decorators
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── shared/                        # Business domain shared code
│   │   ├── src/
│   │   │   ├── types/                 # TypeScript types/interfaces
│   │   │   │   ├── talent.ts
│   │   │   │   ├── job.ts
│   │   │   │   ├── admin.ts
│   │   │   │   └── index.ts
│   │   │   ├── constants/             # Domain constants
│   │   │   │   ├── service-category.ts
│   │   │   │   ├── experience-level.ts
│   │   │   │   └── index.ts
│   │   │   ├── utils/                 # Business utilities
│   │   │   │   ├── matching.util.ts
│   │   │   │   └── index.ts
│   │   │   └── schemas/               # Zod validation schemas
│   │   │       ├── talent.schema.ts
│   │   │       └── job.schema.ts
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── api-backend/                   # NestJS REST API + BullMQ Workers
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/              # JWT authentication
│   │   │   │   ├── talent/            # Talent CRUD & profiles
│   │   │   │   ├── jobs/              # Job CRUD & management
│   │   │   │   ├── matching/          # On-the-fly matching logic
│   │   │   │   ├── notifications/     # Event-driven notifications
│   │   │   │   ├── telegram/          # Thin webhook handlers
│   │   │   │   └── admin/              # Admin-specific endpoints
│   │   │   ├── workers/               # BullMQ workers
│   │   │   │   ├── publish-talent.worker.ts
│   │   │   │   ├── publish-job.worker.ts
│   │   │   │   └── notify-talent.worker.ts
│   │   │   ├── common/               # Guards, interceptors, filters
│   │   │   ├── config/                # Configuration modules
│   │   │   ├── database/              # PostgreSQL models & repositories
│   │   │   │   ├── entities/         # TypeORM entities or Prisma models
│   │   │   │   │   ├── talent.entity.ts
│   │   │   │   │   ├── job.entity.ts
│   │   │   │   │   └── admin.entity.ts
│   │   │   │   └── repositories/
│   │   │   └── main.ts                # Application entry point
│   │   ├── test/                      # Tests
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── telegram-bot/                  # Unified Telegram Bot (grammY)
│   │   ├── src/
│   │   │   ├── handlers/              # Command and message handlers
│   │   │   │   ├── start.handler.ts
│   │   │   │   ├── profile.handler.ts
│   │   │   │   └── job.handler.ts
│   │   │   ├── scenes/               # grammY scene managers
│   │   │   │   ├── talent/           # Talent onboarding scenes
│   │   │   │   │   ├── onboarding.scene.ts
│   │   │   │   │   └── profile-edit.scene.ts
│   │   │   │   └── admin/            # Admin job creation scenes
│   │   │   │       └── job-creation.scene.ts
│   │   │   ├── middleware/           # Rate limiting, RBAC, session
│   │   │   │   ├── rate-limiter.middleware.ts
│   │   │   │   ├── rbac.middleware.ts
│   │   │   │   └── session.middleware.ts
│   │   │   ├── keyboards/            # Inline keyboard components
│   │   │   │   ├── category.keyboard.ts
│   │   │   │   └── main-menu.keyboard.ts
│   │   │   ├── services/             # Business logic services
│   │   │   │   ├── onboarding.service.ts
│   │   │   │   └── api-client.service.ts
│   │   │   ├── types/                # Bot-specific types
│   │   │   └── index.ts              # Bot entry point
│   │   ├── test/
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── admin-web/                     # Next.js 15.5+ Admin Dashboard
│   │   ├── src/
│   │   │   ├── app/                  # App Router (Next.js 15)
│   │   │   │   ├── (auth)/           # Authentication route group
│   │   │   │   │   ├── login/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── layout.tsx
│   │   │   │   ├── (protected)/      # Protected routes
│   │   │   │   │   ├── talents/     # Talent management
│   │   │   │   │   │   ├── page.tsx  # Server Component
│   │   │   │   │   │   ├── [id]/
│   │   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   │   └── edit/
│   │   │   │   │   │   │       └── page.tsx
│   │   │   │   │   ├── jobs/         # Job management
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── [id]/
│   │   │   │   │   ├── matching/     # Matching insights
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── settings/     # Settings
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   ├── error.tsx
│   │   │   │   └── not-found.tsx
│   │   │   ├── components/           # React components
│   │   │   │   ├── ui/               # shadcn/ui components
│   │   │   │   │   ├── button.tsx
│   │   │   │   │   ├── input.tsx
│   │   │   │   │   └── ...
│   │   │   │   ├── talent/           # Talent-specific components
│   │   │   │   ├── job/              # Job-specific components
│   │   │   │   └── matching/         # Matching components
│   │   │   ├── lib/                  # Utilities & API clients
│   │   │   │   ├── api-client.ts
│   │   │   │   └── utils.ts
│   │   │   ├── actions/              # Server Actions
│   │   │   │   ├── talent.actions.ts
│   │   │   │   └── job.actions.ts
│   │   │   ├── auth.ts               # Auth.js v5 configuration
│   │   │   └── globals.css           # Tailwind CSS v4
│   │   ├── public/                   # Static assets
│   │   ├── test/
│   │   ├── package.json
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   └── README.md
│   │
│   └── tooling/                       # Shared dev tooling (optional)
│       ├── eslint-config/            # Shared ESLint config
│       ├── tsconfig-base/            # Base TypeScript config
│       └── commitlint-config/        # Commit lint config
│
├── infrastructure/                    # Infrastructure as Code
│   ├── docker/
│   │   ├── Dockerfile.api-backend
│   │   ├── Dockerfile.telegram-bot
│   │   ├── Dockerfile.admin-web
│   │   └── docker-compose.yml        # Development
│   ├── docker-compose.prod.yml       # Production
│   └── migrations/                   # Database migrations (if using TypeORM)
│
├── tests/                             # E2E and integration tests
│   ├── e2e/
│   │   ├── talent-onboarding.spec.ts
│   │   └── job-creation.spec.ts
│   └── integration/
│       └── api.spec.ts
│
├── observability/                     # Monitoring dashboards (future)
│   ├── prometheus/
│   ├── grafana/
│   └── sentry/
│
├── scripts/                           # Utility scripts
│   ├── setup.sh
│   ├── deploy.sh
│   └── migrate.sh
│
├── docs/                              # Documentation
│   ├── architecture.md                # Main architecture doc
│   ├── architecture-quick-reference.md
│   ├── architecture-diagrams-ascii.md
│   ├── api/                           # API documentation
│   ├── admin-guide/                   # Admin user guide
│   └── README.md
│
├── .env.example                       # Environment template
├── .gitignore
├── .prettierrc
├── .eslintrc.js
├── pnpm-workspace.yaml                # pnpm workspace config
├── package.json                       # Root package.json
├── tsconfig.json                      # Root TypeScript config
├── README.md                          # Main README
└── CONTRIBUTING.md                    # Contributing guidelines
```

## 📦 Package Dependencies

```
packages/
├── core/          (No dependencies on other packages)
├── shared/        (Depends on: core/)
├── api-backend/   (Depends on: core/, shared/)
├── telegram-bot/  (Depends on: core/, shared/)
└── admin-web/     (Depends on: core/, shared/)
```

## 🔄 Key Changes from Original Structure

### Removed/Deprecated
- ❌ `packages/bot-talent/` → Merged into `packages/telegram-bot/`
- ❌ `packages/bot-employer/` → Merged into `packages/telegram-bot/`
- ❌ `automation/` (n8n workflows) → Replaced with BullMQ workers in `api-backend/workers/`

### Added/Updated
- ✅ `packages/telegram-bot/` → Unified bot with role-based access
- ✅ `packages/api-backend/workers/` → BullMQ workers for background jobs
- ✅ `packages/api-backend/database/entities/` → PostgreSQL entities (TypeORM/Prisma)
- ✅ `infrastructure/docker/` → Docker configs (no Nginx)

### Technology Stack
- **Database**: PostgreSQL 16+ (replaces MongoDB)
- **Queue**: BullMQ + Redis (replaces n8n)
- **Bot Framework**: grammY (replaces Telegraf)
- **Frontend**: Next.js 15.5+ (no Vite alternative)
- **Deployment**: VPS + Docker (no Nginx reverse proxy)

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Or start specific services
pnpm --filter api-backend dev
pnpm --filter telegram-bot dev
pnpm --filter admin-web dev
```

## 📝 Notes

- All packages use **pnpm workspaces** for dependency management
- **TypeScript** strict mode enabled across all packages
- **Shared types** in `packages/shared/` prevent duplication
- **Infrastructure code** in `packages/core/` is domain-agnostic
- **Database migrations** can be in `infrastructure/migrations/` or package-specific
- **Docker Compose** handles local development with PostgreSQL and Redis

---

**Last Updated**: 2025-01-XX






