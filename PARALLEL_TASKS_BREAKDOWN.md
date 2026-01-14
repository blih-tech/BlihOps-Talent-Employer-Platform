# BlihOps Talent & Employer Platform - Parallel Tasks Breakdown

**Purpose**: This document organizes all tasks and subtasks by developer role to enable maximum parallel work and faster development.

**Last Updated**: 2025-01-XX  
**Project Status**: Active Development  
**Total Timeline**: 16-22 weeks (with buffers)

---

## 📊 Executive Summary

This document breaks down the entire project into **parallel work streams** that can be assigned to different developers simultaneously. Each stream is designed to be independent with minimal blocking dependencies.

### Key Principles
1. **Maximize Parallelism**: Tasks are organized to minimize dependencies
2. **Clear Ownership**: Each task has a designated developer role
3. **Independent Work**: Developers can work simultaneously without blocking each other
4. **Clear Dependencies**: All dependencies are explicitly documented

---

## 👥 Developer Roles & Responsibilities

| Role | Primary Focus | Secondary Focus |
|------|--------------|-----------------|
| **Backend Lead** | API architecture, database design, core infrastructure | Code reviews, technical decisions |
| **Backend Dev 1** | API modules (Talent, Jobs, Matching) | Queue workers, file handling |
| **Backend Dev 2** | API modules (Admin, Telegram webhooks) | Testing, documentation |
| **Bot Specialist** | Telegram bot implementation | Bot testing, user flows |
| **Frontend Dev** | Admin web dashboard | UI/UX, component library |
| **DevOps** | Infrastructure, CI/CD, deployment | Monitoring, security |
| **QA** | Testing, quality assurance | Test automation, bug tracking |

---

## 🚀 PARALLEL WORK STREAMS

### STREAM 1: Foundation & Infrastructure (Week 1-4)
**Can work in parallel**: ✅ All tasks can run simultaneously

#### Developer: DevOps + Backend Lead
**Task 1.1: Monorepo & Docker Setup** (3-5 days)
- [x] Initialize pnpm workspace
- [x] Set up Docker Compose (PostgreSQL, Redis)
- [x] Configure environment templates
- [x] Set up CI/CD pipeline
- [ ] Configure staging environment

**Parallel with**: All other Stream 1 tasks

#### Developer: Backend Lead
**Task 1.2: Core Package** (1 week)
- [x] Logger implementation (Pino)
- [x] Exception classes
- [x] Configuration module (Zod validation)
- [x] Event system (EventEmitter2)

**Parallel with**: Task 1.3, 1.4

#### Developer: Backend Dev 1
**Task 1.3: Shared Package** (1 week)
- [x] Type definitions (Talent, Job, Admin)
- [x] Domain constants (enums)
- [x] Validation schemas (Zod)
- [x] Business utilities (matching helpers)

**Parallel with**: Task 1.2, 1.4

#### Developer: Backend Lead + Backend Dev 1
**Task 1.4: Database Schema Design** (1 week)
- [ ] Entity design (Talent, Job, Admin, AuditLog, Application)
- [ ] Index strategy (GIN indexes, partial indexes)
- [ ] Migration setup (Prisma migrations)
- [ ] Seed data scripts

**Dependencies**: Task 1.3 (for types)  
**Parallel with**: Task 1.2, 1.3

---

### STREAM 2: Backend API Development (Week 5-10)
**Can work in parallel**: ✅ Multiple developers can work on different modules

#### Developer: Backend Dev 1
**Task 2.1: Database Implementation** (1 week)
- [ ] Prisma setup and configuration
- [ ] Implement all entities (Talent, Job, Admin, AuditLog, Application)
- [ ] Repository pattern implementation
- [ ] Initial migrations
- [ ] Migration testing

**Dependencies**: Task 1.4 (schema design)  
**Parallel with**: Task 2.2 (after 2.1.1 complete)

#### Developer: Backend Lead
**Task 2.2: NestJS Core Setup** (1 week)
- [ ] NestJS project initialization
- [ ] Database connection (Prisma module)
- [ ] Core modules (Config, Logger, Exception filters)
- [ ] Health check endpoints

**Dependencies**: Task 1.2 (core package), Task 2.1.1 (Prisma setup)  
**Parallel with**: None initially, then parallel with 2.3, 2.4

