# @blihops/bot-employer

⚠️ **DEPRECATED** - This package has been merged into `@blihops/telegram-bot`.

The unified Telegram bot now handles both talent onboarding and job posting with role-based access control. See [packages/telegram-bot/README.md](../telegram-bot/README.md) for the current implementation.

---

**Legacy Documentation** (for reference only):

Telegram bot for job posting and management (admin-only). Provides a conversational interface for authorized BlihOps administrators to create and manage job opportunities.

## 🎯 Overview

The Employer Bot enables:
- Guided job creation workflow
- Job update and editing
- Job closure and archival
- Quick job status checks
- Integration with approval workflows

**Note**: This bot is restricted to authorized administrators only during Phase 1.

## 🏗️ Architecture

### Structure

```
src/
├── handlers/          # Command and message handlers
├── workflows/         # Job creation workflow
├── keyboards/         # Inline keyboard components
├── services/          # Business logic services
├── middleware/        # Authorization middleware
├── types/             # Bot-specific types
└── index.ts           # Bot entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Telegram Bot Token (from @BotFather)
- Backend API running
- Admin access credentials
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

## 🔐 Authorization

The bot restricts access to authorized administrators:

```typescript
// Middleware checks if user is authorized
bot.use(async (ctx, next) => {
  const adminIds = process.env.ADMIN_TELEGRAM_IDS.split(',');
  if (!adminIds.includes(ctx.from.id.toString())) {
    await ctx.reply('Access denied. This bot is for administrators only.');
    return;
  }
  await next();
});
```

## 💬 Bot Commands

### Admin Commands

- `/start` - Begin job creation or show main menu
- `/create_job` - Start new job creation workflow
- `/my_jobs` - List your created jobs
- `/edit_job` - Edit existing job
- `/close_job` - Close/archive a job
- `/help` - Show help information
- `/cancel` - Cancel current operation

## 🔄 Job Creation Workflow

The bot guides administrators through structured job creation:

1. **Service Category** - Select service category alignment
2. **Job Title** - Enter job title/role name
3. **Description** - Enter role description and responsibilities
4. **Required Skills** - Add required skills and qualifications
5. **Engagement Type** - Full-time, part-time, contract, etc.
6. **Duration/Scope** - Project duration or scope details
7. **Review & Submit** - Review job details and confirm

### Workflow State Management

```typescript
enum JobCreationState {
  SERVICE_CATEGORY = 'service_category',
  JOB_TITLE = 'job_title',
  DESCRIPTION = 'description',
  SKILLS = 'skills',
  ENGAGEMENT_TYPE = 'engagement_type',
  DURATION = 'duration',
  REVIEW = 'review',
  COMPLETE = 'complete',
}
```

## 📝 Job Management

### Creating Job

```
Admin: /create_job
Bot: Let's create a new job posting. Which service category?
[Shows inline keyboard]
Admin: [Selects ITO]
Bot: Great! What's the job title?
Admin: Senior Full-Stack Developer
Bot: Please provide a detailed job description...
```

### Editing Job

```
Admin: /edit_job
Bot: [Shows list of your jobs]
     Which job would you like to edit?
Admin: [Selects job]
Bot: What would you like to edit?
[Shows inline keyboard with edit options]
```

### Closing Job

```
Admin: /close_job
Bot: [Shows active jobs]
     Which job would you like to close?
Admin: [Selects job]
Bot: Job closed successfully. It has been archived.
```

## 🎨 Keyboards

### Service Category Selection

```typescript
const categoryKeyboard = InlineKeyboard.from([
  [
    { text: 'ITO', callback_data: 'category:ITO' },
    { text: 'AI Solutions', callback_data: 'category:AI' },
  ],
  [
    { text: 'Automation', callback_data: 'category:AUTOMATION' },
    { text: 'Data & Analytics', callback_data: 'category:DATA' },
  ],
]);
```

### Engagement Type Selection

```typescript
const engagementKeyboard = InlineKeyboard.from([
  [
    { text: 'Full-Time', callback_data: 'engagement:FULL_TIME' },
    { text: 'Part-Time', callback_data: 'engagement:PART_TIME' },
  ],
  [
    { text: 'Contract', callback_data: 'engagement:CONTRACT' },
    { text: 'Project-Based', callback_data: 'engagement:PROJECT' },
  ],
]);
```

## 🔌 Backend Integration

The bot communicates with the backend API:

```typescript
// Create job
await apiClient.post('/api/v1/jobs', {
  createdBy: ctx.from.id,
  serviceCategory: jobData.category,
  title: jobData.title,
  // ... other fields
});

// Update job
await apiClient.patch(`/api/v1/jobs/${jobId}`, updates);

// Close job
await apiClient.post(`/api/v1/jobs/${jobId}/archive`);
```

## 📊 Job Status

Jobs go through these states:
- `DRAFT` - Being created
- `PENDING` - Awaiting approval
- `APPROVED` - Approved and published
- `ARCHIVED` - Closed/archived

## 🛡️ Error Handling

```typescript
try {
  await processJobCreation(ctx);
} catch (error) {
  logger.error('Job creation error', error);
  await ctx.reply('Sorry, something went wrong. Please try again.');
}
```

## 🧪 Testing

```bash
# Run unit tests
pnpm test

# Run with coverage
pnpm test:cov
```

### Testing Authorization

```typescript
describe('AuthorizationMiddleware', () => {
  it('should deny unauthorized users', async () => {
    // Test unauthorized access
  });
  
  it('should allow authorized admins', async () => {
    // Test authorized access
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
bot.launch();
```

## 🔗 Dependencies

### Core Dependencies
- `telegraf` - Telegram bot framework
- `axios` - HTTP client for API calls
- `@blihops/core` - Infrastructure (logger, events)
- `@blihops/shared` - Domain types

### Development Dependencies
- `jest` - Testing framework
- `ts-node` - TypeScript execution

## 📚 Related Documentation

- [Telegram Bot API Docs](https://core.telegram.org/bots/api)
- [Backend API Documentation](../../docs/api/)
- [Contributing Guidelines](../../CONTRIBUTING.md)

## 🔒 Security Considerations

1. **Authorization**: Always verify admin IDs
2. **Rate Limiting**: Implement rate limits to prevent abuse
3. **Input Validation**: Validate all user inputs
4. **Secret Management**: Never commit tokens or secrets
5. **Webhook Security**: Verify webhook signatures

## 🐛 Troubleshooting

### Bot not responding
- Check bot token is correct
- Verify admin IDs are configured
- Check backend API is running

### Authorization issues
- Verify admin Telegram IDs in environment
- Check middleware is properly configured
- Review error logs

---

**Status**: 🟢 Active Development


