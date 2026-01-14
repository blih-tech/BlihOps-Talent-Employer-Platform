# Architecture Diagrams (ASCII Fallback)

ASCII-based architecture diagrams for environments where Mermaid is not supported.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    BlihOps Talent Platform                       │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐                    ┌──────────────┐
│ Unified Bot  │                    │  Admin Web   │
│  (Telegram)  │                    │  (Next.js)   │
│ Role-Based   │                    │              │
└──────┬───────┘                    └──────┬───────┘
       │                                    │
       └────────────────────────────────────┘
                         │
                  ┌──────▼──────┐
                  │ API Backend │
                  │  (NestJS)   │
                  └──────┬──────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
│PostgreSQL    │  │    Redis    │  │ Telegram API │
│  (Database)  │  │ (Sessions + │  │              │
│              │  │   Queues)   │  │              │
└──────┬───────┘  └──────┬───────┘  └──────────────┘
       │                 │
       └────────┬────────┘
                │
         ┌──────▼──────┐
         │ BullMQ      │
         │ Workers     │
         └──────┬──────┘
                │
        ┌───────┼───────┐
        │       │       │
┌───────▼──┐ ┌──▼────┐ ┌──▼────────┐
│ Talent   │ │ Job   │ │ (Future:  │
│ Channel  │ │Channel│ │ Email,    │
│(Telegram)│ │(Telegram)│ SMS)    │
└──────────┘ └───────┘ └───────────┘
```

## Monorepo Structure

```
BlihOps-Talent-Platform/
│
├── packages/
│   ├── core/              ──┐
│   │   ├── logger/         │ Infrastructure layer
│   │   ├── exceptions/     │ (domain-agnostic)
│   │   ├── config/         │
│   │   └── events/         │
│   │                        │
│   ├── shared/             ──┐
│   │   ├── types/           │ Business domain layer
│   │   ├── constants/       │ (domain-specific)
│   │   ├── utils/           │
│   │   └── schemas/         │
│   │                        │
│   ├── api-backend/        ──┐
│   │   └── src/             │
│   │       ├── modules/     │ Backend API
│   │       │   ├── auth/    │ (NestJS)
│   │       │   ├── talent/  │
│   │       │   ├── jobs/    │
│   │       │   └── matching/│
│   │       └── main.ts      │
│   │                        │
│   ├── telegram-bot/       ──┐
│   │   └── src/             │ Unified Telegram Bot
│   │       ├── handlers/    │ (grammY)
│   │       ├── scenes/      │ (Talent + Admin)
│   │       ├── workflows/   │
│   │       └── services/    │
│   │                        │
│   └── admin-web/          ──┐
│       └── src/              │ Next.js 15.5+
│           ├── app/          │ Dashboard
│           ├── components/   │
│           └── actions/      │
│
├── infrastructure/
│   └── docker/               Docker + Docker Compose configs
│
└── tests/
    └── e2e/                   E2E tests
```

## Data Flow - Talent Onboarding

```
┌──────┐
│ User │
└──┬───┘
   │ /start
   ▼
┌─────────────┐
│ Talent Bot │
└──┬──────────┘
   │ POST /api/v1/talents
   ▼
┌──────────────┐
│ API Backend  │
└──┬───────────┘
   │ Save to DB
   ▼
┌──────────┐
│ MongoDB  │
└──┬───────┘
   │ Event: talent.created
   ▼
┌──────────┐
│ Event Bus│
└──┬───────┘
   │
   ├──► n8n Workflow
   │    │
   │    ├──► Check approval
   │    │
   │    └──► Publish to Telegram Channel
   │
   └──► Notification Service
```

## Data Flow - Job Creation

```
┌───────┐
│ Admin │
└───┬───┘
    │ /create_job
    ▼
┌──────────────┐
│ Employer Bot │
└──┬───────────┘
   │ POST /api/v1/jobs
   ▼
┌──────────────┐
│ API Backend  │
└──┬───────────┘
   │ Save to DB
   ▼
┌──────────┐
│ MongoDB  │
└──┬───────┘
   │ Event: job.created
   ▼
┌──────────┐
│ Event Bus│
└──┬───────┘
   │
   ├──► n8n Workflow
   │    │
   │    ├──► Check approval
   │    │
   │    ├──► Publish to Telegram Channel
   │    │
   │    └──► Trigger Matching Algorithm
   │
   └──► Notification Service
```

## Matching Algorithm Flow

```
Job Created/Updated
       │
       ▼
┌──────────────┐
│ Fetch Job    │
│ Details      │
└──┬───────────┘
   │
   ▼
┌──────────────┐
│ Query All    │
│ Talents      │
└──┬───────────┘
   │
   ▼