#### Developer: Backend Dev 2
**Task 2.3: Authentication Module** (3-4 days)
- [ ] JWT implementation (strategy, guards)
- [ ] Token generation and validation
- [ ] Refresh token mechanism
- [ ] Auth endpoints (login, refresh, logout)
- [ ] Role-based guards (RBAC)

**Dependencies**: Task 2.2.1 (NestJS setup)  
**Parallel with**: Task 2.4 (after 2.2.1 complete)

#### Developer: Backend Dev 1
**Task 2.4: Talent Module** (1 week)
- [ ] Talent service (CRUD operations)
- [ ] Talent controller (all endpoints)
- [ ] Talent DTOs (Create, Update, Filter)
- [ ] Approval workflow logic
- [ ] Unit tests

**Dependencies**: Task 2.2.1, Task 2.1 (entities)  
**Parallel with**: Task 2.5, Task 2.6

#### Developer: Backend Dev 2
**Task 2.5: Jobs Module** (1 week)
- [ ] Job service (CRUD operations)
- [ ] Job controller (all endpoints)
- [ ] Job DTOs (Create, Update, Filter, Status)
- [ ] Status workflow (Pending → Published → Closed)
- [ ] Status transition validation
- [ ] Unit tests

**Dependencies**: Task 2.2.1, Task 2.1 (entities)  
**Parallel with**: Task 2.4, Task 2.6

#### Developer: Backend Dev 1
**Task 2.6: Application Management** (3-4 days)
- [ ] Application service (track applications)
- [ ] Application controller (applicant endpoints)
- [ ] Application DTOs
- [ ] Application status management
- [ ] Match score calculation per application
- [ ] Application notifications

**Dependencies**: Task 2.4.1, Task 2.5.1 (Talent and Job services)  
**Parallel with**: Task 2.7

#### Developer: Backend Dev 2
**Task 2.7: Matching Module** (1 week)
- [ ] Matching service (on-the-fly algorithm)
- [ ] Matching controller (endpoints)
- [ ] Score calculation logic
- [ ] Redis caching implementation
- [ ] Matching utilities (skill overlap, etc.)
- [ ] Unit tests

**Dependencies**: Task 2.2.1, Task 2.4.1, Task 2.5.1  
**Parallel with**: Task 2.6

#### Developer: Backend Dev 1
**Task 2.8: Queue System & Workers** (1 week)
- [ ] BullMQ setup (Redis connection)
- [ ] Queue configuration
- [ ] Publish Talent Worker
- [ ] Publish Job Worker
- [ ] Notify Talent Worker
- [ ] Worker tests

**Dependencies**: Task 2.2.1, Task 2.4.1, Task 2.5.1  
**Parallel with**: Task 2.9

#### Developer: Backend Dev 2
**Task 2.9: File Upload & Management** (3-4 days)
- [ ] File upload endpoint
- [ ] File storage integration (Docker volumes)
- [ ] CV handling (upload, download, update)
- [ ] File cleanup (TTL, scheduled job)

**Dependencies**: Task 2.2.1, Decision 1.0.2 (file storage)  
**Parallel with**: Task 2.8

#### Developer: Backend Dev 2
**Task 2.10: Admin & Telegram Webhook Modules** (3-4 days)
- [ ] Admin service (statistics, analytics)
- [ ] Admin controller (endpoints)
- [ ] Telegram webhook handler
- [ ] Webhook processing and validation
- [ ] API versioning strategy
- [ ] Swagger/OpenAPI documentation

**Dependencies**: Task 2.2.1, Task 2.3, Task 2.4, Task 2.5  
**Parallel with**: None (depends on other modules)

---

### STREAM 3: Telegram Bot Development (Week 11-14)
**Can work in parallel**: ✅ Can start after Stream 2.2, 2.3, 2.4, 2.5 complete

#### Developer: Bot Specialist
**Task 3.1: Bot Foundation** (3-4 days)
- [ ] grammY bot setup
- [ ] Bot configuration (webhook/polling)
- [ ] API client setup
- [ ] Redis session store
- [ ] Rate limiting middleware
- [ ] RBAC middleware

**Dependencies**: Task 2.2.1 (API ready), Task 2.3 (auth)  
**Parallel with**: None initially

