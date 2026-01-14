# BlihOps Talent & Employer Platform - Project Task Breakdown

**Project Manager View** - Comprehensive task breakdown with dependencies and parallel work opportunities.

**Last Updated**: 2025-01-XX  
**Project Status**: Planning Phase  
**Estimated Timeline**: 12-16 weeks (MVP)

---

## 📊 Project Overview

| Phase | Duration | Status | Dependencies | Buffer |
|-------|----------|--------|--------------|--------|
| Phase 1: Foundation & Core Infrastructure | 3-4 weeks | 🔴 Not Started | None | - |
| **Buffer 1** | **1 week** | 🔴 Not Started | Phase 1 | - |
| Phase 2: Backend API & Database | 3-4 weeks | 🔴 Not Started | Phase 1 + Buffer 1 | - |
| **Buffer 2** | **1 week** | 🔴 Not Started | Phase 2 | - |
| Phase 3: Telegram Bot Development | 3-4 weeks | 🔴 Not Started | Phase 2 + Buffer 2 | - |
| Phase 4: Admin Dashboard | 2-3 weeks | 🔴 Not Started | Phase 2 + Buffer 2 | - |
| **Buffer 3** | **1 week** | 🔴 Not Started | Phase 3, 4 | - |
| Phase 5: Integration & Testing | 3-4 weeks | 🔴 Not Started | Phase 3, 4 + Buffer 3 | - |
| **Buffer 4** | **1 week** | 🔴 Not Started | Phase 5 | - |
| Phase 6: Deployment & Launch | 1-2 weeks | 🔴 Not Started | Phase 5 + Buffer 4 | - |
| **Total Timeline** | **16-22 weeks** | | | |

---

## 🎯 PHASE 1: Foundation & Core Infrastructure

**Duration**: 3-4 weeks  
**Dependencies**: None (can start immediately)  
**Parallel Work**: ✅ High opportunity  
**Buffer**: 1 week after completion

### Project 1.0: Critical Technical Decisions
**Owner**: Tech Lead + Backend Lead  
**Priority**: Critical  
**Duration**: 2-3 days  
**Dependencies**: None

#### Task 1.0.1: ORM Selection
- [x] **Subtask 1.0.1.1**: Evaluate TypeORM vs Prisma
  - Feature comparison
  - Performance benchmarks
  - Team expertise assessment
  - Migration capabilities
- [x] **Subtask 1.0.1.2**: Make decision and document
  - Decision document with rationale
  - Update architecture docs
  - Create proof-of-concept

**Dependencies**: None  
**Parallel with**: 1.0.2, 1.0.3

#### Task 1.0.2: File Storage Strategy
- [x] **Subtask 1.0.2.1**: Evaluate storage options
  - Local Docker volumes
  - S3-compatible storage (MinIO, AWS S3)
  - CDN integration
  - Cost analysis
- [x] **Subtask 1.0.2.2**: Define file handling strategy
  - CV upload limits (size, format)
  - File validation rules
  - TTL/cleanup strategy
  - Backup strategy
- [x] **Subtask 1.0.2.3**: Document decision
  - Storage architecture diagram
  - Implementation plan

**Dependencies**: None  
**Parallel with**: 1.0.1, 1.0.3

#### Task 1.0.3: Notification Strategy
- [x] **Subtask 1.0.3.1**: Define notification channels
  - Telegram (primary)
  - Email fallback (if needed)
  - SMS (future consideration)
- [x] **Subtask 1.0.3.2**: Notification templates
  - Talent approval notification
  - Job match notification
  - Job published notification
- [x] **Subtask 1.0.3.3**: Rate limiting strategy
  - Per-user limits (e.g., 10 messages/hour)
  - Per-endpoint limits (e.g., 100 requests/minute)
  - Per-IP limits (if applicable)
  - Actual limit values documented

**Dependencies**: None  
**Parallel with**: 1.0.1, 1.0.2

#### Task 1.0.4: Matching Algorithm Prototype
- [x] **Subtask 1.0.4.1**: Algorithm design
  - Scoring formula definition
  - Weight factors
  - Cache invalidation strategy
- [x] **Subtask 1.0.4.2**: Proof of concept
  - Basic matching logic
  - Performance testing
  - Cache hit/miss scenarios
- [ ] **Subtask 1.0.4.3**: Document algorithm
  - Algorithm specification
  - Performance benchmarks
  - Scalability considerations

**Dependencies**: None  
**Parallel with**: 1.0.1, 1.0.2, 1.0.3

---

### Project 1.1: Monorepo Setup & Configuration
**Owner**: DevOps/Backend Lead  
**Priority**: Critical  
**Duration**: 3-5 days  
**Dependencies**: 1.0.1 (ORM decision)

#### Task 1.1.1: Initialize Monorepo Structure
- [x] **Subtask 1.1.1.1**: Set up pnpm workspace configuration
  - Create `pnpm-workspace.yaml`
  - Configure workspace packages
  - Set up root `package.json`
- [x] **Subtask 1.1.1.2**: Initialize Git repository
  - Create `.gitignore`
  - Set up branch protection rules
  - Configure commit hooks
- [x] **Subtask 1.1.1.3**: Set up TypeScript configuration
  - Root `tsconfig.json`
  - Shared TypeScript base config
  - Package-specific configs

**Dependencies**: None  
**Parallel with**: 1.1.2, 1.1.3

#### Task 1.1.2: Development Tooling Setup
- [x] **Subtask 1.1.2.1**: ESLint configuration
  - Shared ESLint config package
  - Configure rules for TypeScript, NestJS, Next.js
  - Set up pre-commit hooks
- [x] **Subtask 1.1.2.2**: Prettier configuration
  - Shared Prettier config
  - Format on save setup
- [x] **Subtask 1.1.2.3**: Commitlint configuration
  - Conventional commits setup
  - Commit message validation

**Dependencies**: 1.1.1.1  
**Parallel with**: 1.1.1, 1.1.3

#### Task 1.1.3: Docker & Infrastructure Setup
- [x] **Subtask 1.1.3.1**: Docker Compose configuration
  - PostgreSQL 16+ service
  - Redis 7+ service
  - Development environment setup
  - File storage volumes (based on 1.0.2 decision)
