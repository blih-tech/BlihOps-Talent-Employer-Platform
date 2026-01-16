# BlihOps Talent & Employer Platform - Codebase Overview

**Purpose**: Deep understanding of the entire codebase structure, current implementation status, and architecture.

**Last Updated**: 2025-01-XX

---

## 🏗️ System Architecture

### High-Level Overview

The BlihOps Talent Platform is a **monorepo-based, multi-service application** designed to connect talents with job opportunities through Telegram and a web admin dashboard.

**Core Components**:
1. **API Backend** (NestJS) - REST API with JWT authentication
2. **Unified Telegram Bot** (grammY) - Single bot with role-based access
3. **Admin Web Dashboard** (Next.js 15.5+) - Internal admin interface
4. **Queue System** (BullMQ) - Background job processing
5. **Database** (PostgreSQL 16+) - Primary data store with JSONB
6. **Cache/Queue** (Redis 7+) - Session storage and job queues

### Technology Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Backend Framework** | NestJS | Latest | REST API, modular architecture |
| **ORM** | Prisma | Latest | Type-safe database access |
| **Bot Framework** | grammY | Latest | Telegram bot (preferred over Telegraf) |
| **Frontend** | Next.js | 15.5+ | Admin dashboard with App Router |
| **UI Library** | shadcn/ui | Latest | Component library |
| **Styling** | Tailwind CSS | v4 | Utility-first CSS |
| **Database** | PostgreSQL | 16+ | Primary data store |
| **Cache/Queue** | Redis | 7+ | Sessions and job queues |
| **Queue System** | BullMQ | Latest | Background job processing |
| **Logging** | Pino | Latest | Structured logging |
| **Error Tracking** | Sentry | Latest | Error monitoring |
| **Deployment** | Docker + Docker Compose | Latest | Containerization |

---

## 📁 Monorepo Structure

```
BlihOps-Talent-Platform/
├── packages/
│   ├── core/              # ✅ IMPLEMENTED - Infrastructure (logger, exceptions, config, events)
│   ├── shared/            # ✅ IMPLEMENTED - Business domain (types, constants, schemas)
│   ├── api-backend/       # 🟡 PARTIAL - NestJS REST API (auth ✅, talent ✅, jobs ❌, matching ❌)
│   ├── telegram-bot/      # ❌ NOT STARTED - Unified Telegram bot
│   ├── admin-web/         # ❌ NOT STARTED - Next.js admin dashboard
│   └── tooling/           # ✅ IMPLEMENTED - ESLint, Prettier, TypeScript configs
├── infrastructure/        # ✅ IMPLEMENTED - Docker Compose configs
├── docs/                  # ✅ COMPREHENSIVE - Architecture, API, deployment docs
├── scripts/               # ✅ IMPLEMENTED - Utility scripts
└── tests/                 # ❌ NOT STARTED - E2E and integration tests
```

---

## 📦 Package Details

### 1. `packages/core/` ✅ COMPLETE

**Status**: Fully implemented  
**Purpose**: Infrastructure and cross-cutting concerns

**Contents**:
- ✅ Logger service (Pino wrapper)
- ✅ Exception classes (Base, HTTP exceptions)
- ✅ Configuration module (Zod validation)
- ✅ Event system (EventEmitter2 wrapper)

**Location**: `packages/core/src/`
- `logger/` - Structured logging
- `exceptions/` - Custom exceptions
- `config/` - Configuration validation
- `events/` - Event bus

**Dependencies**: None (base package)

---

### 2. `packages/shared/` ✅ COMPLETE

**Status**: Fully implemented  
**Purpose**: Business domain shared code

**Contents**:
- ✅ Type definitions (Talent, Job, Admin, Application)
- ✅ Domain constants (enums: ServiceCategory, ExperienceLevel, etc.)
- ✅ Validation schemas (Zod)
- ✅ Business utilities (matching helpers, formatters)

**Location**: `packages/shared/src/`
- `types/` - TypeScript interfaces
- `constants/` - Domain enums and constants
- `schemas/` - Zod validation schemas
- `utils/` - Business logic utilities

**Dependencies**: None (pure TypeScript)

---

### 3. `packages/api-backend/` 🟡 PARTIAL

**Status**: Partially implemented  
**Purpose**: NestJS REST API with modular architecture

#### ✅ Implemented Modules

**Auth Module** (`modules/auth/`):
- ✅ JWT authentication
- ✅ Login endpoint
- ✅ Token generation
- ✅ Auth guards
- ✅ DTOs (LoginDto, AuthResponseDto)