┌─────────────────────────────────┐
│ For Each Talent:                │
│                                 │
│ 1. Check Service Category Match │
│    └─► Score: 0-30              │
│                                 │
│ 2. Calculate Skill Overlap      │
│    └─► Score: 0-40              │
│                                 │
│ 3. Check Experience Level       │
│    └─► Score: 0-20              │
│                                 │
│ 4. Check Availability Match     │
│    └─► Score: 0-10              │
│                                 │
│ Total Score = Sum of all        │
└──┬──────────────────────────────┘
   │
   ▼
┌──────────────┐
│ Rank by      │
│ Score        │
└──┬───────────┘
   │
   ▼
┌──────────────┐
│ Save Matches │
│ to Database  │
└──┬───────────┘
   │
   ▼
┌──────────────┐
│ Notify Admin │
└──────────────┘
```

## Authentication Flow

### Web Authentication

```
User Request
    │
    ▼
┌──────────────┐
│ Middleware   │
│ Auth Check   │
└──┬───────────┘
   │
   ├──► Not Authenticated
   │    │
   │    ▼
   │ ┌──────────┐
   │ │ /login   │
   │ └──┬───────┘
   │    │ Submit credentials
   │    ▼
   │ ┌──────────────┐
   │ │ POST /auth/  │
   │ │ login        │
   │ └──┬───────────┘
   │    │ Verify & Generate JWT
   │    ▼
   │ ┌──────────────┐
   │ │ Store in     │
   │ │ HTTP-only    │
   │ │ Cookie       │
   │ └──┬───────────┘
   │    │
   └──► Authenticated
        │
        ▼
   ┌──────────────┐
   │ Allow Access │
   └──────────────┘
```

### Telegram Bot Authentication

```
User sends /start
    │
    ▼
┌──────────────┐
│ Extract      │
│ Telegram ID  │
└──┬───────────┘
   │
   ▼
┌──────────────┐
│ Check if     │
│ User Exists  │
└──┬───────────┘
   │
   ├──► Exists
   │    │
   │    ▼
   │ ┌──────────────┐
   │ │ Show Profile │
   │ └──────────────┘
   │
   └──► New User
        │
        ▼
   ┌──────────────┐
   │ Start        │
   │ Onboarding   │
   └──────────────┘
```

## Database Schema

```
┌─────────────┐
│   TALENT    │
├─────────────┤
│ id (PK)     │
│ telegramId  │
│ name        │
│ category    │
│ skills[]    │
│ experience  │
│ status      │
└──────┬──────┘
       │
       │ 1:N
       │
┌──────▼──────┐
│   MATCH     │
├─────────────┤
│ id (PK)     │
│ talentId(FK)│──┐
│ jobId (FK)  │──┤
│ score       │  │
└─────────────┘  │
                 │
┌─────────────┐  │
│     JOB     │  │
├─────────────┤  │
│ id (PK)     │◄─┘
│ createdBy   │
│ title       │
│ category    │
│ skills[]    │
│ status      │
└─────────────┘
```

## Deployment Architecture

```
                    ┌──────────────┐
                    │   Internet   │
                    └──────┬───────┘
                           │
                    ┌──────▼──────┐
                    │   Nginx      │
                    │ Load Balancer│
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼──────┐  ┌────────▼────────┐  ┌─────▼──────┐
│ API Backend  │  │   Admin Web    │  │   Bots     │
│ Instance 1   │  │   Instance 1   │  │ (Talent &  │
└──────┬───────┘  └────────────────┘  │ Employer)  │
       │                                └─────┬──────┘
┌──────▼──────┐                              │
│ API Backend │                              │
│ Instance 2 │                              │
└──────┬──────┘                              │
       │                                     │
       └──────────────┬──────────────────────┘
                      │
              ┌───────▼───────┐
              │   MongoDB     │
              │ Replica Set   │
              └───────────────┘
```

## Event Flow

```
┌──────────────┐
│ API Backend   │
│ (Event Source)│
└──────┬───────┘
       │
       │ Emit Event
       ▼
┌──────────────┐
│ Event Bus    │
│ (EventEmitter)│
└──────┬───────┘
       │
   ┌───┴───┬──────────┬──────────┐
   │       │          │          │
   ▼       ▼          ▼          ▼
┌─────┐ ┌─────┐  ┌────────┐  ┌──────┐
│ n8n │ │Log  │  │Match   │  │Notify│
│Hook │ │Audit│  │Trigger │  │Email │
└─────┘ └─────┘  └────────┘  └──────┘
```

---

**Note**: For interactive Mermaid diagrams, see [architecture.md](./architecture.md)