- [x] **Subtask 1.1.3.2**: Dockerfile templates
  - API backend Dockerfile
  - Telegram bot Dockerfile
  - Admin web Dockerfile
- [x] **Subtask 1.1.3.3**: Environment configuration
  - `.env.example` templates
  - Environment validation
  - Secrets management strategy
- [x] **Subtask 1.1.3.4**: Staging environment setup
  - Staging Docker Compose
  - Staging database
  - Staging Redis

**Dependencies**: 1.0.2 (file storage decision)  
**Parallel with**: 1.1.1, 1.1.2

#### Task 1.1.4: CI/CD Pipeline Setup
- [ ] **Subtask 1.1.4.1**: Choose CI/CD platform
  - GitHub Actions / GitLab CI / Jenkins
  - Decision and setup
- [ ] **Subtask 1.1.4.2**: Automated testing pipeline
  - Unit test execution
  - Linting and formatting checks
  - Type checking
- [ ] **Subtask 1.1.4.3**: Build pipeline
  - Package builds
  - Docker image builds
  - Artifact storage
- [ ] **Subtask 1.1.4.4**: Deployment pipeline
  - Staging auto-deploy
  - Production manual approval
  - Rollback strategy

**Dependencies**: 1.1.1  
**Parallel with**: 1.1.2, 1.1.3

---

### Project 1.2: Core Package Development
**Owner**: Backend Lead  
**Priority**: Critical  
**Duration**: 1-2 weeks  
**Dependencies**: 1.1.1

#### Task 1.2.1: Core Package (`packages/core/`)
- [x] **Subtask 1.2.1.1**: Logger implementation
  - Pino logger wrapper
  - Structured logging format
  - Log levels configuration
  - File/console transports
- [x] **Subtask 1.2.1.2**: Exception classes
  - Base exception class
  - Domain-specific exceptions
  - Error handling utilities
- [x] **Subtask 1.2.1.3**: Configuration module
  - Config validation (Zod)
  - Environment variable loading
  - Type-safe config access
- [x] **Subtask 1.2.1.4**: Event system
  - EventEmitter2 wrapper
  - Type-safe event definitions
  - Event bus singleton

**Dependencies**: 1.1.1  
**Parallel with**: 1.2.2

#### Task 1.2.2: Shared Package (`packages/shared/`)
- [x] **Subtask 1.2.2.1**: Type definitions
  - Talent types/interfaces
  - Job types/interfaces
  - Admin types/interfaces
  - Common utility types
- [x] **Subtask 1.2.2.2**: Domain constants
  - Service categories enum
  - Experience levels enum
  - Engagement types enum
  - Status enums
- [x] **Subtask 1.2.2.3**: Validation schemas
  - Zod schemas for Talent
  - Zod schemas for Job
  - Common validation utilities
- [x] **Subtask 1.2.2.4**: Business utilities
  - Skill overlap calculation
  - Match score calculation
  - Formatting utilities

**Dependencies**: 1.1.1  
**Parallel with**: 1.2.1

---

### Project 1.3: Database Schema Design
**Owner**: Backend Lead + DBA  
**Priority**: Critical  
**Duration**: 1 week  
**Dependencies**: 1.0.1 (ORM decision), 1.2.2 (for types)

#### Task 1.3.1: PostgreSQL Schema Design
- [ ] **Subtask 1.3.1.1**: Entity design
  - Talent entity (with JSONB, GIN indexes)
  - Job entity (with JSONB, GIN indexes)
  - Admin entity
  - AuditLog entity
  - Session entity (for Auth.js)
  - File metadata entity (if storing file references)
- [ ] **Subtask 1.3.1.2**: Index strategy
  - Primary keys (UUID)
  - Foreign keys
  - GIN indexes on arrays (skills)
  - Partial indexes on status fields
  - Unique constraints
  - Composite indexes for common queries
- [ ] **Subtask 1.3.1.3**: Migration setup
  - TypeORM migrations or Prisma migrations (based on 1.0.1)
  - Initial migration scripts
  - Rollback strategy
  - Migration testing strategy

**Dependencies**: 1.0.1, 1.2.2.1  
**Parallel with**: 1.3.2

#### Task 1.3.2: Database Seeding & Test Data
- [ ] **Subtask 1.3.2.1**: Seed data strategy
  - Development seed data
  - Test data generators
  - Admin user creation script
- [ ] **Subtask 1.3.2.2**: Seed scripts
  - Initial admin user
  - Sample talents (for testing)
  - Sample jobs (for testing)
  - Test matching scenarios

**Dependencies**: 1.3.1.1  
**Parallel with**: None

---

## 🎯 PHASE 2: Backend API & Database

**Duration**: 3-4 weeks  
**Dependencies**: Phase 1 complete  
**Parallel Work**: ✅ Medium opportunity

### Project 2.1: Database Implementation
**Owner**: Backend Developer  
**Priority**: Critical  
**Duration**: 1 week  
**Dependencies**: 1.3.1

#### Task 2.1.1: ORM Setup & Entities
- [ ] **Subtask 2.1.1.1**: Setup chosen ORM (from 1.0.1 decision)
  - Implement ORM configuration
  - Set up base entity classes
  - Configure migrations
- [ ] **Subtask 2.1.1.2**: Implement entities
  - Talent entity with relationships
  - Job entity with relationships
  - Admin entity
  - AuditLog entity
- [ ] **Subtask 2.1.1.3**: Repository pattern
  - Base repository interface
  - Talent repository
  - Job repository
  - Admin repository

**Dependencies**: 1.3.1  
**Parallel with**: 2.1.2

#### Task 2.1.2: Database Migrations
- [ ] **Subtask 2.1.2.1**: Initial migration
  - Create all tables
  - Set up indexes
  - Seed initial data (if needed)
- [ ] **Subtask 2.1.2.2**: Migration testing
  - Test migration up
  - Test migration down
  - Test on clean database

**Dependencies**: 2.1.1.1  
**Parallel with**: 2.1.1

---