**Talent Module** (`modules/talent/`):
- ✅ Talent service (CRUD operations)
- ✅ Talent controller (endpoints)
- ✅ DTOs (CreateTalentDto, UpdateTalentDto, TalentQueryDto)
- ✅ Approval workflow logic (partially)

#### ❌ Not Implemented Modules

**Jobs Module** (`modules/jobs/`):
- ❌ Job service
- ❌ Job controller
- ❌ Job DTOs
- ❌ Status workflow

**Matching Module** (`modules/matching/`):
- ❌ Matching service
- ❌ Matching algorithm
- ❌ Matching controller
- ❌ Redis caching

**Notifications Module** (`modules/notifications/`):
- ❌ Notification service
- ❌ Event handlers
- ❌ Notification templates

**Telegram Module** (`modules/telegram/`):
- ❌ Webhook handler
- ❌ Webhook validation
- ❌ Event processing

**Admin Module** (`modules/admin/`):
- ❌ Admin service
- ❌ Admin controller
- ❌ Analytics endpoints

**Queue System**:
- ❌ BullMQ setup
- ❌ Workers (Publish Talent, Publish Job, Notify Talent)
- ❌ Queue configuration

**File Upload**:
- ❌ File upload endpoint
- ❌ File storage integration
- ❌ CV handling

**Current Structure**:
```
packages/api-backend/src/
├── modules/
│   ├── auth/          # ✅ Complete
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   └── dto/
│   ├── talent/       # ✅ Complete
│   │   ├── talent.controller.ts
│   │   ├── talent.service.ts
│   │   ├── talent.module.ts
│   │   └── dto/
│   ├── jobs/          # ❌ Not started
│   ├── matching/      # ❌ Not started
│   ├── notifications/ # ❌ Not started
│   ├── telegram/      # ❌ Not started
│   └── admin/         # ❌ Not started
├── app.module.ts      # ✅ Main module
├── main.ts            # ✅ Entry point
└── ...
```

**Dependencies**: `@blihops/core`, `@blihops/shared`

---

### 4. `packages/telegram-bot/` ❌ NOT STARTED

**Status**: Not implemented (structure only)  
**Purpose**: Unified Telegram bot with role-based access

**Planned Structure**:
```
packages/telegram-bot/src/
├── handlers/          # Command handlers
├── scenes/            # grammY scenes (onboarding, job creation)
├── middleware/        # Rate limiting, RBAC
├── services/          # Business logic
├── keyboards/         # Inline keyboards
└── index.ts           # Bot entry point
```

**Features to Implement**:
- Talent onboarding flow (conversational)
- Admin job creation flow
- Role-based command access
- Redis session management
- Rate limiting
- CV upload handling

**Dependencies**: `@blihops/core`, `@blihops/shared`, API backend

---

### 5. `packages/admin-web/` ❌ NOT STARTED

**Status**: Not implemented (structure only)  
**Purpose**: Next.js 15.5+ admin dashboard

**Planned Structure**:
```
packages/admin-web/src/
├── app/
│   ├── (auth)/        # Login page
│   ├── (protected)/   # Protected routes
│   │   ├── talents/   # Talent management
│   │   ├── jobs/      # Job management
│   │   ├── matching/  # Matching insights
│   │   └── settings/  # Admin settings
│   └── layout.tsx
├── components/
│   ├── ui/            # shadcn/ui components
│   ├── talent/        # Talent components
│   └── job/           # Job components
└── lib/               # Utilities, API client
```

**Features to Implement**:
- Auth.js v5 authentication
- Talent management (list, filter, approve, reject)
- Job management (create, edit, publish, archive)
- Matching dashboard
- Analytics and reporting

**Dependencies**: `@blihops/core`, `@blihops/shared`, API backend

---

## 🗄️ Database Schema

### Current Status: ❌ Not Implemented

**Planned Entities**:

1. **Talent**
   - UUID primary key
   - Telegram ID (unique, indexed)
   - Profile data (name, skills, experience, etc.)
   - Status (Pending, Approved, Rejected, Hired, Inactive)
   - JSONB metadata field
   - GIN indexes on skills array

2. **Job**
   - UUID primary key
   - Created by (Admin FK)
   - Job details (title, description, requirements)
   - Status (Pending, Published, Rejected, Closed/Expired)
   - JSONB metadata field
   - GIN indexes on required_skills array

3. **Application**
   - UUID primary key
   - Job ID (FK)
   - Talent ID (FK)
   - Status (New, Shortlisted, Hired, Rejected)
   - Match score (0-100)
   - Match breakdown (JSONB)

4. **Admin**
   - UUID primary key
   - Email (unique, indexed)
   - Password hash
   - Role
   - Telegram IDs array
   - JSONB preferences