#### Developer: Bot Specialist
**Task 3.2: Talent Onboarding Flow** (1.5 weeks)
- [ ] Onboarding scene setup
- [ ] Welcome & Consent step
- [ ] Personal info step
- [ ] Service category step
- [ ] Skills & Experience step
- [ ] CV upload step
- [ ] Review & Submit step
- [ ] Talent commands (/start, /profile, /upload_cv, /help, /cancel)

**Dependencies**: Task 3.1, Task 2.4 (Talent API)  
**Parallel with**: Task 3.3 (after 3.1 complete)

#### Developer: Bot Specialist
**Task 3.3: Admin Job Creation Flow** (1.5 weeks)
- [ ] Job creation scene setup
- [ ] Service category step
- [ ] Job details step
- [ ] Skills & Requirements step
- [ ] Engagement & Duration step
- [ ] Review & Submit step
- [ ] Admin commands (/create_job, /my_jobs, /edit_job, /close_job)

**Dependencies**: Task 3.1, Task 3.1.2.3 (RBAC), Task 2.5 (Jobs API)  
**Parallel with**: Task 3.2 (after 3.1 complete)

#### Developer: Bot Specialist + QA
**Task 3.4: Bot Testing & Refinement** (3-4 days)
- [ ] Unit tests (handlers, scenes, services)
- [ ] Integration tests (E2E flows)
- [ ] User acceptance testing
- [ ] Error scenario testing

**Dependencies**: Task 3.2, Task 3.3  
**Parallel with**: None

---

### STREAM 4: Admin Dashboard Development (Week 11-13)
**Can work in parallel**: ✅ Can start after Stream 2.2, 2.3 complete (with mock APIs initially)

#### Developer: Frontend Dev
**Task 4.1: Next.js Project Setup** (2-3 days)
- [ ] Next.js 15.5+ initialization
- [ ] TypeScript configuration
- [ ] Tailwind CSS v4 setup
- [ ] shadcn/ui setup
- [ ] Base UI components
- [ ] Layout components
- [ ] Mock API setup (for early development)

**Dependencies**: Task 1.2, Task 1.3 (core, shared packages)  
**Parallel with**: Task 4.2 (after 4.1.1 complete)

#### Developer: Frontend Dev
**Task 4.2: Authentication Implementation** (3-4 days)
- [ ] Auth.js v5 setup
- [ ] Database adapter (PostgreSQL)
- [ ] Auth routes (login, logout)
- [ ] Route protection middleware
- [ ] Auth utilities

**Dependencies**: Task 4.1.1, Task 2.3 (auth API)  
**Parallel with**: Task 4.3 (after 4.2.1 complete)

#### Developer: Frontend Dev
**Task 4.3: Talent Management Pages** (1 week)
- [ ] Talent list page (Server Component)
- [ ] Filtering & Search UI
- [ ] Data Table component
- [ ] Approval actions (Server Actions)
- [ ] Talent detail page
- [ ] Edit talent page
- [ ] Matching insights display

**Dependencies**: Task 4.1, Task 4.2, Task 2.4 (Talent API)  
**Parallel with**: Task 4.4

#### Developer: Frontend Dev
**Task 4.4: Job Management Pages** (1 week)
- [ ] Job list page (Server Component)
- [ ] Filtering & Search UI
- [ ] Data Table component
- [ ] Job actions (Server Actions)
- [ ] Job detail page
- [ ] Edit job page
- [ ] Matching preview

**Dependencies**: Task 4.1, Task 4.2, Task 2.5 (Jobs API)  
**Parallel with**: Task 4.3

#### Developer: Frontend Dev
**Task 4.5: Matching Dashboard** (3-4 days)
- [ ] Matching overview page
- [ ] Job-to-Talent matching view
- [ ] Talent-to-Job matching view
- [ ] Score breakdown display

**Dependencies**: Task 4.1, Task 4.2, Task 2.7 (Matching API)  
**Parallel with**: None

---

### STREAM 5: Integration & Testing (Week 15-18)
**Can work in parallel**: ✅ Multiple testing streams

#### Developer: Backend Dev 1 + Bot Specialist
**Task 5.1: Bot-API Integration** (3-4 days)
- [ ] Webhook integration testing
- [ ] API client integration testing
- [ ] Queue integration testing
- [ ] Telegram channel publishing verification

**Dependencies**: Stream 3, Stream 2  
**Parallel with**: Task 5.2