### Project 2.2: NestJS API Backend Setup
**Owner**: Backend Lead  
**Priority**: Critical  
**Duration**: 1 week  
**Dependencies**: 1.2.1, 2.1.1

#### Task 2.2.1: NestJS Project Setup
- [ ] **Subtask 2.2.1.1**: Initialize NestJS project
  - Create `packages/api-backend/`
  - Configure NestJS CLI
  - Set up module structure
- [ ] **Subtask 2.2.1.2**: Database connection
  - Configure TypeORM/Prisma module
  - Database connection pooling
    - Max pool size: 50 connections (adjust based on load testing)
    - Idle timeout: 10 seconds
    - Max wait time: 5 seconds
    - Connection limits for 1000+ concurrent users
  - Health check endpoint
- [ ] **Subtask 2.2.1.3**: Core modules setup
  - Config module (using core package)
  - Logger module (using core package)
  - Exception filters

**Dependencies**: 1.2.1, 2.1.1  
**Parallel with**: 2.2.2

#### Task 2.2.2: Authentication Module
- [ ] **Subtask 2.2.2.1**: JWT implementation
  - JWT strategy setup
  - Token generation
  - Token validation
  - Refresh token mechanism
- [ ] **Subtask 2.2.2.2**: Auth guards
  - JWT auth guard
  - Role-based guard (RBAC)
  - Public route decorator
- [ ] **Subtask 2.2.2.3**: Auth endpoints
  - POST `/api/v1/auth/login`
  - POST `/api/v1/auth/refresh`
  - POST `/api/v1/auth/logout`

**Dependencies**: 2.2.1.1  
**Parallel with**: 2.2.3

---

### Project 2.3: Core API Modules
**Owner**: Backend Developer  
**Priority**: High  
**Duration**: 2 weeks  
**Dependencies**: 2.2.1, 2.2.2

#### Task 2.3.1: Talent Module
- [ ] **Subtask 2.3.1.1**: Talent service
  - CRUD operations
  - Profile validation
  - Approval workflow logic
- [ ] **Subtask 2.3.1.2**: Talent controller
  - GET `/api/v1/talents`
  - GET `/api/v1/talents/:id`
  - POST `/api/v1/talents`
  - PATCH `/api/v1/talents/:id`
  - POST `/api/v1/talents/:id/approve`
  - POST `/api/v1/talents/:id/reject`
- [ ] **Subtask 2.3.1.3**: Talent DTOs
  - CreateTalentDto
  - UpdateTalentDto
  - FilterTalentDto
- [ ] **Subtask 2.3.1.4**: Unit tests
  - Service tests
  - Controller tests
  - Integration tests

**Dependencies**: 2.2.1, 2.2.2  
**Parallel with**: 2.3.2, 2.3.3

#### Task 2.3.2: Jobs Module
- [ ] **Subtask 2.3.2.1**: Job service
  - CRUD operations
  - Job validation
  - Publishing workflow
- [ ] **Subtask 2.3.2.2**: Job controller
  - GET `/api/v1/jobs`
  - GET `/api/v1/jobs/:id`
  - POST `/api/v1/jobs`
  - PATCH `/api/v1/jobs/:id`
  - POST `/api/v1/jobs/:id/publish`
  - POST `/api/v1/jobs/:id/archive`
- [ ] **Subtask 2.3.2.3**: Job DTOs
  - CreateJobDto
  - UpdateJobDto
  - FilterJobDto
- [ ] **Subtask 2.3.2.4**: Unit tests
  - Service tests
  - Controller tests
  - Integration tests

**Dependencies**: 2.2.1, 2.2.2  
**Parallel with**: 2.3.1, 2.3.3

#### Task 2.3.3: Matching Module
- [ ] **Subtask 2.3.3.1**: Matching service
  - On-the-fly matching algorithm
  - Score calculation logic
  - Redis caching implementation
- [ ] **Subtask 2.3.3.2**: Matching controller
  - GET `/api/v1/matching/jobs/:jobId/talents`
  - GET `/api/v1/matching/talents/:talentId/jobs`
- [ ] **Subtask 2.3.3.3**: Matching utilities
  - Skill overlap calculation
  - Category matching
  - Experience level matching
- [ ] **Subtask 2.3.3.4**: Unit tests
  - Algorithm tests
  - Caching tests
  - Integration tests

**Dependencies**: 2.2.1, 2.3.1.1, 2.3.2.1  
**Parallel with**: 2.3.4

---

### Project 2.4: Queue System & Workers
**Owner**: Backend Developer  
**Priority**: High  
**Duration**: 1 week  
**Dependencies**: 2.2.1, 2.3.1, 2.3.2

#### Task 2.4.1: BullMQ Setup
- [ ] **Subtask 2.4.1.1**: Redis connection
  - Redis client setup
  - Connection pooling
  - Health checks
- [ ] **Subtask 2.4.1.2**: Queue configuration
  - Queue definitions
  - Queue options (retries, delays)
  - Queue monitoring setup

**Dependencies**: 2.2.1  
**Parallel with**: 2.4.2

#### Task 2.4.2: Worker Implementation
- [ ] **Subtask 2.4.2.1**: Publish Talent Worker
  - Process talent approval
  - Publish to Telegram channel
  - Error handling & retries
- [ ] **Subtask 2.4.2.2**: Publish Job Worker
  - Process job approval
  - Publish to Telegram channel
  - Error handling & retries
- [ ] **Subtask 2.4.2.3**: Notify Talent Worker
  - Match calculation trigger
  - Send notifications
  - Rate limiting
- [ ] **Subtask 2.4.2.4**: Worker tests
  - Unit tests for workers
  - Integration tests
  - Error scenario tests

**Dependencies**: 2.4.1, 2.3.1, 2.3.2  
**Parallel with**: None

---

### Project 2.5: File Upload & Management
**Owner**: Backend Developer  
**Priority**: High  
**Duration**: 3-4 days  
**Dependencies**: 1.0.2 (file storage decision), 2.2.1

#### Task 2.5.1: File Upload Service
- [ ] **Subtask 2.5.1.1**: File upload endpoint
  - POST `/api/v1/files/upload`
  - File validation (size, type)
  - Virus scanning (if applicable)
