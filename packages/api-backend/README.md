# @blihops/api-backend

NestJS REST API backend for the BlihOps Talent Platform. Provides secure APIs for talent management, job management, matching logic, and administrative operations.

## 🎯 Overview

This is the core backend service that:
- Exposes REST APIs for the admin web application
- Handles webhook callbacks from unified Telegram bot
- Implements on-the-fly talent-job matching algorithms
- Manages authentication and authorization
- Provides administrative endpoints
- Runs BullMQ workers for background job processing

## 🏗️ Architecture

### Module Structure

```
src/
├── modules/
│   ├── auth/           # JWT authentication & authorization
│   ├── talent/         # Talent CRUD & profile management
│   ├── jobs/           # Job CRUD & management
│   ├── matching/       # Matching/recommendation logic
│   ├── notifications/  # Event-driven notifications
│   ├── telegram/       # Thin webhook handlers (unified bot is separate package)
│   └── admin/          # Admin-specific endpoints
├── common/             # Guards, interceptors, filters, decorators
├── config/             # Configuration modules
├── database/           # PostgreSQL models & repositories (TypeORM/Prisma)
└── main.ts             # Application entry point
```

## 📦 Key Modules

### Auth Module
- JWT token generation and validation
- Password hashing and verification
- Role-based access control (RBAC)
- Protected route guards

### Talent Module
- CRUD operations for talent profiles
- Profile approval workflows
- CV upload and management
- Talent filtering and search

### Jobs Module
- CRUD operations for job postings
- Job approval workflows
- Job status management
- Job filtering and search

### Matching Module
- Talent-job matching algorithm
- Relevance scoring
- Recommendation engine
- Match history tracking

### Notifications Module
- Event-driven notification system
- Integration with BullMQ workers
- Notification templates
- Delivery status tracking

### Telegram Module
- Webhook endpoints for unified bot callbacks
- Bot event processing
- Shared types and utilities
- **Note**: Bot logic is in separate package (`telegram-bot`)

### Admin Module
- Administrative endpoints
- Bulk operations
- Analytics and reporting
- System configuration

## 🚀 Getting Started

### Prerequisites

- Node.js 20.11+
- PostgreSQL 16+
- Redis 7+
- pnpm 8+

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Configure environment variables
# See .env.example for required variables
```

### Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/blihops

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Telegram
TELEGRAM_BOT_TOKEN=your-token
TELEGRAM_WEBHOOK_SECRET=your-secret
# Separate channels for jobs and talents
TELEGRAM_CHANNEL_ID_JOBS=-1002985721031  # Jobs channel for posting job opportunities
TELEGRAM_CHANNEL_ID_TALENTS=-1003451753461  # Talents channel for posting approved talent profiles

# BullMQ
BULLMQ_REDIS_URL=redis://localhost:6379

# Sentry (optional)
SENTRY_DSN=your-sentry-dsn
```

### Development

```bash
# Start in development mode
pnpm dev

# Start with watch mode
pnpm dev:watch

# Start in production mode
pnpm start:prod
```

### Testing

```bash
# Run unit tests
pnpm test

# Run e2e tests
pnpm test:e2e

# Run with coverage
pnpm test:cov
```

## 📡 API Endpoints

### Authentication

```
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
```

### Talents

```
GET    /api/v1/talents
GET    /api/v1/talents/:id
POST   /api/v1/talents
PATCH  /api/v1/talents/:id
DELETE /api/v1/talents/:id
GET    /api/v1/talents/:id/cv
POST   /api/v1/talents/:id/approve
POST   /api/v1/talents/:id/reject
```

### Jobs

```
GET    /api/v1/jobs
GET    /api/v1/jobs/:id
POST   /api/v1/jobs
PATCH  /api/v1/jobs/:id
DELETE /api/v1/jobs/:id
POST   /api/v1/jobs/:id/publish
POST   /api/v1/jobs/:id/archive
```

### Matching

```
GET    /api/v1/matching/jobs/:jobId/talents
GET    /api/v1/matching/talents/:talentId/jobs
POST   /api/v1/matching/calculate
```

### Admin

```
GET    /api/v1/admin/stats
GET    /api/v1/admin/analytics
POST   /api/v1/admin/bulk-approve
```

### Telegram Webhooks

```
POST   /api/v1/telegram/webhook
```

**Note**: Single webhook endpoint for unified bot (replaces separate talent/employer webhooks)

## 🔐 Authentication

The API uses JWT tokens for authentication:

1. Login with credentials → Receive access token
2. Include token in `Authorization: Bearer <token>` header
3. Token expires after configured time (default: 7 days)

### Protected Routes

Use the `@AuthGuard()` decorator:

```typescript
@UseGuards(AuthGuard)
@Get('protected')
async getProtectedData() {
  // Only authenticated users can access
}
```

### Role-Based Access

Use the `@Roles()` decorator:

```typescript
@Roles('admin')
@UseGuards(AuthGuard, RolesGuard)
@Get('admin-only')
async getAdminData() {
  // Only admins can access
}
```

## 🗄️ Database

### PostgreSQL Models

Models are defined using TypeORM or Prisma in `src/database/`:
- `Talent` - Talent profiles (with GIN indexes on skills array)
- `Job` - Job postings (with GIN indexes on required_skills array)
- `Admin` - Admin users
- `AuditLog` - Activity logs
- **Note**: Matches are computed on-the-fly, not stored (cached in Redis)

### Repositories

Use repositories for database operations:

```typescript
import { TalentRepository } from '@blihops/api-backend/database';

const talent = await this.talentRepository.findById(id);
```

### Key Indexes

- `talents.telegram_id` - Unique index
- `talents.skills` - GIN index for array queries
- `talents.status` - Partial index on approved status
- `jobs.required_skills` - GIN index for array queries
- `jobs.status` - Partial index on published status

## 🔄 Events & Notifications

The API emits events that trigger notifications:

```typescript
import { EventBus } from '@blihops/core/events';

// Emit event
eventBus.emit('talent.approved', { talentId: '123' });

// BullMQ worker processes and publishes to Telegram channel
```

## 🧪 Testing

### Unit Tests

```typescript
describe('TalentService', () => {
  it('should create talent', async () => {
    // Test implementation
  });
});
```

### E2E Tests

```typescript
describe('Talents (e2e)', () => {
  it('/api/v1/talents (POST)', () => {
    // E2E test
  });
});
```

## 📝 Code Style

- Follow NestJS conventions
- Use dependency injection
- Keep controllers thin, services fat
- Use DTOs for validation
- Document with JSDoc

## 🔗 Dependencies

### Core Dependencies
- `@nestjs/core` - NestJS framework
- `@nestjs/typeorm` or `prisma` - PostgreSQL ORM
- `@nestjs/jwt` - JWT authentication
- `@blihops/core` - Infrastructure utilities
- `@blihops/shared` - Domain types and utilities

### Development Dependencies
- `@nestjs/testing` - Testing utilities
- `jest` - Test framework
- `supertest` - HTTP testing

## 🚀 Deployment

See [docs/deployment.md](../../docs/deployment.md) for deployment instructions.

### Docker

```bash
# Build image
docker build -f infrastructure/docker/Dockerfile.backend -t blihops-api .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e REDIS_URL=redis://... \
  blihops-api

# Or use Docker Compose (recommended)
docker-compose up api-backend
```

## 📚 Related Documentation

- [API Documentation](../../docs/api/)
- [Architecture Overview](../../docs/architecture.md)
- [Contributing Guidelines](../../CONTRIBUTING.md)

---

**Status**: 🟢 Active Development


