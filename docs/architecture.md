# Architecture Documentation

Comprehensive architecture documentation for the BlihOps Talent & Employer Platform.

## 📋 Table of Contents

- [System Overview](#system-overview)
- [High-Level Architecture](#high-level-architecture)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [Authentication Flow](#authentication-flow)
- [Telegram Bot Architecture](#telegram-bot-architecture)
- [Matching Algorithm Flow](#matching-algorithm-flow)
- [Deployment Architecture](#deployment-architecture)
- [Technology Stack](#technology-stack)
- [System Scalability](#system-scalability)
- [Security Architecture](#security-architecture)
- [Monitoring & Observability](#monitoring--observability)
- [Production Essentials](#production-essentials)
- [Architecture Decisions](#architecture-decisions)

## 🏗️ System Overview

The BlihOps Talent Platform is a monorepo-based, multi-service application consisting of:

1. **API Backend** - NestJS REST API
2. **Unified Telegram Bot** - Single bot with role-based access (talent onboarding + job posting)
3. **Admin Web** - Next.js 15 admin dashboard
4. **Queue System** - BullMQ with Redis for reliable job processing
5. **Database** - PostgreSQL 16+ with JSONB for flexible fields
6. **Session Store** - Redis for bot session management
7. **Public Channels** - Telegram channels for public visibility
8. **Observability** - Sentry + structured logging (Pino)

## 🎯 High-Level Architecture

```mermaid
graph TB
    subgraph "Public Layer"
        TC[Telegram Talent Channel]
        JC[Telegram Job Channel]
    end
    
    subgraph "User Interfaces"
        UB[Unified Telegram Bot<br/>Role-Based Access]
        AW[Admin Web Dashboard]
    end
    
    subgraph "Application Layer"
        API[API Backend<br/>NestJS]
        QUEUE[BullMQ Workers<br/>Job Processing]
    end
    
    subgraph "Data & Cache Layer"
        DB[(PostgreSQL 16+<br/>JSONB + Relations)]
        REDIS[(Redis<br/>Sessions + Queues)]
    end
    
    subgraph "Observability"
        SENTRY[Sentry<br/>Error Tracking]
        LOGS[Structured Logging<br/>Pino]
    end
    
    subgraph "External Services"
        TG[Telegram API]
    end
    
    UB --> API
    AW --> API
    API --> DB
    API --> REDIS
    QUEUE --> API
    QUEUE --> DB
    QUEUE --> REDIS
    QUEUE --> TC
    QUEUE --> JC
    UB --> TG
    API --> TG
    API --> SENTRY
    API --> LOGS
    QUEUE --> SENTRY
    QUEUE --> LOGS
    
    style API fill:#4F46E5
    style DB fill:#10B981
    style REDIS fill:#DC2626
    style QUEUE fill:#F59E0B
    style AW fill:#8B5CF6
    style UB fill:#06B6D4
```

## 📦 Component Architecture

### Monorepo Structure

```mermaid
graph LR
    subgraph "packages/"
        CORE[core/<br/>Infrastructure]
        SHARED[shared/<br/>Domain Types]
        API[api-backend/<br/>NestJS API]
        BOT[telegram-bot/<br/>Unified Bot]
        AW[admin-web/<br/>Next.js 15]
        TOOL[tooling/<br/>Dev Tools]
    end
    
    API --> CORE
    API --> SHARED
    BOT --> CORE
    BOT --> SHARED
    AW --> CORE
    AW --> SHARED
    TOOL --> CORE
    
    style CORE fill:#3B82F6
    style SHARED fill:#10B981
    style API fill:#4F46E5
    style AW fill:#8B5CF6
    style BOT fill:#06B6D4
```

### API Backend Module Structure

```mermaid
graph TD
    subgraph "API Backend Modules"
        AUTH[auth/<br/>JWT Auth]
        TALENT[talent/<br/>Talent CRUD]
        JOBS[jobs/<br/>Job CRUD]
        MATCH[matching/<br/>Matching Logic]
        NOTIF[notifications/<br/>Events]
        TELEGRAM[telegram/<br/>Webhooks]
        ADMIN[admin/<br/>Admin Endpoints]
    end
    
    subgraph "Shared Infrastructure"
        CORE[core/]
        SHARED[shared/]
    end
    
    AUTH --> CORE
    TALENT --> CORE
    TALENT --> SHARED
    JOBS --> CORE
    JOBS --> SHARED
    MATCH --> CORE
    MATCH --> SHARED
    NOTIF --> CORE
    TELEGRAM --> CORE
    ADMIN --> CORE
    ADMIN --> SHARED
    
    style AUTH fill:#EF4444
    style MATCH fill:#F59E0B
    style CORE fill:#3B82F6
    style SHARED fill:#10B981
```

## 🔄 Data Flow

### Talent Onboarding Flow

```mermaid
sequenceDiagram
    participant U as User
    participant BOT as Unified Bot
    participant API as API Backend
    participant PG as PostgreSQL
    participant REDIS as Redis
    participant QUEUE as BullMQ Worker
    participant TC as Talent Channel
    
    U->>BOT: /start command
    BOT->>BOT: Check role (talent)
    BOT->>U: Welcome message
    U->>BOT: Provide profile data
    BOT->>API: POST /api/v1/talents
    API->>PG: Save talent profile (transaction)
    PG-->>API: Profile saved
    API->>REDIS: Store session state
    API-->>BOT: Profile created
    BOT->>U: Profile confirmation
    
    Note over API,QUEUE: Approval workflow
    API->>QUEUE: Add job: talent.created
    QUEUE->>API: GET /api/v1/talents/:id
    API->>PG: Query talent
    PG-->>API: Talent data
    API-->>QUEUE: Talent data
    QUEUE->>QUEUE: Check approval status
    alt Approved
        QUEUE->>TC: Publish talent profile
        QUEUE->>API: Update status: approved
        API->>PG: Update status (transaction)
    else Rejected
        QUEUE->>API: Update status: rejected
        API->>PG: Update status (transaction)
    end
```

### Job Creation Flow

```mermaid
sequenceDiagram
    participant A as Admin
    participant BOT as Unified Bot
    participant API as API Backend
    participant PG as PostgreSQL
    participant REDIS as Redis
    participant QUEUE as BullMQ Worker
    participant JC as Job Channel
    
    A->>BOT: /create_job command
    BOT->>BOT: Check role (admin)
    BOT->>A: Job creation workflow
    A->>BOT: Provide job details
    BOT->>API: POST /api/v1/jobs
    API->>PG: Save job posting (transaction)
    PG-->>API: Job saved
    API->>REDIS: Store session state
    API-->>BOT: Job created
    BOT->>A: Job confirmation
    
    Note over API,QUEUE: Approval & Publishing
    API->>QUEUE: Add job: job.created
    QUEUE->>API: GET /api/v1/jobs/:id
    API->>PG: Query job
    PG-->>API: Job data
    API-->>QUEUE: Job data
    QUEUE->>QUEUE: Check approval status
    alt Approved
        QUEUE->>JC: Publish job posting
        QUEUE->>API: Update status: published
        API->>PG: Update status (transaction)
        QUEUE->>QUEUE: Trigger matching calculation
        QUEUE->>API: POST /api/v1/matching/calculate
    end
```

### Admin Dashboard Data Flow

```mermaid
sequenceDiagram
    participant U as Admin User
    participant AW as Admin Web
    participant API as API Backend
    participant PG as PostgreSQL
    participant REDIS as Redis
    
    U->>AW: Access /talents
    AW->>API: GET /api/v1/talents
    API->>REDIS: Check cache
    alt Cache Hit
        REDIS-->>API: Cached data
    else Cache Miss
        API->>PG: Query talents (with indexes)
        PG-->>API: Talent data
        API->>REDIS: Cache results
    end
    API-->>AW: JSON response
    AW->>AW: Render Server Component
    AW-->>U: Display talents
    
    U->>AW: Approve talent
    AW->>AW: Server Action: approveTalent()
    AW->>API: POST /api/v1/talents/:id/approve
    API->>PG: Begin transaction
    API->>PG: Update status
    API->>REDIS: Invalidate cache
    PG-->>API: Transaction committed
    API-->>AW: Success
    AW->>AW: Revalidate path
    AW-->>U: UI updated
```

## 🔐 Authentication Flow

### Web Authentication (Admin Dashboard)

```mermaid
sequenceDiagram
    participant U as User
    participant AW as Admin Web
    participant MW as Middleware
    participant API as API Backend
    participant PG as PostgreSQL
    participant REDIS as Redis
    
    U->>AW: Access /talents
    AW->>MW: Check auth
    MW->>REDIS: Verify session token
    alt Not Authenticated
        MW->>AW: Redirect to /login
        AW-->>U: Login page
        U->>AW: Submit credentials
        AW->>API: POST /api/v1/auth/login
        API->>PG: Verify credentials (prepared statement)
        PG-->>API: User data
        API->>API: Generate JWT
        API->>REDIS: Store session (TTL)
        API-->>AW: JWT token
        AW->>AW: Store in HTTP-only cookie
        AW-->>U: Redirect to /talents
    else Authenticated
        MW->>AW: Allow access
        AW->>API: GET /api/v1/talents
        API-->>AW: Data
        AW-->>U: Display content
    end
```

### Telegram Bot Authentication & Role-Based Access

```mermaid
sequenceDiagram
    participant U as User
    participant BOT as Unified Bot
    participant API as API Backend
    participant PG as PostgreSQL
    participant REDIS as Redis
    
    U->>BOT: /start or /create_job
    BOT->>BOT: Extract Telegram user ID
    BOT->>REDIS: Get session state
    alt Session Exists
        REDIS-->>BOT: Session data
    else New Session
        BOT->>API: GET /api/v1/users/telegram/:id
        API->>PG: Find user (indexed query)
        alt Admin User
            PG-->>API: Admin profile
            API->>REDIS: Store admin session
            API-->>BOT: Admin role
            BOT->>BOT: Enable admin commands
        else Talent User
            PG-->>API: Talent profile (or null)
            API->>REDIS: Store talent session
            API-->>BOT: Talent role
            BOT->>BOT: Enable talent commands
        end
    end
    
    alt Admin Command (/create_job)
        BOT->>BOT: Verify admin role
        BOT->>U: Job creation workflow
    else Talent Command (/start)
        BOT->>BOT: Verify talent role
        alt Existing Profile
            BOT->>U: Show existing profile
        else New User
            BOT->>U: Begin onboarding workflow
        end
    end
```

## 🤖 Telegram Bot Architecture

### Unified Bot with Role-Based Access

The platform uses a **single Telegram bot** with role-based command access, reducing code duplication and operational complexity.

**Framework Choice**: **grammY** is preferred over Telegraf in 2026 due to:
- Better TypeScript support and type safety
- Superior plugin ecosystem
- Improved performance and developer experience
- Active development and growing community
- Better scene management for complex workflows
- More modern API design

### Bot Architecture

```mermaid
graph TD
    subgraph "Unified Telegram Bot (grammY)"
        TG[Telegram API]
        MW[Middleware Layer]
        RBAC[Role-Based Access Control]
        BH[Command Handler]
        
        subgraph "Talent Scenes (grammY Scenes)"
            TWH[Talent Workflow Handler]
            TSS[Talent State Store<br/>Redis]
        end
        
        subgraph "Admin Scenes (grammY Scenes)"
            AWH[Admin Workflow Handler]
            ASS[Admin State Store<br/>Redis]
        end
        
        KB[Keyboard Builder]
        RL[Rate Limiter<br/>grammY Plugin]
        BS[Bot Service]
        API[API Client]
    end
    
    TG --> MW
    MW --> RL
    RL --> RBAC
    RBAC --> BH
    BH --> TWH
    BH --> AWH
    TWH --> TSS
    AWH --> ASS
    TWH --> KB
    AWH --> KB
    BH --> BS
    BS --> API
    API --> Backend[API Backend]
    TSS --> Redis[(Redis)]
    ASS --> Redis
    
    style RBAC fill:#EF4444
    style RL fill:#F59E0B
    style TWH fill:#8B5CF6
    style AWH fill:#06B6D4
```

### Talent Onboarding State Machine

```mermaid
stateDiagram-v2
    [*] --> Welcome: /start (talent role)
    Welcome --> PersonalInfo: Consent given
    PersonalInfo --> ServiceCategory: Name provided
    ServiceCategory --> RoleSpecialization: Category selected
    RoleSpecialization --> Skills: Role entered
    Skills --> ExperienceLevel: Skills added
    ExperienceLevel --> Availability: Level selected
    Availability --> EngagementPreference: Status set
    EngagementPreference --> CVUpload: Preference selected
    CVUpload --> Review: CV uploaded/skipped
    Review --> Complete: Profile confirmed
    Review --> PersonalInfo: Edit profile
    Complete --> [*]
    
    note right of Welcome
        Role: Talent
        State stored in Redis
    end note
```

### Admin Job Creation State Machine

```mermaid
stateDiagram-v2
    [*] --> AuthCheck: /create_job (admin role)
    AuthCheck --> ServiceCategory: Admin verified
    ServiceCategory --> JobTitle: Category selected
    JobTitle --> Description: Title entered
    Description --> Skills: Description provided
    Skills --> EngagementType: Skills added
    EngagementType --> Duration: Type selected
    Duration --> Review: Duration entered
    Review --> Complete: Job confirmed
    Review --> ServiceCategory: Edit job
    Complete --> [*]
    
    note right of AuthCheck
        Role: Admin
        State stored in Redis
    end note
```

### Rate Limiting & Flood Control

```mermaid
graph LR
    MSG[Incoming Message] --> RL[Rate Limiter]
    RL --> CHECK{Check Limits}
    CHECK -->|Within Limits| PROCESS[Process Command]
    CHECK -->|Rate Limited| THROTTLE[Throttle Response]
    THROTTLE --> WAIT[Wait & Retry]
    PROCESS --> REDIS[(Redis<br/>Rate Limit Store)]
    
    style RL fill:#F59E0B
    style THROTTLE fill:#EF4444
```

## 🎯 Matching Algorithm Flow

### On-the-Fly Matching (Recommended)

Matches are computed **on-demand** rather than pre-calculated, reducing database writes and ensuring real-time accuracy.

```mermaid
flowchart TD
    START([Admin Requests Matches]) --> FETCH[Fetch Job Details]
    FETCH --> QUERY[Query Talents<br/>with Indexes]
    QUERY --> LOOP{For Each Talent}
    
    LOOP --> CHECK1{Service Category<br/>Match?}
    CHECK1 -->|No| SCORE0[Score: 0]
    CHECK1 -->|Yes| CHECK2{Skills Overlap?}
    
    CHECK2 --> CALC1[Calculate Skill Overlap<br/>PostgreSQL Array Ops]
    CALC1 --> CHECK3{Experience<br/>Compatible?}
    
    CHECK3 --> CALC2[Calculate Experience Score]
    CHECK3 --> CHECK4{Availability<br/>Match?}
    
    CHECK4 --> CALC3[Calculate Availability Score]
    CALC2 --> CALC4[Calculate Engagement Match]
    CALC3 --> CALC4
    
    CALC4 --> TOTAL[Total Score Calculation<br/>Weighted Sum]
    SCORE0 --> TOTAL
    
    TOTAL --> CACHE[Cache in Redis<br/>TTL: 5min]
    CACHE --> LOOP
    
    LOOP -->|Next Talent| LOOP
    LOOP -->|All Processed| RANK[Rank by Score<br/>In-Memory Sort]
    RANK --> RETURN[Return Top N Matches]
    RETURN --> END([Complete])
    
    style START fill:#10B981
    style CACHE fill:#DC2626
    style RANK fill:#F59E0B
    style END fill:#EF4444
```

### Background Matching (Optional)

For high-volume scenarios, background workers can pre-compute and cache matches.

```mermaid
sequenceDiagram
    participant API as API Backend
    participant QUEUE as BullMQ
    participant WORKER as Matching Worker
    participant PG as PostgreSQL
    participant REDIS as Redis
    
    API->>QUEUE: Add job: calculateMatches(jobId)
    QUEUE->>WORKER: Process job
    WORKER->>PG: Fetch job details
    WORKER->>PG: Query talents (with GIN indexes)
    WORKER->>WORKER: Calculate scores
    WORKER->>REDIS: Cache results (TTL: 1 hour)
    WORKER->>API: Notify completion
```

### Matching Score Calculation

```mermaid
graph LR
    subgraph "Matching Factors"
        SC[Service Category<br/>Weight: 30%]
        SO[Skill Overlap<br/>Weight: 40%]
        EL[Experience Level<br/>Weight: 20%]
        AV[Availability<br/>Weight: 10%]
    end
    
    subgraph "Score Calculation"
        CALC[Weighted Sum<br/>Score = SC×0.3 + SO×0.4 + EL×0.2 + AV×0.1]
    end
    
    subgraph "Output"
        RANK[Ranked List<br/>Top Matches]
    end
    
    SC --> CALC
    SO --> CALC
    EL --> CALC
    AV --> CALC
    CALC --> RANK
    
    style CALC fill:#4F46E5
    style RANK fill:#10B981
```

## 🚀 Deployment Architecture

### VPS + Docker Deployment

Production deployment on Linux VPS using Docker and Docker Compose for containerization and orchestration.

```mermaid
graph TB
    subgraph "Linux VPS"
        subgraph "Application Services"
            API[API Backend<br/>Docker Container<br/>Port 3000]
            AW[Admin Web<br/>Docker Container<br/>Port 3001]
            BOT[Unified Bot<br/>Docker Container]
            WORKER1[BullMQ Worker 1<br/>Docker Container]
            WORKER2[BullMQ Worker 2<br/>Docker Container]
        end
        
        subgraph "Database & Cache"
            PG[(PostgreSQL<br/>Docker Container<br/>Port 5432)]
            REDIS[(Redis<br/>Docker Container<br/>Port 6379)]
        end
        
        subgraph "File Storage"
            VOLUMES[Docker Volumes<br/>Persistent Storage]
        end
    end
    
    subgraph "External Services"
        TG[Telegram API]
        TC[Talent Channel]
        JC[Job Channel]
        SENTRY[Sentry<br/>Error Tracking]
    end
    
    API --> PG
    API --> REDIS
    AW --> API
    BOT --> API
    BOT --> REDIS
    BOT --> TG
    WORKER1 --> API
    WORKER1 --> PG
    WORKER1 --> REDIS
    WORKER2 --> API
    WORKER2 --> PG
    WORKER2 --> REDIS
    WORKER1 --> TC
    WORKER1 --> JC
    WORKER2 --> TC
    WORKER2 --> JC
    API --> SENTRY
    WORKER1 --> SENTRY
    WORKER2 --> SENTRY
    PG --> VOLUMES
    REDIS --> VOLUMES
    
    style PG fill:#10B981
    style REDIS fill:#DC2626
    style WORKER1 fill:#F59E0B
    style WORKER2 fill:#F59E0B
```

### Docker Compose Architecture

```mermaid
graph TB
    subgraph "Docker Compose Stack"
        subgraph "Application Services"
            API[api-backend:3000<br/>Docker Image]
            AW[admin-web:3001<br/>Docker Image]
            BOT[telegram-bot<br/>Docker Image]
            WORKER[bullmq-worker<br/>Docker Image]
        end
        
        subgraph "Database & Cache"
            PG[(PostgreSQL:5432<br/>Docker Image)]
            REDIS[(Redis:6379<br/>Docker Image)]
        end
        
        subgraph "Volumes"
            PG_VOL[(PostgreSQL Data)]
            REDIS_VOL[(Redis Data)]
            APP_VOL[(Application Files)]
        end
    end
    
    API --> PG
    API --> REDIS
    AW --> API
    BOT --> API
    BOT --> REDIS
    WORKER --> API
    WORKER --> PG
    WORKER --> REDIS
    PG --> PG_VOL
    REDIS --> REDIS_VOL
    API --> APP_VOL
    AW --> APP_VOL
    
    style PG fill:#10B981
    style REDIS fill:#DC2626
    style PG_VOL fill:#10B981
    style REDIS_VOL fill:#DC2626
```

### VPS Requirements

**Minimum VPS Specifications**:
- **CPU**: 2-4 cores
- **RAM**: 4-8 GB
- **Storage**: 50-100 GB SSD
- **OS**: Ubuntu 22.04 LTS or Debian 12
- **Network**: Public IP with ports 80, 443, 22 open

**Recommended VPS Specifications** (Production):
- **CPU**: 4-8 cores
- **RAM**: 8-16 GB
- **Storage**: 100-200 GB SSD
- **Backup**: Automated daily backups
- **Monitoring**: Resource monitoring (htop, netdata)

### Docker Setup

**Services**:
- `api-backend` - NestJS API (port 3000)
- `admin-web` - Next.js admin dashboard (port 3001)
- `telegram-bot` - Unified Telegram bot
- `bullmq-worker` - Background job workers (scalable)
- `postgres` - PostgreSQL 16+ (port 5432, internal only)
- `redis` - Redis 7+ (port 6379, internal only)

**Volumes**:
- `postgres_data` - Persistent PostgreSQL data
- `redis_data` - Persistent Redis data
- `app_storage` - Application files, CVs, uploads

### Service Access

Services are directly accessible via their exposed ports:

- **API Backend**: `http://your-vps-ip:3000` or domain pointing to port 3000
- **Admin Web**: `http://your-vps-ip:3001` or domain pointing to port 3001
- **Telegram Bot**: Webhook configured to point directly to bot service
- **PostgreSQL**: Internal only (port 5432, not exposed externally)
- **Redis**: Internal only (port 6379, not exposed externally)

**Note**: For production, consider adding a reverse proxy (Nginx/Caddy) later for SSL/TLS termination and domain routing.

## 🗄️ Database Schema

### PostgreSQL Schema Design

Using PostgreSQL 16+ with JSONB for flexible fields and strong relational integrity.

### Entity Relationship Diagram

```mermaid
erDiagram
    TALENT ||--o{ AUDIT_LOG : generates
    JOB ||--o{ AUDIT_LOG : generates
    ADMIN ||--o{ TALENT : approves
    ADMIN ||--o{ JOB : creates
    ADMIN ||--o{ AUDIT_LOG : performs
    
    TALENT {
        uuid id PK
        bigint telegramId UK "Indexed"
        varchar name
        enum serviceCategory "Indexed"
        varchar roleSpecialization
        text[] skills "GIN Index"
        enum experienceLevel
        enum availability "Indexed"
        enum engagementPreference
        varchar cvUrl
        enum status "Indexed"
        jsonb metadata "JSONB for flexible fields"
        timestamptz createdAt
        timestamptz updatedAt
    }
    
    JOB {
        uuid id PK
        uuid createdBy FK "References ADMIN"
        enum serviceCategory "Indexed"
        varchar title
        text description "Full-text search"
        text[] requiredSkills "GIN Index"
        enum engagementType
        varchar duration
        enum status "Indexed"
        jsonb metadata "JSONB for flexible fields"
        timestamptz createdAt
        timestamptz updatedAt
    }
    
    ADMIN {
        uuid id PK
        varchar email UK "Indexed"
        varchar passwordHash
        enum role
        bigint[] telegramIds "Array of Telegram IDs"
        jsonb preferences
        timestamptz createdAt
        timestamptz lastLoginAt
    }
    
    AUDIT_LOG {
        uuid id PK
        uuid userId FK "References ADMIN"
        varchar action
        varchar resourceType
        uuid resourceId
        jsonb metadata "JSONB for flexible audit data"
        timestamptz timestamp "Indexed"
    }
```

### Key Indexes

```sql
-- Performance-critical indexes
CREATE INDEX idx_talent_telegram_id ON talents(telegram_id);
CREATE INDEX idx_talent_status ON talents(status) WHERE status = 'approved';
CREATE INDEX idx_talent_category ON talents(service_category);
CREATE INDEX idx_talent_skills ON talents USING GIN(skills);
CREATE INDEX idx_job_status ON jobs(status) WHERE status = 'published';
CREATE INDEX idx_job_category ON jobs(service_category);
CREATE INDEX idx_job_skills ON jobs USING GIN(required_skills);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
```

### Future: pgvector Extension

For semantic matching (Phase 2+):

```sql
-- Enable pgvector for embeddings
CREATE EXTENSION vector;

-- Add embedding columns
ALTER TABLE talents ADD COLUMN skill_embeddings vector(1536);
ALTER TABLE jobs ADD COLUMN skill_embeddings vector(1536);

-- Vector similarity index
CREATE INDEX idx_talent_embeddings ON talents 
USING ivfflat (skill_embeddings vector_cosine_ops);
```

## 🔄 Event-Driven Architecture

### BullMQ-Based Job Queue System

Using BullMQ (Redis-backed) for reliable, observable job processing instead of external automation tools.

### Event Flow

```mermaid
graph LR
    subgraph "Event Sources"
        API[API Backend]
        BOT[Unified Bot]
        ADMIN[Admin Actions]
    end
    
    subgraph "Event Bus"
        EBUS[EventEmitter2<br/>In-Process Events]
    end
    
    subgraph "Job Queue (BullMQ)"
        QUEUE[Redis Queue]
        WORKER1[Worker: Publishing]
        WORKER2[Worker: Notifications]
        WORKER3[Worker: Matching]
    end
    
    subgraph "Actions"
        PUB[Publish to Channel]
        NOTIFY[Send Notifications]
        CALC[Calculate Matches]
        LOG[Audit Logger]
    end
    
    API --> EBUS
    BOT --> EBUS
    ADMIN --> EBUS
    
    EBUS --> QUEUE
    QUEUE --> WORKER1
    QUEUE --> WORKER2
    QUEUE --> WORKER3
    
    WORKER1 --> PUB
    WORKER2 --> NOTIFY
    WORKER3 --> CALC
    EBUS --> LOG
    LOG --> SAVE[(PostgreSQL)]
    
    style EBUS fill:#4F46E5
    style QUEUE fill:#DC2626
    style WORKER1 fill:#F59E0B
    style WORKER2 fill:#F59E0B
    style WORKER3 fill:#F59E0B
```

### Job Queue Architecture

```mermaid
sequenceDiagram
    participant API as API Backend
    participant EVT as EventEmitter
    participant QUEUE as BullMQ Queue
    participant REDIS as Redis
    participant WORKER as Worker Process
    participant TG as Telegram API
    
    API->>EVT: Emit: talent.approved
    EVT->>QUEUE: Add job: publishTalent
    QUEUE->>REDIS: Store job
    REDIS-->>QUEUE: Job queued
    
    WORKER->>REDIS: Poll for jobs
    REDIS-->>WORKER: Job available
    WORKER->>API: GET /api/v1/talents/:id
    API-->>WORKER: Talent data
    WORKER->>TG: Publish to channel
    TG-->>WORKER: Success
    WORKER->>REDIS: Mark job complete
    WORKER->>API: Update status
```

### Event Types

```mermaid
graph TD
    EVENTS[Event Types] --> TALENT_EVENTS[Talent Events]
    EVENTS --> JOB_EVENTS[Job Events]
    EVENTS --> MATCH_EVENTS[Matching Events]
    EVENTS --> ADMIN_EVENTS[Admin Events]
    
    TALENT_EVENTS --> T1[talent.created]
    TALENT_EVENTS --> T2[talent.updated]
    TALENT_EVENTS --> T3[talent.approved]
    TALENT_EVENTS --> T4[talent.rejected]
    
    JOB_EVENTS --> J1[job.created]
    JOB_EVENTS --> J2[job.updated]
    JOB_EVENTS --> J3[job.published]
    JOB_EVENTS --> J4[job.archived]
    
    MATCH_EVENTS --> M1[match.calculated]
    MATCH_EVENTS --> M2[match.updated]
    
    ADMIN_EVENTS --> A1[admin.action]
    
    style EVENTS fill:#4F46E5
```

## 🛠️ Technology Stack

### Technology Stack Diagram

```mermaid
graph TB
    subgraph "Frontend"
        NEXT[Next.js 15]
        REACT[React 19]
        TAILWIND[Tailwind CSS v4]
        SHADCN[shadcn/ui]
        RQ[React Query<br/>Optional]
    end
    
    subgraph "Backend"
        NEST[NestJS]
        TS[TypeScript]
        PRISMA[Prisma<br/>ORM]
    end
    
    subgraph "Telegram Bot"
        GRAMMY[grammY]
        SCENES[Scene Manager]
        REDIS_SESS[Redis Sessions]
    end
    
    subgraph "Database & Cache"
        PG[PostgreSQL 16+]
        REDIS[(Redis)]
        JSONB[JSONB Fields]
        GIN[GIN Indexes]
    end
    
    subgraph "Queue System"
        BULLMQ[BullMQ]
        WORKERS[Worker Processes]
    end
    
    subgraph "Observability"
        SENTRY[Sentry]
        PINO[Pino Logger]
    end
    
    subgraph "Deployment"
        VPS[Linux VPS]
        DOCKER[Docker + Docker Compose]
    end
    
    NEXT --> REACT
    NEXT --> TAILWIND
    NEXT --> SHADCN
    NEXT --> NEST
    
    NEST --> TS
    NEST --> PRISMA[Prisma<br/>ORM]
    NEST --> PG
    NEST --> REDIS
    NEST --> BULLMQ
    NEST --> SENTRY
    NEST --> PINO
    
    GRAMMY --> NEST
    GRAMMY --> REDIS_SESS
    REDIS_SESS --> REDIS
    
    BULLMQ --> REDIS
    WORKERS --> BULLMQ
    WORKERS --> NEST
    WORKERS --> PG
    
    PG --> JSONB
    PG --> GIN
    
    DOCKER --> NEST
    DOCKER --> NEXT
    DOCKER --> GRAMMY
    DOCKER --> PG
    DOCKER --> REDIS
    VPS --> DOCKER
    
    style NEXT fill:#8B5CF6
    style NEST fill:#4F46E5
    style PG fill:#10B981
    style REDIS fill:#DC2626
    style BULLMQ fill:#F59E0B
    style GRAMMY fill:#06B6D4
    style SENTRY fill:#362D59
```

### Technology Choices & Rationale

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Database** | PostgreSQL 16+ | Strong consistency, transactions, GIN indexes for arrays, future pgvector support |
| **Cache/Queue** | Redis | Session storage, job queues (BullMQ), rate limiting |
| **Queue System** | BullMQ | Reliable, observable, Redis-backed, better than n8n for production |
| **Bot Framework** | **grammY** (preferred) | Modern, TypeScript-first, better DX, plugins, performance. Telegraf is solid but grammY has overtaken in 2026 |
| **ORM** | **Prisma** | Type-safe database access, excellent TypeScript support, robust migrations, superior DX |
| **Frontend** | Next.js 15.5+ | Next.js 15.5+ adds stable Turbopack builds. Full-stack capabilities with Server Actions |
| **Observability** | Sentry + Pino | Error tracking + structured logging (MVP-appropriate) |
| **Queue Monitoring** | BullMQ Board or Upqueue.io | Essential for debugging silent failures, job monitoring |
| **File Storage** | **Docker Volumes** | Docker volumes for all environments (dev/staging/prod). Simple, cost-effective, adequate for MVP scale |
| **Deployment** | **VPS + Docker** | Linux VPS with Docker Compose. Full control, cost-effective, scalable |

## 📊 System Scalability

### Horizontal Scaling Strategy

```mermaid
graph TB
        subgraph "Load Balancer"
        LB[Load Balancer<br/>Optional for Scaling]
    end
    
    subgraph "API Tier (Stateless)"
        API1[API Instance 1]
        API2[API Instance 2]
        API3[API Instance N...]
    end
    
    subgraph "Web Tier (Stateless)"
        WEB1[Web Instance 1]
        WEB2[Web Instance 2]
        WEB3[Web Instance N...]
    end
    
    subgraph "Bot Tier (Stateful)"
        BOT[Unified Bot<br/>Sticky Sessions or<br/>Redis Session Store]
    end
    
    subgraph "Worker Tier"
        WORKER1[BullMQ Worker 1]
        WORKER2[BullMQ Worker 2]
        WORKER3[BullMQ Worker N...]
    end
    
    subgraph "Database Tier"
        PG_PRIMARY[(PostgreSQL Primary)]
        PG_REPLICA1[(PostgreSQL Replica 1)]
        PG_REPLICA2[(PostgreSQL Replica 2)]
    end
    
    subgraph "Cache/Queue Tier"
        REDIS_CLUSTER[(Redis Cluster)]
    end
    
    LB --> API1
    LB --> API2
    LB --> API3
    LB --> WEB1
    LB --> WEB2
    LB --> WEB3
    
    API1 --> PG_PRIMARY
    API2 --> PG_PRIMARY
    API3 --> PG_PRIMARY
    API1 --> REDIS_CLUSTER
    API2 --> REDIS_CLUSTER
    API3 --> REDIS_CLUSTER
    
    BOT --> API1
    BOT --> API2
    BOT --> REDIS_CLUSTER
    
    WORKER1 --> PG_PRIMARY
    WORKER1 --> REDIS_CLUSTER
    WORKER2 --> PG_PRIMARY
    WORKER2 --> REDIS_CLUSTER
    
    PG_PRIMARY --> PG_REPLICA1
    PG_PRIMARY --> PG_REPLICA2
    
    style LB fill:#3B82F6
    style PG_PRIMARY fill:#10B981
    style REDIS_CLUSTER fill:#DC2626
    style BOT fill:#06B6D4
```

### Scaling Considerations

- **API & Web**: Stateless, scale horizontally easily
- **Bot**: Stateful (conversation state), use Redis session store for stateless scaling
- **Workers**: Stateless job processing, scale based on queue depth
- **PostgreSQL**: Read replicas for read-heavy workloads
- **Redis**: Cluster mode for high availability

## 🔒 Security Architecture

### Security Layers

```mermaid
graph TB
    subgraph "External Layer"
        INTERNET[Internet]
    end
    
    subgraph "Network Layer"
        FIREWALL[Firewall]
    end
    
    subgraph "Application Layer"
        MW[Middleware<br/>Auth Check]
        RBAC[Role-Based Access]
        VALID[Input Validation]
        RATE[Rate Limiting]
    end
    
    subgraph "Data Layer"
        ENCRYPT[Data Encryption]
        AUDIT[Audit Logging]
    end
    
    INTERNET --> FIREWALL
    FIREWALL --> LB
    LB --> MW
    MW --> RBAC
    RBAC --> VALID
    VALID --> RATE
    RATE --> ENCRYPT
    ENCRYPT --> AUDIT
    
    style FIREWALL fill:#EF4444
    style LB fill:#3B82F6
    style RBAC fill:#F59E0B
    style ENCRYPT fill:#10B981
```

## 📈 Monitoring & Observability

### MVP-Optimized Observability Stack

For Phase 1 (MVP), focus on essential observability without over-engineering.

```mermaid
graph LR
    subgraph "Application"
        API[API Backend]
        BOT[Telegram Bot]
        WEB[Admin Web]
        WORKER[BullMQ Workers]
    end
    
    subgraph "Error Tracking"
        SENTRY[Sentry<br/>Error Monitoring]
    end
    
    subgraph "Logging"
        PINO[Pino<br/>Structured Logging]
        STDOUT[stdout/stderr]
    end
    
    subgraph "Queue Monitoring"
        BULLMQ_UI[BullMQ Board<br/>or Upqueue.io<br/>Essential]
    end
    
    API --> SENTRY
    API --> PINO
    BOT --> SENTRY
    BOT --> PINO
    WEB --> SENTRY
    WORKER --> SENTRY
    WORKER --> PINO
    
    PINO --> STDOUT
    WORKER --> BULLMQ_UI
    
    style SENTRY fill:#362D59
    style PINO fill:#10B981
    style BULLMQ_UI fill:#F59E0B
```

### Production Essentials

#### Queue Monitoring (Critical)

**Why it matters**: Silent failures in job queues are a common production pain point. Early monitoring prevents missed publications and notifications.

```mermaid
graph TB
    QUEUE[BullMQ Queue] --> REDIS[(Redis)]
    REDIS --> MONITOR[BullMQ Board<br/>or Upqueue.io]
    MONITOR --> ALERTS[Alert on Failures]
    MONITOR --> METRICS[Job Metrics]
    MONITOR --> RETRY[Manual Retry]
    
    style MONITOR fill:#F59E0B
    style ALERTS fill:#EF4444
```

**Recommended Tools**:
- **BullMQ Board**: Open-source, self-hosted dashboard
- **Upqueue.io**: Managed service with better UX
- **Integration**: Expose via `/admin/queues` route in admin dashboard

**Key Metrics to Monitor**:
- Failed jobs count
- Job processing time
- Queue depth
- Retry attempts
- Dead letter queue

#### Rate Limiting

```mermaid
graph LR
    REQ[Incoming Request] --> RL[Rate Limiter]
    RL --> REDIS[(Redis<br/>Rate Limit Store)]
    REDIS --> CHECK{Within Limit?}
    CHECK -->|Yes| ALLOW[Allow Request]
    CHECK -->|No| REJECT[429 Too Many Requests]
    
    style RL fill:#F59E0B
    style REJECT fill:#EF4444
```

- **API Rate Limiting**: Per-IP, per-user limits
- **Telegram Bot**: Per-chat, per-user flood control
- **Redis-based**: Distributed rate limiting

#### File/CV Handling

```mermaid
graph LR
    TG[Telegram File] --> DOWNLOAD[Download via file_id<br/>Within 24h]
    DOWNLOAD --> VALIDATE[Validate File Type/Size]
    VALIDATE --> STORE[Store in Object Storage]
    STORE --> DB[(PostgreSQL<br/>Store URL)]
    STORE --> CLEANUP[TTL Cleanup Job<br/>BullMQ Worker]
    
    style STORE fill:#10B981
    style CLEANUP fill:#F59E0B
```

**Storage Strategy**:
- **Telegram file_id**: Temporary reference, download immediately (expires in 24h)
- **Object Storage Options**:
  - **Docker Volumes**: Local storage on VPS (for MVP, persistent volumes)
  - **External S3**: AWS S3, DigitalOcean Spaces, or MinIO (for production/scalability)
- **Storage Pattern**:
  - Download from Telegram within 24h window
  - Store in object storage with unique keys (UUID-based)
  - Store URL in PostgreSQL (not file_id)
  - Original file_id discarded after download
- **Expiration**: TTL-based cleanup job (BullMQ worker, runs daily)
- **Antivirus**: Optional scanning for uploaded files (ClamAV or cloud service)
- **CDN**: Optional CDN for CV downloads (Cloudflare, etc.)

#### Session Management

- **Bot Sessions**: Redis-backed (stateless scaling)
- **Web Sessions**: HTTP-only cookies + Redis for server-side validation
- **TTL**: Automatic expiration

---

## 📝 Architecture Decisions

### Key Decisions (2026 Production-Ready)

#### Critical Decisions

1. **Prisma over TypeORM (ORM Selection)**
   - **Decision**: Prisma selected for superior type safety, better developer experience, and robust migration system
   - **Rationale**: TypeScript-first approach, compile-time type safety, excellent NestJS integration via `@nestjs/prisma`
   - **Benefit**: Self-documenting schema, automatic type generation, better IDE support, easier onboarding
   - **Documentation**: See [Decision 001: ORM Selection](../decisions/001-orm-selection.md)
   - **Trade-off**: Slightly less flexible for very complex raw SQL, but supports raw queries when needed

2. **Docker Volumes for File Storage (All Environments)**
   - **Decision**: Docker volumes for development, staging, and production
   - **Rationale**: Simple setup, cost-effective, adequate for MVP scale (1000+ users), easy backup strategy
   - **Benefit**: No additional infrastructure, fast local access, full control, can migrate to S3 later if needed
   - **Documentation**: See [Decision 002: File Storage Strategy](../decisions/002-file-storage-strategy.md)
   - **Trade-off**: Single-server constraint, but sufficient for initial production scale

3. **Notification & Rate Limiting Strategy**
   - **Decision**: Telegram as primary channel, comprehensive rate limiting with Redis
   - **Rationale**: Users already in Telegram ecosystem, real-time delivery, no additional infrastructure
   - **Rate Limits**: 
     - Bot: 15 messages/hour per user, 30 commands/hour
     - API: 100 requests/minute per user, 200 requests/minute per IP
     - Auth: 5 requests/15 minutes per IP
   - **Documentation**: See [Decision 003: Notification & Rate Limiting](../decisions/003-notification-rate-limiting.md)
   - **Trade-off**: Telegram-only for MVP, email/SMS can be added in Phase 2

4. **PostgreSQL over MongoDB**
   - **Rationale**: Strong consistency, transactions, GIN indexes for array queries, future pgvector support
   - **Benefit**: Predictable performance, relational integrity, better for matching queries
   - **Trade-off**: Slightly less flexible schema, but JSONB provides flexibility where needed

5. **BullMQ over n8n**
   - **Rationale**: Production reliability, observable, Redis-backed, no external service dependency
   - **Benefit**: Better error handling, retry logic, job monitoring, cost-effective
   - **Trade-off**: Less visual, but more reliable for mission-critical workflows

6. **Unified Telegram Bot**
   - **Rationale**: Single bot with role-based access reduces code duplication, operational complexity
   - **Benefit**: One webhook endpoint, shared rate limiting, easier maintenance
   - **Trade-off**: Slightly more complex role management, but cleaner architecture

7. **Redis for Sessions & Queues**
   - **Rationale**: Stateless bot scaling, distributed rate limiting, job queue backend
   - **Benefit**: Horizontal scaling, shared state across instances
   - **Trade-off**: Additional infrastructure, but essential for production

#### Medium Priority Decisions

8. **On-the-Fly Matching**
   - **Rationale**: Real-time accuracy, reduced database writes, simpler architecture
   - **Benefit**: Always up-to-date, no stale match data
   - **Trade-off**: Slightly higher compute per request, but cacheable

9. **VPS + Docker Deployment**
   - **Rationale**: Full control, cost-effective, no vendor lock-in, existing VPS available
   - **Benefit**: Complete control over infrastructure, predictable costs, Docker simplifies deployment
   - **Trade-off**: Requires manual setup and maintenance, but provides flexibility

10. **MVP-Optimized Observability**
   - **Rationale**: Sentry + Pino sufficient for MVP, avoid over-engineering
   - **Benefit**: Focus on essentials, add Prometheus/Grafana later if needed
   - **Trade-off**: Less detailed metrics initially, but adequate for Phase 1

#### Future Considerations

11. **Next.js 15.5+**
   - **Current**: Next.js 15.5+ with stable Turbopack builds for full-stack capabilities
   - **Rationale**: Server Actions, caching, and Turbopack performance
   - **Decision**: Next.js 15.5+ for optimal full-stack development experience

12. **pgvector for Semantic Matching**
   - **Timing**: Phase 2+ when AI-enhanced matching needed
   - **Preparation**: PostgreSQL choice enables easy migration
   - **Current**: Rule-based matching sufficient for MVP

13. **Horizontal Scaling Strategy**
    - **API/Web**: Stateless, scale easily
    - **Bot**: Redis sessions enable stateless scaling
    - **Workers**: Scale based on queue depth
    - **Database**: Read replicas for read-heavy workloads

### Decision Log

| Decision | Date | Status | Rationale |
|----------|------|--------|-----------|
| PostgreSQL over MongoDB | 2025-01 | ✅ Adopted | Consistency, transactions, indexing |
| BullMQ over n8n | 2025-01 | ✅ Adopted | Reliability, observability |
| Unified Bot | 2025-01 | ✅ Adopted | Reduced complexity |
| Redis Sessions | 2025-01 | ✅ Adopted | Stateless scaling |
| On-the-Fly Matching | 2025-01 | ✅ Adopted | Real-time accuracy |
| VPS + Docker Deployment | 2025-01 | ✅ Adopted | Full control, cost-effective, existing VPS available |
| Sentry + Pino | 2025-01 | ✅ Adopted | MVP-appropriate observability |

---

**Last Updated**: 2025-01-XX  
**Version**: 2.0.0 (Updated per 2026 production recommendations)