- [ ] **Subtask 2.5.1.2**: File storage integration
  - Implement storage adapter (based on 1.0.2)
  - File metadata storage
  - File retrieval endpoint
- [ ] **Subtask 2.5.1.3**: CV handling
  - CV upload for talents
  - CV download endpoint
  - CV update/delete
- [ ] **Subtask 2.5.1.4**: File cleanup
  - TTL implementation
  - Orphaned file cleanup
  - Scheduled cleanup job

**Dependencies**: 1.0.2, 2.2.1  
**Parallel with**: 2.5.2

---

### Project 2.6: Admin & Telegram Webhook Modules
**Owner**: Backend Developer  
**Priority**: Medium  
**Duration**: 3-4 days  
**Dependencies**: 2.2.1, 2.2.2, 2.3.1, 2.3.2

#### Task 2.6.1: Admin Module
- [ ] **Subtask 2.6.1.1**: Admin service
  - Statistics aggregation
  - Analytics queries (conversion rates, time-to-match, engagement)
  - Bulk operations
- [ ] **Subtask 2.6.1.2**: Admin controller
  - GET `/api/v1/admin/stats`
  - GET `/api/v1/admin/analytics`
  - POST `/api/v1/admin/bulk-approve`
  - GET `/api/v1/admin/metrics` (key metrics endpoint)
- [ ] **Subtask 2.6.1.3**: Analytics implementation
  - Talent onboarding metrics
  - Job creation metrics
  - Matching quality metrics
  - User engagement metrics

**Dependencies**: 2.2.1, 2.2.2, 2.3.1, 2.3.2  
**Parallel with**: 2.6.2

#### Task 2.6.2: Telegram Webhook Module
- [ ] **Subtask 2.6.2.1**: Webhook handler
  - POST `/api/v1/telegram/webhook`
  - Request validation
  - Security (secret verification)
  - Rate limiting
- [ ] **Subtask 2.6.2.2**: Webhook processing
  - Event routing
  - Error handling
  - Logging
  - Retry logic

**Dependencies**: 2.2.1  
**Parallel with**: 2.6.1

#### Task 2.6.3: API Versioning Strategy
- [ ] **Subtask 2.6.3.1**: Versioning implementation
  - API version header strategy
  - Route versioning
  - Deprecation policy
- [ ] **Subtask 2.6.3.2**: API documentation
  - Swagger/OpenAPI setup
  - Install @nestjs/swagger
  - Configure SwaggerModule in main.ts
  - Add decorators to controllers
  - Add decorators to DTOs
  - Add decorators to entities
  - Endpoint documentation
  - Request/response examples
  - Interactive Swagger UI at /api-docs

**Dependencies**: 2.2.1  
**Parallel with**: 2.6.1, 2.6.2

**Note**: OpenAPI specification file created at `docs/api/openapi.yaml` - keep in sync with implementation

---

## 🎯 PHASE 3: Telegram Bot Development

**Duration**: 3-4 weeks  
**Dependencies**: Phase 2 (API endpoints ready)  
**Parallel Work**: ✅ Can work parallel with Phase 4

### Project 3.1: Bot Foundation Setup
**Owner**: Backend Developer (Bot Specialist)  
**Priority**: Critical  
**Duration**: 3-4 days  
**Dependencies**: 2.2.1 (for API client)

#### Task 3.1.1: grammY Bot Setup
- [ ] **Subtask 3.1.1.1**: Initialize bot project
  - Create `packages/telegram-bot/`
  - Install grammY dependencies
  - Configure bot token
- [ ] **Subtask 3.1.1.2**: Bot configuration
  - Webhook vs polling setup
  - Error handling middleware
  - Logging middleware
- [ ] **Subtask 3.1.1.3**: API client setup
  - HTTP client for backend API
  - Request/response types
  - Error handling

**Dependencies**: 2.2.1  
**Parallel with**: 3.1.2

#### Task 3.1.2: Session & Middleware Setup
- [ ] **Subtask 3.1.2.1**: Redis session store
  - Redis adapter setup
  - Session configuration
  - Session TTL strategy
    - Active sessions: 24 hours
    - Idle timeout: 2 hours
    - Cleanup job: Every 1 hour
    - Session recovery on bot restart
  - Session cleanup strategy
- [ ] **Subtask 3.1.2.2**: Rate limiting middleware
  - Per-user rate limiting
  - Flood control
  - Error messages
- [ ] **Subtask 3.1.2.3**: RBAC middleware
  - Role detection
  - Command access control
  - Admin verification

**Dependencies**: 3.1.1.1  
**Parallel with**: 3.1.1

---

### Project 3.2: Talent Onboarding Flow
**Owner**: Backend Developer (Bot Specialist)  
**Priority**: High  
**Duration**: 1.5 weeks  
**Dependencies**: 3.1.1, 2.3.1

#### Task 3.2.1: Onboarding Scene
- [ ] **Subtask 3.2.1.1**: Scene setup
  - Create onboarding scene
  - State management
  - Scene navigation
- [ ] **Subtask 3.2.1.2**: Welcome & Consent step
  - Welcome message
  - Terms & conditions
  - Consent collection
- [ ] **Subtask 3.2.1.3**: Personal info step
  - Name collection
  - Validation
  - Error handling
- [ ] **Subtask 3.2.1.4**: Service category step
  - Category selection keyboard
  - Category validation
  - Multi-select support
- [ ] **Subtask 3.2.1.5**: Skills & Experience step
  - Skills input (tags)
  - Experience level selection
  - Validation
- [ ] **Subtask 3.2.1.6**: CV upload step
  - File handling
  - File validation
  - Upload to backend
- [ ] **Subtask 3.2.1.7**: Review & Submit step
  - Profile summary
  - Confirmation
  - API submission

**Dependencies**: 3.1.1, 2.3.1  
**Parallel with**: 3.2.2

#### Task 3.2.2: Talent Commands
- [ ] **Subtask 3.2.2.1**: `/start` command
  - New user flow
  - Returning user flow
  - Role detection
- [ ] **Subtask 3.2.2.2**: `/profile` command
  - View profile
  - Edit profile option
- [ ] **Subtask 3.2.2.3**: `/upload_cv` command
  - CV upload flow
  - File validation
