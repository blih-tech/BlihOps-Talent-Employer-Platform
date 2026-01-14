# Architecture Quick Reference

Quick reference guide for the BlihOps Talent Platform architecture.

## 🏗️ System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    BlihOps Talent Platform                   │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐
│ Unified Bot  │         │  Admin Web   │
│  (Telegram)  │         │  (Next.js)    │
│ Role-Based   │         │              │
└──────┬───────┘         └──────┬───────┘
       │                        │
       └────────────────────────┘
                         │
                    ┌────▼────┐
                    │   API   │
                    │ Backend │
                    │ (NestJS)│
                    └────┬────┘
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
┌──────▼─────┐  ┌────────▼────────┐  ┌────▼──────┐
│PostgreSQL  │  │ BullMQ Workers  │  │  Telegram │
│  Database  │  │  (Redis Queue)  │  │   API     │
└──────┬─────┘  └────────┬─────────┘  └──────────┘
       │                 │
       └────────┬────────┘
                │
         ┌──────▼──────┐
         │    Redis    │
         │ (Sessions + │
         │   Queues)   │
         └─────────────┘
```

## 📦 Package Dependencies

```
packages/
├── core/          (Infrastructure - no dependencies on other packages)
├── shared/        (Domain types - depends on core/)
├── api-backend/   (Depends on core/ + shared/)
├── telegram-bot/  (Depends on core/ + shared/)
└── admin-web/     (Depends on core/ + shared/)
```

## 🔄 Request Flow

### Talent Onboarding
```
User → Unified Bot → API Backend → PostgreSQL
      (talent role)      ↓
                   Event Bus
                      ↓
                  BullMQ Queue
                      ↓
                  Worker → Telegram Channel
```

### Job Creation
```
Admin → Unified Bot → API Backend → PostgreSQL
      (admin role)        ↓
                       Event Bus
                          ↓
                      BullMQ Queue
                          ↓
                      Worker → Telegram Channel
                          ↓
                  Matching Algorithm (on-the-fly)
```

### Admin Dashboard
```
Admin → Admin Web → API Backend → PostgreSQL
      (Next.js 15)    (NestJS)      (Redis cache)
```

## 🗄️ Database Tables (PostgreSQL)

- `talents` - Talent profiles (with GIN indexes on skills)
- `jobs` - Job postings (with GIN indexes on required_skills)
- `admins` - Admin users
- `audit_logs` - Activity logs
- **Note**: Matches computed on-the-fly (not stored, cached in Redis)

## 🔐 Authentication Methods

1. **Web (Admin Dashboard)**: JWT tokens via Auth.js v5
2. **Telegram Bots**: Telegram user ID verification
3. **API**: JWT Bearer tokens

## 📡 API Endpoints Structure

```
/api/v1/
├── auth/          (Authentication)
├── talents/       (Talent management)
├── jobs/          (Job management)
├── matching/      (Matching logic)
├── admin/         (Admin operations)
└── telegram/      (Webhook handlers)
```

## 🎯 Matching Algorithm

**Scoring Formula:**
```
Total Score = 
  (Service Category Match × 0.3) +
  (Skill Overlap × 0.4) +
  (Experience Level × 0.2) +
  (Availability × 0.1)
```

## 🚀 Deployment Ports (VPS + Docker)

- API Backend: `3000`
- Admin Web: `3001`
- PostgreSQL: `5432` (internal only)
- Redis: `6379` (internal only)
- **Deployment**: Linux VPS with Docker Compose

## 🔔 Event Types

**Talent Events:**
- `talent.created`
- `talent.updated`
- `talent.approved`
- `talent.rejected`

**Job Events:**
- `job.created`
- `job.updated`
- `job.published`
- `job.archived`

**Matching Events:**
- `match.calculated`
- `match.updated`

## 📊 Key Metrics

- Talent onboarding completion rate
- Job posting approval time
- Matching accuracy
- System uptime
- API response times

---

**See [architecture.md](./architecture.md) for detailed diagrams and explanations.**