#### Developer: Frontend Dev + Backend Dev 2
**Task 5.2: Admin-API Integration** (3-4 days)
- [ ] Authentication flow testing
- [ ] CRUD operations testing
- [ ] Matching integration testing
- [ ] Real-time updates verification

**Dependencies**: Stream 4, Stream 2  
**Parallel with**: Task 5.1

#### Developer: QA + All Developers
**Task 5.3: Comprehensive Testing** (1.5 weeks)
- [ ] E2E testing (Talent onboarding flow)
- [ ] E2E testing (Job creation flow)
- [ ] E2E testing (Admin dashboard)
- [ ] Performance testing (API, Bot, Dashboard)
- [ ] Security testing (Auth, API, Bot)
- [ ] Load testing (1000+ concurrent users)

**Dependencies**: Task 5.1, Task 5.2  
**Parallel with**: Task 5.4

#### Developer: All Developers
**Task 5.4: Bug Fixes & Refinement** (1 week buffer)
- [ ] Bug triage and prioritization
- [ ] Bug assignment and tracking
- [ ] Fix verification
- [ ] Code refinement

**Dependencies**: Task 5.3  
**Parallel with**: None

---

### STREAM 6: Deployment & Launch (Week 19-22)
**Can work in parallel**: ✅ Infrastructure and deployment prep

#### Developer: DevOps
**Task 6.1: Production Infrastructure** (3-4 days)
- [ ] VPS provisioning and setup
- [ ] Docker installation
- [ ] Network configuration
- [ ] PostgreSQL setup (with backup strategy)
- [ ] Redis setup (with memory management)

**Dependencies**: Stream 5  
**Parallel with**: Task 6.2 (after 6.1.1 complete)

#### Developer: DevOps + Backend Lead
**Task 6.2: Production Deployment** (3-4 days)
- [ ] Docker Compose production file
- [ ] Build and deploy services
- [ ] Environment configuration
- [ ] SSL/TLS setup (if using domain)

**Dependencies**: Task 6.1  
**Parallel with**: Task 6.3 (after 6.2.1 complete)

#### Developer: DevOps + Backend Lead
**Task 6.3: Monitoring & Observability** (2-3 days)
- [ ] Structured logging setup (Pino)
- [ ] Sentry integration
- [ ] BullMQ Board setup
- [ ] Health checks

**Dependencies**: Task 6.2  
**Parallel with**: Task 6.4

#### Developer: Project Manager + Team
**Task 6.4: Launch Preparation** (2-3 days)
- [ ] Documentation review
- [ ] Security audit
- [ ] Backup & recovery testing
- [ ] Soft launch
- [ ] Full launch

**Dependencies**: Task 6.2, Task 6.3  
**Parallel with**: None

---

## 📅 Parallel Work Timeline

### Week 1-4: Foundation (All Parallel)
```
DevOps          → Monorepo, Docker, CI/CD
Backend Lead    → Core package
Backend Dev 1   → Shared package
Backend Lead+1  → Database schema design
```

### Week 5-10: Backend API (Mostly Parallel)
```
Week 5:
Backend Dev 1   → Database implementation
Backend Lead    → NestJS core setup

Week 6:
Backend Dev 2   → Auth module
Backend Dev 1   → Talent module
Backend Dev 2   → Jobs module (after Talent started)

Week 7-8:
Backend Dev 1   → Matching module
Backend Dev 2   → Application management
Backend Dev 1   → Queue system
Backend Dev 2   → File upload

Week 9:
Backend Dev 2   → Admin & Telegram webhooks
```

### Week 11-14: Bot + Dashboard (Parallel)
```
Bot Specialist  → Bot foundation → Talent flow → Job flow
Frontend Dev   → Next.js setup → Auth → Talent pages → Job pages → Matching
```

### Week 15-18: Integration & Testing (Parallel)
```
Backend Dev 1 + Bot Specialist → Bot-API integration
Frontend Dev + Backend Dev 2  → Admin-API integration
QA + All                      → Comprehensive testing
All                           → Bug fixes
```

### Week 19-22: Deployment (Sequential with some parallel)
```
DevOps         → Infrastructure → Deployment → Monitoring
Team           → Launch preparation
```

---

## 🔗 Critical Dependencies Map