- [ ] **Subtask 3.2.2.4**: `/help` command
  - Help message
  - Command list
- [ ] **Subtask 3.2.2.5**: `/cancel` command
  - Cancel current operation
  - State cleanup

**Dependencies**: 3.1.1  
**Parallel with**: 3.2.1

---

### Project 3.3: Admin Job Creation Flow
**Owner**: Backend Developer (Bot Specialist)  
**Priority**: High  
**Duration**: 1.5 weeks  
**Dependencies**: 3.1.1, 3.1.2.3, 2.3.2

#### Task 3.3.1: Job Creation Scene
- [ ] **Subtask 3.3.1.1**: Scene setup
  - Create job creation scene
  - Admin-only access
  - State management
- [ ] **Subtask 3.3.1.2**: Service category step
  - Category selection
  - Validation
- [ ] **Subtask 3.3.1.3**: Job details step
  - Title input
  - Description input
  - Multi-line support
- [ ] **Subtask 3.3.1.4**: Skills & Requirements step
  - Required skills input
  - Qualifications input
- [ ] **Subtask 3.3.1.5**: Engagement & Duration step
  - Engagement type selection
  - Duration/scope input
- [ ] **Subtask 3.3.1.6**: Review & Submit step
  - Job summary
  - Confirmation
  - API submission

**Dependencies**: 3.1.1, 3.1.2.3, 2.3.2  
**Parallel with**: 3.3.2

#### Task 3.3.2: Admin Commands
- [ ] **Subtask 3.3.2.1**: `/create_job` command
  - Admin verification
  - Start job creation flow
- [ ] **Subtask 3.3.2.2**: `/my_jobs` command
  - List created jobs
  - Job status display
- [ ] **Subtask 3.3.2.3**: `/edit_job` command
  - Job selection
  - Edit flow
- [ ] **Subtask 3.3.2.4**: `/close_job` command
  - Job closure flow
  - Confirmation

**Dependencies**: 3.1.1, 3.1.2.3  
**Parallel with**: 3.3.1

---

### Project 3.4: Bot Testing & Refinement
**Owner**: Backend Developer (Bot Specialist) + QA  
**Priority**: High  
**Duration**: 3-4 days  
**Dependencies**: 3.2, 3.3

#### Task 3.4.1: Bot Testing
- [ ] **Subtask 3.4.1.1**: Unit tests
  - Handler tests
  - Scene tests
  - Service tests
- [ ] **Subtask 3.4.1.2**: Integration tests
  - End-to-end onboarding flow
  - End-to-end job creation flow
  - API integration tests
- [ ] **Subtask 3.4.1.3**: User acceptance testing
  - Talent onboarding UAT
  - Admin job creation UAT
  - Error scenario testing

**Dependencies**: 3.2, 3.3  
**Parallel with**: None

---

## 🎯 PHASE 4: Admin Dashboard

**Duration**: 2-3 weeks  
**Dependencies**: 
  - Project 4.1 can start after Phase 1 (with mock APIs)
  - Projects 4.2-4.5 depend on Phase 2 (API endpoints ready)
**Parallel Work**: ✅ Project 4.1 can work parallel with Phase 2, Projects 4.2-4.5 parallel with Phase 3

### Project 4.1: Next.js Project Setup
**Owner**: Frontend Developer  
**Priority**: Critical  
**Duration**: 2-3 days  
**Dependencies**: 1.2.1, 1.2.2

#### Task 4.1.1: Next.js 15.5+ Setup
- [ ] **Subtask 4.1.1.1**: Initialize Next.js project
  - Create `packages/admin-web/`
  - Configure Next.js 15.5+
  - Set up App Router structure
- [ ] **Subtask 4.1.1.2**: TypeScript configuration
  - Strict mode setup
  - Path aliases
  - Type checking
- [ ] **Subtask 4.1.1.3**: Tailwind CSS v4 setup
  - Install Tailwind v4
  - Configure theme
  - Set up CSS variables

**Dependencies**: 1.2.1, 1.2.2  
**Parallel with**: 4.1.2

#### Task 4.1.2: UI Component Library
- [ ] **Subtask 4.1.2.1**: shadcn/ui setup
  - Install shadcn/ui
  - Configure components
  - Set up component directory
  - Validate Next.js 15.5+ compatibility
  - Validate Tailwind v4 compatibility
- [ ] **Subtask 4.1.2.2**: Base components
  - Button component
  - Input component
  - Card component
  - Dialog component
  - DataTable component
  - Form components
- [ ] **Subtask 4.1.2.3**: Layout components
  - Header/Navbar
  - Sidebar
  - Footer
  - Page layout wrapper
- [ ] **Subtask 4.1.2.4**: Mock API setup (for early development)
  - Mock API client
  - Mock data generators
  - Mock endpoints

**Dependencies**: 4.1.1.1  
**Parallel with**: 4.1.1 (can start before Phase 2 complete)

---

### Project 4.2: Authentication Implementation
**Owner**: Frontend Developer  
**Priority**: Critical  
**Duration**: 3-4 days  
**Dependencies**: 4.1.1, 2.2.2

#### Task 4.2.1: Auth.js v5 Setup
- [ ] **Subtask 4.2.1.1**: Install and configure Auth.js
  - Auth.js v5 setup
  - Provider configuration
  - Session strategy
- [ ] **Subtask 4.2.1.2**: Database adapter
  - PostgreSQL adapter setup
  - Session table migration
  - User table integration
- [ ] **Subtask 4.2.1.3**: Auth routes
  - Login page
  - Logout handler
  - Session management

**Dependencies**: 4.1.1, 2.2.2  
**Parallel with**: 4.2.2

#### Task 4.2.2: Protected Routes
- [ ] **Subtask 4.2.2.1**: Route protection middleware
  - Auth check middleware
  - Redirect logic
  - Role-based access
- [ ] **Subtask 4.2.2.2**: Auth utilities
  - `getSession()` helper
  - `requireAuth()` helper
  - Role checking utilities

**Dependencies**: 4.2.1.1  
**Parallel with**: 4.2.1

---

