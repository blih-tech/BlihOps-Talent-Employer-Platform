# @blihops/telegram-bot

Unified Telegram bot for the BlihOps Talent Platform. Single bot with role-based access control supporting both talent onboarding and job posting workflows.

## 🎯 Overview

The Unified Telegram Bot enables:
- **Talent Features**: Guided conversational onboarding (under 5 minutes), profile creation, CV upload, profile editing
- **Admin Features**: Job creation workflow, job management, approval workflows
- **Role-Based Access**: Single bot with different command sets based on user role
- **Session Management**: Redis-backed sessions for stateless scaling

## 🏗️ Architecture

### Structure

```
src/
├── handlers/          # Command and message handlers
├── scenes/            # grammY scene managers
│   ├── talent/        # Talent onboarding scenes
│   └── admin/         # Admin job creation scenes
├── middleware/         # Rate limiting, RBAC, session management
├── keyboards/         # Inline keyboard components
├── services/          # Business logic services
├── types/             # Bot-specific types
└── index.ts           # Bot entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Telegram Bot Token (from @BotFather)
- Backend API running
- Redis for session storage
- pnpm 8+

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env
```

### Environment Variables

```env
# Telegram
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_WEBHOOK_URL=https://your-domain.com/webhook
TELEGRAM_WEBHOOK_SECRET=your-secret

# Backend API
API_BASE_URL=http://localhost:3000
API_SECRET_KEY=your-api-secret

# Redis (for sessions)
REDIS_URL=redis://localhost:6379

# Admin Authorization
ADMIN_TELEGRAM_IDS=123456789,987654321  # Comma-separated

# Environment
NODE_ENV=development
```

### Development

```bash
# Start in development mode
pnpm dev

# Start with watch mode
pnpm dev:watch
```

## 💬 Bot Commands

### Talent Commands

- `/start` - Begin onboarding or show main menu
- `/profile` - View and edit profile
- `/upload_cv` - Upload or update CV
- `/help` - Show help information
- `/cancel` - Cancel current operation

### Admin Commands (if authorized)

- `/create_job` - Start new job creation workflow
- `/my_jobs` - List your created jobs
- `/edit_job` - Edit existing job
- `/close_job` - Close/archive a job
- `/admin` - Admin panel access
- `/help` - Show help information
- `/cancel` - Cancel current operation

## 🔐 Role-Based Access Control

The bot uses role-based access to determine available commands:

```typescript
// Middleware checks user role
bot.use(async (ctx, next) => {
  const userId = ctx.from.id;
  const role = await getUserRole(userId); // talent | admin
  
  ctx.session.role = role;
  await next();
});

// Command handlers check role
bot.command('create_job', async (ctx) => {
  if (ctx.session.role !== 'admin') {
    return ctx.reply('Access denied. This command is for administrators only.');
  }
  // Show job creation workflow
});
```

## 🔄 Workflows

### Talent Onboarding Workflow

1. **Welcome** - Introduction and consent
2. **Personal Info** - Full name collection
3. **Service Category** - Select from available categories
4. **Role Specialization** - Enter role/title
5. **Skills** - Add skill tags
6. **Experience Level** - Select experience level
7. **Availability** - Set availability status
8. **Engagement Preference** - Full-time, part-time, contract, etc.
9. **CV Upload** - Optional CV upload
10. **Review & Submit** - Review profile and confirm

### Admin Job Creation Workflow

1. **Service Category** - Select service category alignment
2. **Job Title** - Enter job title/role name
3. **Description** - Enter role description and responsibilities
4. **Required Skills** - Add required skills and qualifications
5. **Engagement Type** - Full-time, part-time, contract, etc.
6. **Duration/Scope** - Project duration or scope details
7. **Review & Submit** - Review job details and confirm

## 🎨 Keyboards

### Inline Keyboards

The bot uses grammY's inline keyboard builder:

```typescript
import { InlineKeyboard } from 'grammY';

const categoryKeyboard = new InlineKeyboard()
  .text('ITO', 'category:ITO')
  .text('AI Solutions', 'category:AI').row()
  .text('Automation', 'category:AUTOMATION')
  .text('Data & Analytics', 'category:DATA');
```

## 🔌 Backend Integration

The bot communicates with the backend API:

```typescript
// Create talent profile
await apiClient.post('/api/v1/talents', {
  telegramId: ctx.from.id,
  name: profileData.name,
  // ... other fields
});

// Create job
await apiClient.post('/api/v1/jobs', {
  createdBy: ctx.from.id,
  title: jobData.title,
  // ... other fields
});
```

## 📊 Session Management

Sessions are stored in Redis for stateless scaling:

```typescript
import { RedisAdapter } from '@grammyjs/storage-redis';

const storage = new RedisAdapter({
  instance: redisClient,
});

bot.use(session({
  initial: () => ({}),
  storage,
}));
```

## 🛡️ Rate Limiting & Flood Control

The bot implements rate limiting to prevent abuse:

```typescript
import { limit } from '@grammyjs/ratelimiter';

bot.use(limit({
  timeFrame: 2000, // 2 seconds
  limit: 1, // 1 message per timeFrame
  onLimitExceeded: async (ctx) => {
    await ctx.reply('Please wait before sending another message.');
  },
}));
```

## 🧪 Testing

```bash
# Run unit tests
pnpm test

# Run with coverage
pnpm test:cov
```

### Testing Workflows

```typescript
describe('TalentOnboardingScene', () => {
  it('should complete full onboarding', async () => {
    // Test workflow
  });
});
```

## 🚀 Deployment

### Webhook Mode (Production)

```bash
# Set webhook
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -d "url=https://your-domain.com/webhook"
```

### Polling Mode (Development)

```typescript
// Use long polling for development
bot.start();
```

## 🔗 Dependencies

### Core Dependencies
- `grammY` - Telegram bot framework (preferred in 2026)
- `@grammyjs/storage-redis` - Redis session storage
- `@grammyjs/scenes` - Scene management
- `@grammyjs/ratelimiter` - Rate limiting
- `axios` - HTTP client for API calls
- `@blihops/core` - Infrastructure (logger, events)
- `@blihops/shared` - Domain types

### Development Dependencies
- `jest` - Testing framework
- `ts-node` - TypeScript execution

## 📚 Related Documentation

- [Telegram Bot API Docs](https://core.telegram.org/bots/api)
- [grammY Documentation](https://grammy.dev)
- [Backend API Documentation](../../docs/api/)
- [Contributing Guidelines](../../CONTRIBUTING.md)

## 🐛 Troubleshooting

### Bot not responding
- Check bot token is correct
- Verify webhook URL is accessible
- Check backend API is running
- Verify Redis connection

### Onboarding stuck
- Check Redis session storage
- Verify state persistence
- Review error logs

### Role-based access issues
- Verify admin Telegram IDs in environment
- Check middleware is properly configured
- Review session data in Redis

---

**Status**: 🟢 Active Development