5. **AuditLog**
   - UUID primary key
   - User ID (Admin FK)
   - Action type
   - Resource type and ID
   - JSONB metadata
   - Timestamp (indexed)

**ORM Choice**: Prisma (Decision 001)

---

## 🔄 Key Workflows

### 1. Talent Onboarding Flow (Telegram Bot)

**Status**: ❌ Not Implemented

**Flow**:
1. User sends `/start` to bot
2. Bot checks role (talent)
3. Bot guides through onboarding:
   - Welcome & Consent
   - Personal Info
   - Service Category
   - Skills & Experience
   - CV Upload (optional)
   - Review & Submit
4. Bot calls API: `POST /api/v1/talents`
5. API creates talent profile (status: Pending)
6. Admin approves via web dashboard
7. Worker publishes to Telegram channel

---

### 2. Job Creation Flow (Telegram Bot - Admin)

**Status**: ❌ Not Implemented

**Flow**:
1. Admin sends `/create_job` to bot
2. Bot verifies admin role
3. Bot guides through job creation:
   - Service Category
   - Job Details (title, description)
   - Skills & Requirements
   - Engagement Type & Duration
   - Review & Submit
4. Bot calls API: `POST /api/v1/jobs`
5. API creates job (status: Pending)
6. Admin approves via web dashboard
7. Worker publishes to Telegram channel
8. Matching algorithm runs
9. Talents are notified

---

### 3. Admin Approval Workflow (Web Dashboard)

**Status**: ❌ Not Implemented

**Flow**:
1. Admin logs into web dashboard
2. Views pending talents/jobs
3. Reviews profile details
4. Approves or rejects
5. API updates status
6. Event emitted → Worker processes
7. Published to Telegram channel (if approved)

---

### 4. Matching Algorithm

**Status**: ❌ Not Implemented

**Approach**: On-the-fly matching (computed on-demand, cached in Redis)

**Algorithm**:
- Service Category match (30% weight)
- Skill overlap (40% weight)
- Experience level (20% weight)
- Availability (10% weight)

**Caching**: Redis with 5-minute TTL

---

## 🔐 Authentication & Authorization

### API Backend (JWT)

**Status**: ✅ Implemented

- JWT token generation
- Login endpoint: `POST /api/v1/auth/login`
- Auth guards for protected routes
- Role-based access control (RBAC)

### Admin Web (Auth.js v5)

**Status**: ❌ Not Implemented

- Planned: Auth.js v5 with PostgreSQL adapter
- Session management
- Protected routes middleware

### Telegram Bot (Role-Based)

**Status**: ❌ Not Implemented

- Planned: Role detection via Telegram user ID
- Admin verification
- Command access control

---

## 📡 API Endpoints

### ✅ Implemented

**Authentication**:
- `POST /api/v1/auth/login` ✅

**Talents**:
- `GET /api/v1/talents` ✅
- `GET /api/v1/talents/:id` ✅
- `POST /api/v1/talents` ✅
- `PATCH /api/v1/talents/:id` ✅
- `POST /api/v1/talents/:id/approve` ✅ (partial)
- `POST /api/v1/talents/:id/reject` ✅ (partial)

### ❌ Not Implemented

**Jobs**:
- `GET /api/v1/jobs`
- `GET /api/v1/jobs/:id`
- `POST /api/v1/jobs`
- `PATCH /api/v1/jobs/:id`
- `POST /api/v1/jobs/:id/publish`
- `POST /api/v1/jobs/:id/archive`
- `GET /api/v1/jobs/:id/applicants`
- `POST /api/v1/jobs/:id/applicants/:applicantId/shortlist`
- `POST /api/v1/jobs/:id/applicants/:applicantId/hire`
- `POST /api/v1/jobs/:id/applicants/:applicantId/reject`

**Matching**:
- `GET /api/v1/matching/jobs/:jobId/talents`
- `GET /api/v1/matching/talents/:talentId/jobs`

**Admin**:
- `GET /api/v1/admin/stats`
- `GET /api/v1/admin/analytics`
- `POST /api/v1/admin/bulk-approve`

**Telegram**:
- `POST /api/v1/telegram/webhook`

**Files**:
- `POST /api/v1/files/upload`
- `GET /api/v1/files/:id`

---

## 🚀 Deployment Architecture

### Current Status: ✅ Docker Compose Configured

**Development**:
- `docker-compose.dev.yml` ✅
- PostgreSQL container
- Redis container
- Services can be added

**Staging**:
- `docker-compose.staging.yml` ✅

**Production**:
- `docker-compose.yml` ✅
- Production-ready configuration