### Project 4.3: Talent Management Pages
**Owner**: Frontend Developer  
**Priority**: High  
**Duration**: 1 week  
**Dependencies**: 4.1, 4.2, 2.3.1

#### Task 4.3.1: Talent List Page
- [ ] **Subtask 4.3.1.1**: Server Component setup
  - Fetch talents from API
  - Server-side rendering
  - Loading states
- [ ] **Subtask 4.3.1.2**: Filtering & Search
  - Filter UI components
  - Search functionality
  - URL query params
- [ ] **Subtask 4.3.1.3**: Data Table
  - Table component
  - Sorting
  - Pagination
- [ ] **Subtask 4.3.1.4**: Approval actions
  - Approve button (Server Action)
  - Reject button (Server Action)
  - Bulk actions

**Dependencies**: 4.1, 4.2, 2.3.1  
**Parallel with**: 4.3.2

#### Task 4.3.2: Talent Detail Page
- [ ] **Subtask 4.3.2.1**: Talent profile view
  - Profile display
  - Skills display
  - CV download
- [ ] **Subtask 4.3.2.2**: Edit talent page
  - Edit form (Client Component)
  - Form validation
  - Update Server Action
- [ ] **Subtask 4.3.2.3**: Matching insights
  - Matched jobs display
  - Match scores
  - Recommendations

**Dependencies**: 4.1, 4.2, 2.3.1, 2.3.3  
**Parallel with**: 4.3.1

---

### Project 4.4: Job Management Pages
**Owner**: Frontend Developer  
**Priority**: High  
**Duration**: 1 week  
**Dependencies**: 4.1, 4.2, 2.3.2

#### Task 4.4.1: Job List Page
- [ ] **Subtask 4.4.1.1**: Server Component setup
  - Fetch jobs from API
  - Server-side rendering
  - Loading states
- [ ] **Subtask 4.4.1.2**: Filtering & Search
  - Filter UI components
  - Search functionality
  - Status filters
- [ ] **Subtask 4.4.1.3**: Data Table
  - Table component
  - Sorting
  - Pagination
- [ ] **Subtask 4.4.1.4**: Job actions
  - Publish button (Server Action)
  - Archive button (Server Action)
  - Edit navigation

**Dependencies**: 4.1, 4.2, 2.3.2  
**Parallel with**: 4.4.2

#### Task 4.4.2: Job Detail & Edit Pages
- [ ] **Subtask 4.4.2.1**: Job detail view
  - Job information display
  - Required skills display
  - Status indicators
- [ ] **Subtask 4.4.2.2**: Edit job page
  - Edit form (Client Component)
  - Form validation
  - Update Server Action
- [ ] **Subtask 4.4.2.3**: Matching preview
  - Matched talents display
  - Match scores
  - Preview before publishing

**Dependencies**: 4.1, 4.2, 2.3.2, 2.3.3  
**Parallel with**: 4.4.1

---

### Project 4.5: Matching Dashboard
**Owner**: Frontend Developer  
**Priority**: Medium  
**Duration**: 3-4 days  
**Dependencies**: 4.1, 4.2, 2.3.3

#### Task 4.5.1: Matching Overview
- [ ] **Subtask 4.5.1.1**: Matching dashboard page
  - Overview statistics
  - Recent matches
  - Match quality metrics
- [ ] **Subtask 4.5.1.2**: Job-to-Talent matching
  - View matches for a job
  - Ranked talent list
  - Score breakdown
- [ ] **Subtask 4.5.1.3**: Talent-to-Job matching
  - View matches for a talent
  - Ranked job list
  - Score breakdown

**Dependencies**: 4.1, 4.2, 2.3.3  
**Parallel with**: None

---

## 🎯 PHASE 5: Integration & Testing

**Duration**: 2-3 weeks  
**Dependencies**: Phase 3, Phase 4 complete  
**Parallel Work**: ✅ High opportunity

### Project 5.1: End-to-End Integration
**Owner**: Full-Stack Developer + QA  
**Priority**: Critical  
**Duration**: 1 week  
**Dependencies**: Phase 3, Phase 4

#### Task 5.1.1: Bot-API Integration
- [ ] **Subtask 5.1.1.1**: Webhook integration
  - Webhook endpoint testing
  - Event handling verification
  - Error handling
- [ ] **Subtask 5.1.1.2**: API client integration
  - All endpoints tested
  - Error scenarios
  - Rate limiting handling
- [ ] **Subtask 5.1.1.3**: Queue integration
  - Worker job processing
  - Telegram channel publishing
  - Notification delivery

**Dependencies**: Phase 3, Phase 4  
**Parallel with**: 5.1.2

#### Task 5.1.2: Admin-API Integration
- [ ] **Subtask 5.1.2.1**: Authentication flow
  - Login/logout flow
  - Session management
  - Token refresh
- [ ] **Subtask 5.1.2.2**: CRUD operations
  - Talent CRUD testing
  - Job CRUD testing
  - Approval workflows
- [ ] **Subtask 5.1.2.3**: Matching integration
  - Match calculation
  - Caching verification
  - Real-time updates

**Dependencies**: Phase 4  
**Parallel with**: 5.1.1

---

### Project 5.2: Comprehensive Testing
**Owner**: QA Lead + Developers  
**Priority**: Critical  
**Duration**: 1.5 weeks  
**Dependencies**: 5.1

#### Task 5.2.1: E2E Testing
- [ ] **Subtask 5.2.1.1**: Talent onboarding E2E
  - Complete flow testing
  - Error scenario testing
  - Edge cases
- [ ] **Subtask 5.2.1.2**: Job creation E2E
  - Complete flow testing
  - Admin verification
  - Publishing flow
- [ ] **Subtask 5.2.1.3**: Admin dashboard E2E
  - Approval workflows
  - Matching insights
  - Analytics

**Dependencies**: 5.1  
**Parallel with**: 5.2.2

#### Task 5.2.2: Performance Testing
- [ ] **Subtask 5.2.2.1**: API performance
  - Load testing targets
    - 100 concurrent API requests/sec
    - 500 concurrent bot users
    - Response time: <200ms (p95)
    - Database queries: <50ms (p95)
  - Response time optimization
  - Database query optimization
