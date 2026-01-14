# @blihops/bot-talent

⚠️ **DEPRECATED** - This package has been merged into `@blihops/telegram-bot`.

The unified Telegram bot now handles both talent onboarding and job posting with role-based access control. See [packages/telegram-bot/README.md](../telegram-bot/README.md) for the current implementation.

---

**Legacy Documentation** (for reference only):

Telegram bot for talent onboarding and profile management. Provides a conversational interface for professionals to join the BlihOps Talent Platform.

## 🎯 Overview

The Talent Bot enables:
- Guided conversational onboarding (under 5 minutes)
- Structured profile creation
- CV upload functionality
- Profile editing and updates
- Consent management for public visibility

## 🏗️ Architecture

### Structure

```
src/
├── handlers/          # Command and message handlers
├── workflows/         # Onboarding workflow state machine
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

### User Commands

- `/start` - Begin onboarding or show main menu
- `/profile` - View and edit profile
- `/upload_cv` - Upload or update CV
- `/help` - Show help information
- `/cancel` - Cancel current operation

### Admin Commands (if authorized)

- `/admin` - Admin panel access
- `/stats` - Bot statistics

## 🔄 Onboarding Workflow

The bot guides users through a structured onboarding process:

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

### Workflow State Management

The bot uses a state machine to track user progress:

```typescript
enum OnboardingState {
  WELCOME = 'welcome',
  PERSONAL_INFO = 'personal_info',
  SERVICE_CATEGORY = 'service_category',
  // ... more states
  REVIEW = 'review',
  COMPLETE = 'complete',
}
```

## 📝 Profile Management

### Creating Profile

Users interact with the bot conversationally:

```
Bot: Welcome! Let's create your profile. What's your full name?
User: John Doe
Bot: Great! Which service category are you interested in?
[Shows inline keyboard with options]
```

### Editing Profile

Users can edit their profile at any time:

```
User: /profile
Bot: [Shows current profile]
     What would you like to edit?
[Shows inline keyboard with edit options]
```

### CV Upload

Users can upload CVs via document message:

```
User: /upload_cv
Bot: Please send your CV as a document
User: [Sends PDF document]
Bot: CV uploaded successfully!
```

## 🎨 Keyboards

### Inline Keyboards

The bot uses inline keyboards for:
- Service category selection
- Experience level selection
- Availability status
- Engagement type
- Profile editing options
- Confirmation actions

Example:

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

## 🔌 Backend Integration

The bot communicates with the backend API:

```typescript
// Create talent profile
await apiClient.post('/api/v1/talents', {
  telegramId: ctx.from.id,
  name: profileData.name,
  // ... other fields
});

// Update profile
await apiClient.patch(`/api/v1/talents/${talentId}`, updates);

// Upload CV
await apiClient.post(`/api/v1/talents/${talentId}/cv`, formData);
```

## 🛡️ Error Handling

The bot handles errors gracefully:

```typescript
try {
  await processOnboarding(ctx);
} catch (error) {
  logger.error('Onboarding error', error);
  await ctx.reply('Sorry, something went wrong. Please try again or contact support.');
}
```

## 📊 Analytics

Track bot usage:
- Onboarding completion rate
- Average onboarding time
- Profile edit frequency
- CV upload rate
- Command usage statistics

## 🧪 Testing

```bash
# Run unit tests
pnpm test

# Run with coverage
pnpm test:cov
```

### Testing Workflows

```typescript
describe('OnboardingWorkflow', () => {
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

## 🐛 Troubleshooting

### Bot not responding
- Check bot token is correct
- Verify webhook URL is accessible
- Check backend API is running

### Onboarding stuck
- Check state persistence
- Verify database connection
- Review error logs

---

**Status**: 🟢 Active Development