### Must Complete First (Blocking)
1. **Task 1.2 (Core Package)** → Blocks: All backend tasks
2. **Task 1.3 (Shared Package)** → Blocks: All backend tasks
3. **Task 1.4 (Database Schema)** → Blocks: Task 2.1
4. **Task 2.1.1 (Prisma Setup)** → Blocks: Task 2.2
5. **Task 2.2.1 (NestJS Setup)** → Blocks: All API modules
6. **Task 2.3 (Auth)** → Blocks: Protected routes, bot auth
7. **Task 2.4 (Talent API)** → Blocks: Bot talent flow, Admin talent pages
8. **Task 2.5 (Jobs API)** → Blocks: Bot job flow, Admin job pages

### Can Work in Parallel After Dependencies Met
- **Task 2.4, 2.5, 2.6, 2.7** → Can work in parallel after 2.2.1
- **Task 2.8, 2.9** → Can work in parallel after 2.4.1, 2.5.1
- **Task 3.2, 3.3** → Can work in parallel after 3.1
- **Task 4.3, 4.4** → Can work in parallel after 4.1, 4.2
- **Task 5.1, 5.2** → Can work in parallel

---

## 📋 Task Assignment Matrix

| Task | Developer | Duration | Dependencies | Can Start After |
|------|-----------|----------|--------------|-----------------|
| 1.1 Monorepo Setup | DevOps | 3-5 days | None | Day 1 |
| 1.2 Core Package | Backend Lead | 1 week | None | Day 1 |
| 1.3 Shared Package | Backend Dev 1 | 1 week | None | Day 1 |
| 1.4 Database Schema | Backend Lead + Dev 1 | 1 week | 1.3 | Day 1 (after 1.3 types) |
| 2.1 Database Implementation | Backend Dev 1 | 1 week | 1.4 | Week 5 |
| 2.2 NestJS Core | Backend Lead | 1 week | 1.2, 2.1.1 | Week 5 |
| 2.3 Auth Module | Backend Dev 2 | 3-4 days | 2.2.1 | Week 6 |
| 2.4 Talent Module | Backend Dev 1 | 1 week | 2.2.1, 2.1 | Week 6 |
| 2.5 Jobs Module | Backend Dev 2 | 1 week | 2.2.1, 2.1 | Week 6 |
| 2.6 Application Management | Backend Dev 1 | 3-4 days | 2.4.1, 2.5.1 | Week 7 |
| 2.7 Matching Module | Backend Dev 2 | 1 week | 2.2.1, 2.4.1, 2.5.1 | Week 7 |
| 2.8 Queue System | Backend Dev 1 | 1 week | 2.2.1, 2.4.1, 2.5.1 | Week 7 |
| 2.9 File Upload | Backend Dev 2 | 3-4 days | 2.2.1 | Week 7 |
| 2.10 Admin & Webhooks | Backend Dev 2 | 3-4 days | 2.2.1, 2.3, 2.4, 2.5 | Week 9 |
| 3.1 Bot Foundation | Bot Specialist | 3-4 days | 2.2.1, 2.3 | Week 11 |
| 3.2 Talent Flow | Bot Specialist | 1.5 weeks | 3.1, 2.4 | Week 11 |
| 3.3 Job Flow | Bot Specialist | 1.5 weeks | 3.1, 2.5 | Week 11 |
| 3.4 Bot Testing | Bot Specialist + QA | 3-4 days | 3.2, 3.3 | Week 13 |
| 4.1 Next.js Setup | Frontend Dev | 2-3 days | 1.2, 1.3 | Week 11 |
| 4.2 Auth Implementation | Frontend Dev | 3-4 days | 4.1.1, 2.3 | Week 11 |
| 4.3 Talent Pages | Frontend Dev | 1 week | 4.1, 4.2, 2.4 | Week 12 |
| 4.4 Job Pages | Frontend Dev | 1 week | 4.1, 4.2, 2.5 | Week 12 |
| 4.5 Matching Dashboard | Frontend Dev | 3-4 days | 4.1, 4.2, 2.7 | Week 13 |
| 5.1 Bot-API Integration | Backend Dev 1 + Bot | 3-4 days | Stream 3, Stream 2 | Week 15 |
| 5.2 Admin-API Integration | Frontend + Backend Dev 2 | 3-4 days | Stream 4, Stream 2 | Week 15 |
| 5.3 Comprehensive Testing | QA + All | 1.5 weeks | 5.1, 5.2 | Week 15 |
| 5.4 Bug Fixes | All Developers | 1 week | 5.3 | Week 17 |
| 6.1 Infrastructure | DevOps | 3-4 days | Stream 5 | Week 19 |
| 6.2 Deployment | DevOps + Backend Lead | 3-4 days | 6.1 | Week 19 |
| 6.3 Monitoring | DevOps + Backend Lead | 2-3 days | 6.2 | Week 20 |
| 6.4 Launch | Project Manager + Team | 2-3 days | 6.2, 6.3 | Week 20 |