- [ ] **Subtask 5.2.2.2**: Bot performance
  - Concurrent user handling
  - Rate limiting effectiveness
  - Session management
- [ ] **Subtask 5.2.2.3**: Dashboard performance
  - Page load times
  - Server Component optimization
  - Caching strategy

**Dependencies**: 5.1  
**Parallel with**: 5.2.1

#### Task 5.2.3: Security Testing
- [ ] **Subtask 5.2.3.1**: Authentication security
  - JWT token security
  - Session hijacking prevention
  - CSRF protection
- [ ] **Subtask 5.2.3.2**: API security
  - Input validation
  - SQL injection prevention
  - Rate limiting
- [ ] **Subtask 5.2.3.3**: Bot security
  - Webhook secret verification
  - Admin access control
  - File upload security

**Dependencies**: 5.1  
**Parallel with**: 5.2.1, 5.2.2

---

### Project 5.3: Bug Fixes & Refinement
**Owner**: All Developers  
**Priority**: High  
**Duration**: Ongoing (1 week buffer)  
**Dependencies**: 5.2

#### Task 5.3.1: Bug Triage
- [ ] **Subtask 5.3.1.1**: Bug prioritization
  - Critical bugs first
  - High priority bugs
  - Medium/low priority
- [ ] **Subtask 5.3.1.2**: Bug assignment
  - Assign to developers
  - Track progress
  - Verify fixes

**Dependencies**: 5.2  
**Parallel with**: None

---

## 🎯 PHASE 6: Deployment & Launch

**Duration**: 1-2 weeks  
**Dependencies**: Phase 5 complete  
**Parallel Work**: ✅ Medium opportunity

### Project 6.1: Production Infrastructure
**Owner**: DevOps  
**Priority**: Critical  
**Duration**: 3-4 days  
**Dependencies**: Phase 5

#### Task 6.1.1: VPS Setup
- [ ] **Subtask 6.1.1.1**: VPS provisioning
  - Server selection
  - OS installation (Linux)
  - Security hardening
- [ ] **Subtask 6.1.1.2**: Docker installation
  - Docker Engine setup
  - Docker Compose setup
  - User permissions
- [ ] **Subtask 6.1.1.3**: Network configuration
  - Firewall rules
  - Port configuration
  - Domain/DNS setup (if needed)

**Dependencies**: Phase 5  
**Parallel with**: 6.1.2

#### Task 6.1.2: Database & Redis Setup
- [ ] **Subtask 6.1.2.1**: PostgreSQL setup
  - PostgreSQL 16+ installation
  - Database creation
  - User & permissions
  - Backup strategy
    - Full backup: Daily at 2 AM
    - Incremental: Every 6 hours
    - Retention: 30 days
    - Test restore: Weekly
- [ ] **Subtask 6.1.2.2**: Redis setup
  - Redis 7+ installation
  - Configuration
  - Persistence setup
  - Redis memory management
    - Max memory: 2GB (adjust based on load)
    - Eviction policy: allkeys-lru (for caching) or noeviction (for sessions)
    - Memory monitoring alerts

**Dependencies**: 6.1.1.1  
**Parallel with**: 6.1.1

---

### Project 6.2: Production Deployment
**Owner**: DevOps + Backend Lead  
**Priority**: Critical  
**Duration**: 3-4 days  
**Dependencies**: 6.1

#### Task 6.2.1: Docker Compose Production
- [ ] **Subtask 6.2.1.1**: Production compose file
  - Service definitions
  - Environment variables
  - Volume mounts
  - Health checks
- [ ] **Subtask 6.2.1.2**: Build & deploy
  - Build Docker images
  - Push to registry (if applicable)
  - Deploy services
  - Verify health

**Dependencies**: 6.1  
**Parallel with**: 6.2.2

#### Task 6.2.2: Environment Configuration
- [ ] **Subtask 6.2.2.1**: Environment variables
  - Production secrets
  - Database URLs
  - API keys
  - Telegram tokens
- [ ] **Subtask 6.2.2.2**: SSL/TLS setup
  - Certificate configuration
  - HTTPS setup (if using domain)
  - Security headers

**Dependencies**: 6.1  
**Parallel with**: 6.2.1

---

### Project 6.3: Monitoring & Observability
**Owner**: DevOps + Backend Lead  
**Priority**: High  
**Duration**: 2-3 days  
**Dependencies**: 6.2

#### Task 6.3.1: Logging Setup
- [ ] **Subtask 6.3.1.1**: Structured logging
  - Pino configuration
  - Log aggregation
  - Log retention
- [ ] **Subtask 6.3.1.2**: Error tracking
  - Sentry integration
  - Error alerts
  - Error dashboard

**Dependencies**: 6.2  
**Parallel with**: 6.3.2

#### Task 6.3.2: Queue Monitoring
- [ ] **Subtask 6.3.2.1**: BullMQ Board setup
  - BullMQ Board installation
  - Queue monitoring
  - Job status tracking
- [ ] **Subtask 6.3.2.2**: Health checks
  - API health endpoint
  - Database health check
  - Redis health check

**Dependencies**: 6.2  
**Parallel with**: 6.3.1

---

### Project 6.4: Launch Preparation
**Owner**: Project Manager + Team  
**Priority**: High  
**Duration**: 2-3 days  
**Dependencies**: 6.2, 6.3

#### Task 6.4.1: Pre-Launch Checklist
- [ ] **Subtask 6.4.1.1**: Documentation review
  - API documentation
  - Admin user guide
  - Deployment runbook
- [ ] **Subtask 6.4.1.2**: Security audit
  - Security checklist
  - Penetration testing (if applicable)
  - Access control review
- [ ] **Subtask 6.4.1.3**: Backup & recovery
  - Backup procedures
  - Recovery testing
  - Disaster recovery plan

**Dependencies**: 6.2, 6.3  
**Parallel with**: 6.4.2

#### Task 6.4.2: Launch
- [ ] **Subtask 6.4.2.1**: Soft launch
  - Limited user testing
  - Monitor for issues
  - Collect feedback
- [ ] **Subtask 6.4.2.2**: Full launch
  - Public availability
  - Announcement
  - Support readiness