**VPS Deployment**:
- Planned: Linux VPS with Docker
- Services: API, Bot, Web, Workers, PostgreSQL, Redis

---

## 📊 Current Implementation Status

### Phase 1: Foundation ✅ COMPLETE
- ✅ Monorepo setup
- ✅ Core package
- ✅ Shared package
- ✅ Docker infrastructure
- ✅ Development tooling

### Phase 2: Backend API 🟡 IN PROGRESS
- ✅ Auth module
- ✅ Talent module
- ❌ Jobs module
- ❌ Matching module
- ❌ Queue system
- ❌ File upload
- ❌ Admin module
- ❌ Telegram webhooks

### Phase 3: Telegram Bot ❌ NOT STARTED
- ❌ Bot foundation
- ❌ Talent onboarding flow
- ❌ Admin job creation flow

### Phase 4: Admin Dashboard ❌ NOT STARTED
- ❌ Next.js setup
- ❌ Authentication
- ❌ Talent management pages
- ❌ Job management pages
- ❌ Matching dashboard

### Phase 5: Integration & Testing ❌ NOT STARTED
- ❌ E2E testing
- ❌ Performance testing
- ❌ Security testing

### Phase 6: Deployment ❌ NOT STARTED
- ❌ Production infrastructure
- ❌ Production deployment
- ❌ Monitoring setup

---

## 🔗 Key Dependencies

### Package Dependencies

```
api-backend
  ├── @blihops/core
  ├── @blihops/shared
  ├── @nestjs/core
  ├── @nestjs/prisma (planned)
  ├── @nestjs/jwt
  └── bullmq (planned)

telegram-bot
  ├── @blihops/core
  ├── @blihops/shared
  ├── grammy
  └── api-backend (API client)

admin-web
  ├── @blihops/core
  ├── @blihops/shared
  ├── next
  ├── react
  ├── @auth/core (Auth.js v5)
  └── api-backend (API client)
```

### External Dependencies

- **PostgreSQL 16+** - Database
- **Redis 7+** - Cache and queues
- **Telegram Bot API** - Bot functionality
- **Sentry** (optional) - Error tracking

---

## 📝 Documentation Status

### ✅ Comprehensive Documentation

- ✅ Architecture documentation (`docs/architecture.md`)
- ✅ Architecture quick reference (`docs/architecture-quick-reference.md`)
- ✅ API documentation (`docs/api/`)
- ✅ OpenAPI specification (`docs/api/openapi.yaml`)
- ✅ Project task breakdown (`PROJECT_TASK_BREAKDOWN.md`)
- ✅ Deployment guide (`docs/deployment.md`)
- ✅ Decision records (`docs/decisions/`)
- ✅ Matching algorithm spec (`docs/matching-algorithm-specification.md`)

---

## 🎯 Next Steps (Priority Order)

1. **Database Implementation** (Week 5)
   - Set up Prisma
   - Create all entities
   - Run migrations
   - Seed data

2. **Jobs Module** (Week 6-7)
   - Job service and controller
   - Job DTOs
   - Status workflow

3. **Matching Module** (Week 7-8)
   - Matching algorithm
   - Redis caching
   - Matching endpoints

4. **Queue System** (Week 8-9)
   - BullMQ setup
   - Workers implementation
   - Queue monitoring

5. **Telegram Bot** (Week 11-14)
   - Bot foundation
   - Talent onboarding flow
   - Admin job creation flow

6. **Admin Dashboard** (Week 11-13)
   - Next.js setup
   - Authentication
   - Talent and job management pages

---

## 🚨 Known Issues & Gaps

1. **Database**: No Prisma schema or migrations yet
2. **Jobs Module**: Not implemented
3. **Matching Module**: Not implemented
4. **Queue System**: Not implemented
5. **Telegram Bot**: Not started
6. **Admin Dashboard**: Not started
7. **Testing**: No tests written yet
8. **File Storage**: Strategy decided but not implemented

---

## 📚 Key Files to Review

### Architecture & Planning
- `README.md` - Project overview
- `PROJECT_TASK_BREAKDOWN.md` - Detailed task breakdown
- `PARALLEL_TASKS_BREAKDOWN.md` - Parallel work organization
- `docs/architecture.md` - Comprehensive architecture

### Implementation
- `packages/core/src/` - Core infrastructure
- `packages/shared/src/` - Shared types and utilities
- `packages/api-backend/src/modules/` - API modules
- `docker-compose.yml` - Deployment configuration

### Documentation
- `docs/api/openapi.yaml` - API specification
- `docs/decisions/` - Architecture decisions
- `docs/matching-algorithm-specification.md` - Matching algorithm

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-XX  
**Maintained By**: Development Team