---

## 🎯 Quick Reference: What Can Be Done Right Now?

### ✅ Ready to Start (No Dependencies)
- **DevOps**: Task 1.1 (Monorepo & Docker) - Can start immediately
- **Backend Lead**: Task 1.2 (Core Package) - Can start immediately
- **Backend Dev 1**: Task 1.3 (Shared Package) - Can start immediately

### ⏳ Waiting for Dependencies
- **Backend Lead + Dev 1**: Task 1.4 (Database Schema) - Wait for Task 1.3 types
- **All Backend Tasks**: Wait for Task 1.2, 1.3, 1.4
- **Bot Tasks**: Wait for API endpoints (Week 11)
- **Frontend Tasks**: Wait for API endpoints (Week 11)

---

## 📊 Parallel Work Opportunities Summary

| Phase | Parallel Opportunities | Max Developers |
|-------|----------------------|----------------|
| **Phase 1** (Week 1-4) | All tasks parallel | 4 developers |
| **Phase 2** (Week 5-10) | Most modules parallel | 2-3 developers |
| **Phase 3** (Week 11-14) | Bot + Dashboard parallel | 2 developers |
| **Phase 4** (Week 15-18) | Integration + Testing parallel | 4+ developers |
| **Phase 5** (Week 19-22) | Infrastructure + Prep parallel | 2-3 developers |

---

## 🚨 Important Notes

1. **Communication**: Daily standups are critical when working in parallel
2. **API Contracts**: Define API contracts early (OpenAPI spec) to avoid blocking
3. **Mock Data**: Frontend can use mock APIs until real APIs are ready
4. **Code Reviews**: All PRs require review before merge
5. **Testing**: Write tests as you develop, not at the end
6. **Documentation**: Keep docs updated as you code

---

## 📝 Task Status Tracking

Use this section to track progress:

### Stream 1: Foundation
- [x] Task 1.1: Monorepo & Docker Setup
- [x] Task 1.2: Core Package
- [x] Task 1.3: Shared Package
- [ ] Task 1.4: Database Schema Design

### Stream 2: Backend API
- [ ] Task 2.1: Database Implementation
- [ ] Task 2.2: NestJS Core Setup
- [ ] Task 2.3: Authentication Module
- [ ] Task 2.4: Talent Module
- [ ] Task 2.5: Jobs Module
- [ ] Task 2.6: Application Management
- [ ] Task 2.7: Matching Module
- [ ] Task 2.8: Queue System & Workers
- [ ] Task 2.9: File Upload & Management
- [ ] Task 2.10: Admin & Telegram Webhooks

### Stream 3: Telegram Bot
- [ ] Task 3.1: Bot Foundation
- [ ] Task 3.2: Talent Onboarding Flow
- [ ] Task 3.3: Admin Job Creation Flow
- [ ] Task 3.4: Bot Testing & Refinement

### Stream 4: Admin Dashboard
- [ ] Task 4.1: Next.js Project Setup
- [ ] Task 4.2: Authentication Implementation
- [ ] Task 4.3: Talent Management Pages
- [ ] Task 4.4: Job Management Pages
- [ ] Task 4.5: Matching Dashboard

### Stream 5: Integration & Testing
- [ ] Task 5.1: Bot-API Integration
- [ ] Task 5.2: Admin-API Integration
- [ ] Task 5.3: Comprehensive Testing
- [ ] Task 5.4: Bug Fixes & Refinement

### Stream 6: Deployment & Launch
- [ ] Task 6.1: Production Infrastructure
- [ ] Task 6.2: Production Deployment
- [ ] Task 6.3: Monitoring & Observability
- [ ] Task 6.4: Launch Preparation

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-XX  
**Next Review**: Weekly during active development