**Dependencies**: 6.4.1  
**Parallel with**: None

---

## 📊 Dependency Graph Summary

### Critical Path
```
Phase 1 → Phase 2 → Phase 3 → Phase 5 → Phase 6
         ↓
      Phase 4 ──┘
```

### Parallel Opportunities
- **Phase 1**: All projects can run in parallel (1.1, 1.2, 1.3)
- **Phase 2**: Projects 2.3.1, 2.3.2, 2.3.3 can run in parallel
- **Phase 3 & 4**: Can run in parallel (after Phase 2)
- **Phase 5**: Projects 5.1.1 and 5.1.2 can run in parallel

---

## 👥 Resource Allocation

| Role | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Phase 6 |
|------|---------|---------|---------|---------|---------|---------|
| Backend Lead | 100% | 100% | 50% | 25% | 50% | 50% |
| Backend Dev | 50% | 100% | 100% | 0% | 75% | 25% |
| Frontend Dev | 0% | 0% | 0% | 100% | 75% | 25% |
| Bot Specialist | 0% | 0% | 100% | 0% | 50% | 0% |
| DevOps | 50% | 25% | 0% | 0% | 25% | 100% |
| QA | 0% | 25% | 25% | 25% | 100% | 50% |

---

## 📈 Milestones

| Milestone | Target Date | Deliverables |
|-----------|-------------|--------------|
| M1: Foundation Complete | Week 5 | Monorepo, core packages, database schema, critical decisions |
| M2: API Backend Complete | Week 10 | All API endpoints, workers, authentication, file storage |
| M3: Bot Complete | Week 14 | Unified bot with all flows |
| M4: Dashboard Complete | Week 13 | Admin dashboard with all features |
| M5: Integration Complete | Week 18 | E2E tests, bug fixes, performance testing |
| M6: Production Launch | Week 20-22 | Deployed, monitored, live |

---

## 🚨 Risk Management

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Database migration issues | High | Medium | Thorough testing, rollback plan, early schema design |
| Telegram API rate limits | Medium | High | Rate limiting (defined in 1.0.3), queue management, monitoring |
| Performance bottlenecks | Medium | Medium | Load testing (1000+ users), optimization, caching strategy |
| Security vulnerabilities | High | Low | Security audits, best practices, input validation |
| Integration issues | Medium | Medium | Early integration, continuous testing, staging environment |
| Next.js 15.5+ / Tailwind v4 instability | Medium | Low | Validate versions early, have fallback plan |
| Matching algorithm performance | High | Medium | Prototype early (1.0.4), performance testing, optimization |
| Redis session management at scale | Medium | Medium | TTL strategy, session recovery, memory limits |
| File storage issues | Medium | Low | Early decision (1.0.2), backup strategy, testing |
| Timeline overrun | High | Medium | Weekly reviews, buffer weeks, de-scope if needed |
| ORM decision delay | High | Low | Make decision in Phase 1 (1.0.1) |
| Auth.js v5 compatibility | Medium | Low | Validate early, test thoroughly |

---

## 📋 Additional Considerations

### MVP De-scoping Options (if timeline pressure)

If timeline pressure builds, consider de-scoping:

- **Admin Analytics**: Use basic SQL queries initially, advanced analytics later
- **Bulk Operations**: Do one-by-one for MVP, bulk operations in v2
- **Edit Flows**: Just delete/recreate for MVP, edit flows in v2
- **Advanced Filtering**: Basic search first, advanced filters in v2
- **Email/SMS Notifications**: Telegram only for MVP, other channels in v2
- **Multi-language Support**: Single language for MVP, i18n in v2

### Process Improvements

1. **Daily Standups**: Track progress daily, adjust as needed
2. **Weekly Sprint Reviews**: Review progress weekly, adjust timeline
3. **Code Review Process**: All PRs require review before merge
4. **Documentation Updates**: Keep docs in sync with code changes

### Key Metrics to Track

- **Development Velocity**: Story points completed per sprint
- **Bug Rate**: Bugs found vs fixed per week
- **Test Coverage**: Maintain >80% coverage
- **Performance Metrics**: API response times, bot response times
- **User Metrics** (post-launch): Onboarding completion rate, match quality

---

---

## 📅 Weekly Checkpoint Template

Use this template for weekly status reports:

```markdown
### Week [X] Status Report - [Date]

#### Completed Tasks
- [List completed tasks with task IDs]

#### Blocked Tasks
- [List blocked tasks with blockers and task IDs]

#### Timeline Status
- [ ] On track
- [ ] 1 week behind
- [ ] 2+ weeks behind
- [ ] Ahead of schedule

#### Risks Identified
- [New risks discovered this week]

#### De-scope Decisions
- [Any features de-scoped this week]

#### Next Week Priorities (Top 3)
1. [Priority 1]
2. [Priority 2]
3. [Priority 3]

#### Team Velocity
- Story points completed: [X]
- Story points planned: [Y]
- Velocity trend: [Increasing/Stable/Decreasing]
```

---

## 🎯 Week 1, Day 1 Priorities

**Prioritize these 3 decisions first** (Day 1):

1. **ORM choice** (Task 1.0.1) - 4 hours
   - Evaluate TypeORM vs Prisma
   - Make decision and document

2. **File storage** (Task 1.0.2) - 4 hours
   - Evaluate storage options
   - Define file handling strategy

3. **Rate limits** (Task 1.0.3) - 2 hours
   - Define notification channels
   - Set actual limit values

**Everything else flows from these decisions.**

---

## 👥 Team Size Considerations

**Current resource allocation assumes 6 people:**
- 1 Backend Lead
- 1 Backend Dev
- 1 Frontend Dev
- 1 Bot Specialist
- 1 DevOps
- 1 QA

**If your team is smaller:**
- Add 25% to timeline for each missing role
- Consider combining roles (e.g., Backend Lead + Backend Dev)
- Prioritize critical path tasks first

---

**Document Version**: 2.1 (Fixed duplicates and added missing details)  
**Last Updated**: 2025-01-XX  
**Next Review**: Weekly during active development  
**Total Timeline**: 16-22 weeks (with buffers)

