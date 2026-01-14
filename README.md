# BlihOps Talent & Employer Platform

A modern, Telegram-integrated talent ecosystem designed to support BlihOps' core service domains: Information Technology Outsourcing (ITO), AI & Intelligent Solutions, Business Automation Services, and Data & Analytics Services.

## 🏗️ Architecture Overview

This is a **monorepo** containing multiple coordinated services:

- **API Backend** (`packages/api-backend`) - NestJS REST API with JWT authentication
- **Unified Telegram Bot** (`packages/telegram-bot`) - Single bot with role-based access (talent onboarding + job posting)
- **Admin Web** (`packages/admin-web`) - Next.js 15.5+ admin dashboard for approvals, filtering, and operations
- **Queue System** (`packages/api-backend`) - BullMQ workers for reliable job processing
- **Database** - PostgreSQL 16+ with JSONB for flexible fields
- **Session Store** - Redis for bot session management and job queues
- **Shared Code** (`packages/shared`, `packages/core`) - Common types, utilities, and infrastructure

## 📁 Project Structure

```
BlihOps-Talent-Platform/
├── packages/
│   ├── core/              # Infrastructure: logger, exceptions, config, events
│   ├── shared/            # Business domain: types, constants, schemas
│   ├── api-backend/       # NestJS REST API + BullMQ workers
│   ├── telegram-bot/      # Unified Telegram bot (role-based access)
│   ├── admin-web/         # Next.js 15.5+ admin dashboard
│   └── tooling/           # Shared dev tooling (ESLint, TSConfig, etc.)
├── infrastructure/        # Docker, Docker Compose configs
├── tests/                 # E2E and integration tests
├── observability/         # Monitoring dashboards (future)
├── scripts/               # Utility scripts
└── docs/                  # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20.11+ and pnpm 8+
- Docker and Docker Compose
- PostgreSQL 16+ (local or remote)
- Redis 7+ (local or remote)
- Telegram Bot API token
- Linux VPS (for production deployment)

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env

# Configure your .env file with:
# - PostgreSQL connection string
# - Redis connection string
# - Telegram bot token
# - JWT secrets
# - Sentry DSN (optional)
```

### Development

```bash
# Start all services in development mode
pnpm dev

# Or start services individually:
pnpm --filter api-backend dev
pnpm --filter telegram-bot dev
pnpm --filter admin-web dev
```

### Docker Development

```bash
# Start all services with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f
```

## 📦 Package Overview

### `packages/core/`
Infrastructure and cross-cutting concerns. See [packages/core/README.md](./packages/core/README.md) for guidelines.

**Contains:**
- Logger (Winston/Pino wrapper)
- Custom exceptions
- Configuration validation
- Event system (EventEmitter2)
- Shared decorators

### `packages/shared/`
Business domain shared code. See [packages/shared/README.md](./packages/shared/README.md) for guidelines.

**Contains:**
- TypeScript types/interfaces
- Domain constants
- Business utilities
- Validation schemas (Zod)

### `packages/api-backend/`
NestJS REST API with modular architecture:
- `modules/auth/` - JWT authentication
- `modules/talent/` - Talent CRUD and profiles
- `modules/jobs/` - Job CRUD and management
- `modules/matching/` - Matching/recommendation logic
- `modules/notifications/` - Event-driven notifications
- `modules/telegram/` - Thin webhook handlers
- `modules/admin/` - Admin-specific endpoints

### `packages/telegram-bot/`
Unified Telegram bot with role-based access:
- **Talent features**: Conversational onboarding, profile management, CV upload
- **Admin features**: Job creation, job management, approval workflows
- **Framework**: grammY with scene management
- **Session management**: Redis-backed for stateless scaling

### `packages/admin-web/`
Next.js 15.5+ admin dashboard:
- Secure authentication (Auth.js v5)
- Server Components and Server Actions
- Talent management and filtering
- Job management
- Matching insights (on-the-fly computation)
- Approval workflows

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run E2E tests
pnpm --filter tests test:e2e

# Run tests for specific package
pnpm --filter api-backend test
```

## 🏭 Production Deployment

See [docs/deployment.md](./docs/deployment.md) for detailed deployment instructions.

```bash
# Build all packages
pnpm build

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

## 📚 Documentation

- [Architecture Overview](./docs/architecture.md) - Comprehensive system architecture with diagrams
- [Architecture Quick Reference](./docs/architecture-quick-reference.md) - Quick reference guide
- [API Documentation](./docs/api/) - REST API endpoints
- [Admin User Guide](./docs/admin-guide/) - Admin dashboard usage
- [Deployment Guide](./docs/deployment.md) - Production deployment
- [Contributing Guidelines](./CONTRIBUTING.md) - Development guidelines
- [Documentation Index](./docs/README.md) - Complete documentation index

## 🔐 Security

- All secrets must be in environment variables (never commit)
- JWT tokens for web authentication
- Telegram user IDs for bot authentication
- Role-based access control (RBAC) in admin web
- Rate limiting on API endpoints

## 🔄 Workflow Automation

BullMQ workers handle:
- Auto-publication of approved talent profiles to Telegram channels
- Auto-publication of approved jobs to Telegram channels
- Targeted job notifications to matching talents
- Administrative summaries and metrics
- Profile update reminders
- Queue monitoring via BullMQ Board

## 🤝 Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines, including:
- Code organization (`core/` vs `shared/`)
- Git workflow and commit conventions
- Testing requirements
- Code review process

## 📄 License

Proprietary - BlihOps Internal Use Only

## 👥 Team

- **Backend/AI Developer**: APIs, bots, matching logic, automation
- **Web Developer**: Admin dashboard, UI/UX, frontend integration
- **Shared**: Code reviews, testing, deployment, documentation

## 🗺️ Roadmap

### Phase 1 (MVP) - Current
- ✅ Telegram talent onboarding
- ✅ Telegram job posting (admin)
- ✅ Admin web dashboard
- ✅ Automated matching logic
- ✅ Public channel automation

### Phase 2+ (Future)
- AI-enhanced matching
- Enterprise integrations
- Advanced analytics
- Multi-language support
- Mobile app

---

**Status**: 🟢 Active Development - Phase 1 (MVP)

