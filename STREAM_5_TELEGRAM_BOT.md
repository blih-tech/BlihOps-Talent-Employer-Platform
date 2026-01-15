# STREAM 5: Telegram Bot Development

**Developer**: Bot Specialist  
**Duration**: 3-4 weeks (Week 11-14)  
**Status**: 🟡 READY TO START - All dependencies met, pending bot token  
**Dependencies**: ✅ ALL MET - Stream 1, 2, 3, 4 complete  
**Can Work Parallel**: ✅ YES - Can work parallel with Stream 6 (Admin Dashboard)

---

## 📊 Stream Overview

This stream covers the complete Telegram bot implementation using grammY framework:
1. **Bot Foundation** - grammY setup, API client, session management, middleware
2. **Talent Onboarding Flow** - Conversational onboarding for talents
3. **Admin Job Creation Flow** - Job creation for admins via bot with status management
4. **Job Status Management** - View and manage job statuses (Pending, Published, Rejected, Closed/Expired)
5. **Applicant Management** - View applicants, manage applications, shortlist/hire/reject candidates
6. **Notifications** - Real-time notifications for status changes and application updates
7. **Bot Testing** - Unit tests, integration tests, UAT

---

## 🚨 DEPENDENCY CHECK

### ✅ Prerequisites (Must be completed first)
- [x] **Stream 1**: Development environment setup - ✅ COMPLETE
- [x] **Stream 2 Task 2.3**: Talent API complete - ✅ COMPLETE - `POST /api/v1/talents`, `PATCH /api/v1/talents/:id`, approval/rejection endpoints
- [x] **Stream 3 Task 3.1**: Jobs API complete - ✅ COMPLETE - `POST /api/v1/jobs`, `PATCH /api/v1/jobs/:id`, publish/archive endpoints
- [x] **Stream 3 Task 3.4**: Telegram webhook endpoint ready - ✅ COMPLETE - `/api/v1/telegram/webhook` implemented
- [x] **Stream 4 Task 4.1**: Queue system ready (for publishing) - ✅ COMPLETE - BullMQ queues and workers operational
- [x] **Decision 003**: Rate limiting strategy defined - ✅ COMPLETE
- [ ] **Telegram Bot Token**: Obtain bot token from @BotFather - ⚠️ PENDING

### ⚠️ Before Starting
- [x] **Verify API endpoints work**: ✅ VERIFIED - All endpoints tested and working
  - ✅ `POST /api/v1/talents` tested
  - ✅ `POST /api/v1/jobs` tested
  - ✅ Telegram webhook endpoint tested
- [x] **Verify Redis is running**: ✅ VERIFIED - Redis accessible on port 6379
- [ ] **Get Telegram Bot Token** from @BotFather - ⚠️ ACTION REQUIRED
- [ ] **Create test Telegram channel** for publishing - ⚠️ ACTION REQUIRED

**✅ DEPENDENCIES MET - Ready to start (pending bot token)**

---

## ✅ Already Completed

### Core Infrastructure
- [x] `packages/core/` - Logger, exceptions, config
- [x] `packages/shared/` - Types, constants, schemas
- [x] Decision 003 - Rate limiting strategy

### Bot Structure
- [x] `packages/telegram-bot/` - Directory exists (empty)
- [x] `packages/telegram-bot/Dockerfile` - Docker configuration exists

---

## 🚀 Tasks to Complete

### TASK 5.1: Bot Foundation Setup (3-4 days)
**Priority**: CRITICAL - Blocks all bot development  
**Status**: ❌ NOT STARTED  
**Dependencies**: Telegram bot token

#### Subtask 5.1.1: grammY Bot Initialization (Day 1)
- [ ] Initialize bot project structure
- [ ] Install grammY and dependencies
  ```bash
  cd packages/telegram-bot
  pnpm init
  pnpm add grammy @grammyjs/ratelimiter @grammyjs/menu @grammyjs/conversations ioredis
  pnpm add -D typescript @types/node tsx
  ```
- [ ] Configure TypeScript for bot project
- [ ] Create bot entry point
- [ ] Configure environment variables

**Files to create**:
- `packages/telegram-bot/package.json`
- `packages/telegram-bot/tsconfig.json`
- `packages/telegram-bot/src/index.ts`
- `packages/telegram-bot/.env.example`

**Bot Entry Point Template** (`src/index.ts`):
```typescript
import { Bot } from 'grammy';
import { Redis } from 'ioredis';
import { config } from './config';
import { setupMiddleware } from './middleware';
import { registerHandlers } from './handlers';

async function main() {
  // Create bot instance
  const bot = new Bot(config.BOT_TOKEN);

  // Setup Redis for sessions
  const redis = new Redis({
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
  });

  // Setup middleware
  setupMiddleware(bot, redis);

  // Register command handlers
  registerHandlers(bot);

  // Error handling
  bot.catch((err) => {
    console.error('Bot error:', err);
  });

  // Start bot
  if (config.USE_WEBHOOKS) {
    // Webhook mode (production)
    console.log('Starting bot in webhook mode');
    // TODO: Configure webhook
  } else {
    // Polling mode (development)
    console.log('Starting bot in polling mode');
    await bot.start();
  }
}

main().catch(console.error);
```

**Configuration Template** (`src/config.ts`):
```typescript
export const config = {
  BOT_TOKEN: process.env.BOT_TOKEN || '',
  API_URL: process.env.API_URL || 'http://localhost:3000/api/v1',
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379'),
  USE_WEBHOOKS: process.env.USE_WEBHOOKS === 'true',
  WEBHOOK_SECRET: process.env.WEBHOOK_SECRET || '',
  TELEGRAM_CHANNEL_ID: process.env.TELEGRAM_CHANNEL_ID || '',
};
```

**Package.json Scripts**:
```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "start": "node dist/index.js",
    "build": "tsc"
  }
}
```

**Acceptance Criteria**:
- Bot project is initialized
- Dependencies are installed
- Bot can connect to Telegram API
- Bot responds to `/start` command (basic)

---

#### Subtask 5.1.2: API Client Setup (Day 1)
- [ ] Create API client for backend communication
- [ ] Implement HTTP methods (GET, POST, PATCH)
- [ ] Add error handling
- [ ] Add request/response types

**Files to create**:
- `packages/telegram-bot/src/api/api-client.ts`
- `packages/telegram-bot/src/api/types.ts`

**API Client Template**:
```typescript
import axios, { AxiosInstance } from 'axios';
import { config } from '../config';

export class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Talent endpoints
  async createTalent(data: CreateTalentDto) {
    const response = await this.client.post('/talents', data);
    return response.data;
  }

  async getTalent(id: string) {
    const response = await this.client.get(`/talents/${id}`);
    return response.data;
  }

  async updateTalent(id: string, data: UpdateTalentDto) {
    const response = await this.client.patch(`/talents/${id}`, data);
    return response.data;
  }

  // Job endpoints
  async createJob(data: CreateJobDto) {
    const response = await this.client.post('/jobs', data);
    return response.data;
  }

  async getJob(id: string) {
    const response = await this.client.get(`/jobs/${id}`);
    return response.data;
  }

  async updateJob(id: string, data: UpdateJobDto) {
    const response = await this.client.patch(`/jobs/${id}`, data);
    return response.data;
  }

  async publishJob(id: string) {
    const response = await this.client.post(`/jobs/${id}/publish`);
    return response.data;
  }

  async rejectJob(id: string, reason?: string) {
    const response = await this.client.post(`/jobs/${id}/reject`, { reason });
    return response.data;
  }

  async closeJob(id: string) {
    const response = await this.client.post(`/jobs/${id}/close`);
    return response.data;
  }

  async reopenJob(id: string) {
    const response = await this.client.post(`/jobs/${id}/reopen`);
    return response.data;
  }

  async getJobsByAdmin(adminId: string, status?: string) {
    const params = status ? `?status=${status}` : '';
    const response = await this.client.get(`/jobs/admin/${adminId}${params}`);
    return response.data;
  }

  // Applicant endpoints
  async getJobApplicants(jobId: string) {
    const response = await this.client.get(`/jobs/${jobId}/applicants`);
    return response.data;
  }

  async getApplicant(jobId: string, applicantId: string) {
    const response = await this.client.get(`/jobs/${jobId}/applicants/${applicantId}`);
    return response.data;
  }

  async shortlistApplicant(jobId: string, applicantId: string, notes?: string) {
    const response = await this.client.post(`/jobs/${jobId}/applicants/${applicantId}/shortlist`, { notes });
    return response.data;
  }

  async hireApplicant(jobId: string, applicantId: string, hireDate?: string, notes?: string) {
    const response = await this.client.post(`/jobs/${jobId}/applicants/${applicantId}/hire`, { hireDate, notes });
    return response.data;
  }

  async rejectApplicant(jobId: string, applicantId: string, reason?: string) {
    const response = await this.client.post(`/jobs/${jobId}/applicants/${applicantId}/reject`, { reason });
    return response.data;
  }

  // Error handling
  private handleError(error: any) {
    if (error.response) {
      // API error
      throw new Error(`API Error: ${error.response.data.message || error.message}`);
    } else if (error.request) {
      // Network error
      throw new Error('Network error: Cannot reach API');
    } else {
      // Other error
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
```

**Acceptance Criteria**:
- API client can call all required endpoints
- Error handling works correctly
- Network errors are caught

---

#### Subtask 5.1.3: Session & Middleware Setup (Day 2)
- [ ] Setup Redis session store
- [ ] Configure session middleware
- [ ] Implement rate limiting middleware
- [ ] Implement RBAC middleware
- [ ] Add logging middleware

**Files to create**:
- `packages/telegram-bot/src/middleware/session.ts`
- `packages/telegram-bot/src/middleware/rate-limit.ts`
- `packages/telegram-bot/src/middleware/rbac.ts`
- `packages/telegram-bot/src/middleware/logger.ts`
- `packages/telegram-bot/src/middleware/index.ts`

**Session Middleware Template**:
```typescript
import { Bot, Context, session } from 'grammy';
import { Redis } from 'ioredis';

export interface SessionData {
  role?: 'talent' | 'admin';
  state?: string; // Current scene/state
  data?: Record<string, any>; // Scene data
}

export function setupSession(bot: Bot, redis: Redis) {
  bot.use(
    session({
      initial: (): SessionData => ({}),
      storage: {
        async read(key: string) {
          const data = await redis.get(`session:${key}`);
          return data ? JSON.parse(data) : null;
        },
        async write(key: string, value: SessionData) {
          await redis.setex(`session:${key}`, 7200, JSON.stringify(value)); // 2 hour TTL
        },
        async delete(key: string) {
          await redis.del(`session:${key}`);
        },
      },
    }),
  );
}
```

**Rate Limit Middleware Template**:
```typescript
import { Context, NextFunction } from 'grammy';
import { Redis } from 'ioredis';

const RATE_LIMIT = 15; // messages per hour
const RATE_WINDOW = 3600; // 1 hour in seconds

export function rateLimitMiddleware(redis: Redis) {
  return async (ctx: Context, next: NextFunction) => {
    const userId = ctx.from?.id;
    if (!userId) return next();

    const key = `ratelimit:${userId}`;
    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, RATE_WINDOW);
    }

    if (current > RATE_LIMIT) {
      await ctx.reply('⏳ Rate limit exceeded. Please wait before trying again.');
      return;
    }

    return next();
  };
}
```

**RBAC Middleware Template**:
```typescript
import { Context, NextFunction } from 'grammy';

const ADMIN_IDS = process.env.ADMIN_TELEGRAM_IDS?.split(',') || [];

export function adminOnly() {
  return async (ctx: Context, next: NextFunction) => {
    const userId = ctx.from?.id.toString();
    
    if (!userId || !ADMIN_IDS.includes(userId)) {
      await ctx.reply('❌ This command is only available to admins.');
      return;
    }

    // Set role in session
    ctx.session.role = 'admin';
    return next();
  };
}

export function detectRole() {
  return async (ctx: Context, next: NextFunction) => {
    const userId = ctx.from?.id.toString();
    
    if (userId && ADMIN_IDS.includes(userId)) {
      ctx.session.role = 'admin';
    } else {
      ctx.session.role = 'talent';
    }

    return next();
  };
}
```

**Setup Middleware** (`src/middleware/index.ts`):
```typescript
import { Bot } from 'grammy';
import { Redis } from 'ioredis';
import { setupSession } from './session';
import { rateLimitMiddleware } from './rate-limit';
import { detectRole } from './rbac';
import { loggerMiddleware } from './logger';

export function setupMiddleware(bot: Bot, redis: Redis) {
  // Session (first)
  setupSession(bot, redis);

  // Logger
  bot.use(loggerMiddleware());

  // Rate limiting
  bot.use(rateLimitMiddleware(redis));

  // Role detection
  bot.use(detectRole());
}
```

**Acceptance Criteria**:
- Session data persists across messages
- Rate limiting prevents spam
- Admin detection works
- Middleware is applied in correct order

---

### TASK 5.2: Talent Onboarding Flow (1.5 weeks)
**Priority**: HIGH - Core user flow  
**Status**: ❌ NOT STARTED  
**Dependencies**: Task 5.1

#### Subtask 5.2.1: Conversations Plugin Setup (Day 1)
- [ ] Install and configure conversations plugin
- [ ] Create onboarding conversation
- [ ] Setup conversation entry point

**Files to create**:
- `packages/telegram-bot/src/conversations/onboarding.ts`

**Onboarding Conversation Template**:
```typescript
import { Conversation, ConversationFlavor } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { apiClient } from '../api/api-client';

type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

export async function onboardingConversation(conversation: MyConversation, ctx: MyContext) {
  // Welcome & Consent
  await ctx.reply(
    '👋 Welcome to BlihOps Talent Platform!\n\n' +
    'I\'ll help you create your talent profile. This will take about 5 minutes.\n\n' +
    'By continuing, you agree to our Terms & Conditions.\n\n' +
    'Ready to start? (Yes/No)'
  );

  const consent = await conversation.waitFor(':text');
  if (!consent.message?.text.toLowerCase().startsWith('y')) {
    await ctx.reply('No problem! Send /start when you\'re ready.');
    return;
  }

  // Personal Info - Name
  await ctx.reply('Great! Let\'s start with your name:');
  const nameMsg = await conversation.waitFor(':text');
  const name = nameMsg.message!.text!;

  // Service Category
  await ctx.reply(
    'What service category best describes your skills?\n\n' +
    '1️⃣ Web Development\n' +
    '2️⃣ Mobile Development\n' +
    '3️⃣ Design\n' +
    '4️⃣ Marketing\n' +
    '5️⃣ Content Creation\n' +
    '6️⃣ Data Analysis\n' +
    '7️⃣ Consulting\n' +
    '8️⃣ Other\n\n' +
    'Send the number of your choice:'
  );

  const categoryMsg = await conversation.waitFor(':text');
  const categoryMap = {
    '1': 'WEB_DEVELOPMENT',
    '2': 'MOBILE_DEVELOPMENT',
    '3': 'DESIGN',
    '4': 'MARKETING',
    '5': 'CONTENT_CREATION',
    '6': 'DATA_ANALYSIS',
    '7': 'CONSULTING',
    '8': 'OTHER',
  };
  const serviceCategory = categoryMap[categoryMsg.message!.text! as keyof typeof categoryMap];

  // Skills
  await ctx.reply('What are your key skills? (Separate with commas)\n\nExample: JavaScript, React, Node.js');
  const skillsMsg = await conversation.waitFor(':text');
  const skills = skillsMsg.message!.text!.split(',').map(s => s.trim());

  // Experience Level
  await ctx.reply(
    'What is your experience level?\n\n' +
    '1️⃣ Entry (0-2 years)\n' +
    '2️⃣ Intermediate (2-5 years)\n' +
    '3️⃣ Senior (5-10 years)\n' +
    '4️⃣ Expert (10+ years)\n\n' +
    'Send the number of your choice:'
  );

  const expMsg = await conversation.waitFor(':text');
  const expMap = {
    '1': 'ENTRY',
    '2': 'INTERMEDIATE',
    '3': 'SENIOR',
    '4': 'EXPERT',
  };
  const experienceLevel = expMap[expMsg.message!.text! as keyof typeof expMap];

  // Bio (optional)
  await ctx.reply('Tell us about yourself (optional, or send /skip):');
  const bioCtx = await conversation.wait();
  const bio = bioCtx.message?.text === '/skip' ? undefined : bioCtx.message?.text;

  // CV Upload (optional)
  await ctx.reply('Upload your CV (optional, or send /skip):\n\nSupported formats: PDF, DOC, DOCX');
  const cvCtx = await conversation.wait();
  let cvUrl = undefined;
  
  if (cvCtx.message?.document) {
    // TODO: Handle CV upload to API
    await ctx.reply('CV received! (Upload will be implemented soon)');
  }

  // Review & Submit
  await ctx.reply(
    '📋 Review your profile:\n\n' +
    `Name: ${name}\n` +
    `Category: ${serviceCategory}\n` +
    `Skills: ${skills.join(', ')}\n` +
    `Experience: ${experienceLevel}\n` +
    `${bio ? `Bio: ${bio}\n` : ''}` +
    '\nIs this correct? (Yes/No)'
  );

  const confirmMsg = await conversation.waitFor(':text');
  if (!confirmMsg.message?.text.toLowerCase().startsWith('y')) {
    await ctx.reply('Let\'s start over. Send /start to begin again.');
    return;
  }

  // Submit to API
  try {
    const talent = await apiClient.createTalent({
      telegramId: ctx.from!.id.toString(),
      name,
      serviceCategory,
      skills,
      experienceLevel,
      bio,
    });

    await ctx.reply(
      '✅ Profile submitted successfully!\n\n' +
      'Your profile is pending approval. You\'ll be notified when it\'s approved.\n\n' +
      'Use /profile to view your profile anytime.'
    );
  } catch (error) {
    await ctx.reply('❌ Failed to submit profile. Please try again later.');
    console.error('Profile submission error:', error);
  }
}
```

**Register Conversation**:
```typescript
import { conversations, createConversation } from '@grammyjs/conversations';

bot.use(conversations());
bot.use(createConversation(onboardingConversation));

bot.command('start', async (ctx) => {
  await ctx.conversation.enter('onboardingConversation');
});
```

**Acceptance Criteria**:
- Onboarding conversation works end-to-end
- All steps collect data correctly
- API submission works
- Error handling works

---

#### Subtask 5.2.2: Talent Commands (Day 2-3)
- [ ] Implement `/start` command
- [ ] Implement `/profile` command
- [ ] Implement `/upload_cv` command
- [ ] Implement `/help` command
- [ ] Implement `/cancel` command

**Files to create**:
- `packages/telegram-bot/src/handlers/talent-commands.ts`

**Talent Commands Template**:
```typescript
import { Bot, Context } from 'grammy';
import { apiClient } from '../api/api-client';

export function registerTalentCommands(bot: Bot) {
  // /start - Already handled in conversation entry

  // /profile - View profile
  bot.command('profile', async (ctx) => {
    try {
      const telegramId = ctx.from!.id.toString();
      const talent = await apiClient.getTalentByTelegramId(telegramId);

      if (!talent) {
        await ctx.reply('You don\'t have a profile yet. Send /start to create one.');
        return;
      }

      await ctx.reply(
        '👤 Your Profile:\n\n' +
        `Name: ${talent.name}\n` +
        `Category: ${talent.serviceCategory}\n` +
        `Skills: ${talent.skills.join(', ')}\n` +
        `Experience: ${talent.experienceLevel}\n` +
        `Status: ${talent.status}\n` +
        `${talent.bio ? `\nBio: ${talent.bio}` : ''}`
      );
    } catch (error) {
      await ctx.reply('❌ Failed to fetch profile.');
    }
  });

  // /upload_cv - Upload CV
  bot.command('upload_cv', async (ctx) => {
    await ctx.reply('Please upload your CV (PDF, DOC, or DOCX):');
    // TODO: Handle CV upload
  });

  // /help - Help message
  bot.command('help', async (ctx) => {
    const isAdmin = ctx.session.role === 'admin';

    let helpText = '📖 Available Commands:\n\n';
    helpText += '/start - Create your talent profile\n';
    helpText += '/profile - View your profile\n';
    helpText += '/upload_cv - Upload your CV\n';
    helpText += '/help - Show this help message\n';
    helpText += '/cancel - Cancel current operation\n';

    if (isAdmin) {
      helpText += '\n👨‍💼 Admin Commands:\n';
      helpText += '/create_job - Create a new job\n';
      helpText += '/my_jobs - View your jobs\n';
    }

    await ctx.reply(helpText);
  });

  // /cancel - Cancel operation
  bot.command('cancel', async (ctx) => {
    await ctx.conversation.exit();
    await ctx.reply('Operation cancelled.');
  });
}
```

**Acceptance Criteria**:
- All commands work correctly
- `/profile` shows talent data from API
- `/help` shows appropriate commands based on role
- `/cancel` exits conversations

---

### TASK 5.3: Admin Job Creation Flow (1.5 weeks)
**Priority**: HIGH - Core admin flow  
**Status**: ❌ NOT STARTED  
**Dependencies**: Task 5.1, Stream 3 Task 3.1 (Jobs API)

#### Subtask 5.3.1: Job Creation Conversation (Day 1-2)
- [ ] Create job creation conversation
- [ ] Implement all steps
- [ ] Add admin-only access control
- [ ] Submit to API

**Files to create**:
- `packages/telegram-bot/src/conversations/job-creation.ts`

**Job Creation Conversation Template**:
```typescript
export async function jobCreationConversation(conversation: MyConversation, ctx: MyContext) {
  // Verify admin role
  if (ctx.session.role !== 'admin') {
    await ctx.reply('❌ This command is only available to admins.');
    return;
  }

  // Service Category
  await ctx.reply(
    'Let\'s create a new job!\n\n' +
    'What service category?\n\n' +
    '1️⃣ Web Development\n' +
    '2️⃣ Mobile Development\n' +
    '3️⃣ Design\n' +
    '4️⃣ Marketing\n' +
    '5️⃣ Content Creation\n' +
    '6️⃣ Data Analysis\n' +
    '7️⃣ Consulting\n' +
    '8️⃣ Other\n\n' +
    'Send the number:'
  );

  const categoryMsg = await conversation.waitFor(':text');
  const categoryMap = {
    '1': 'WEB_DEVELOPMENT',
    '2': 'MOBILE_DEVELOPMENT',
    '3': 'DESIGN',
    '4': 'MARKETING',
    '5': 'CONTENT_CREATION',
    '6': 'DATA_ANALYSIS',
    '7': 'CONSULTING',
    '8': 'OTHER',
  };
  const serviceCategory = categoryMap[categoryMsg.message!.text! as keyof typeof categoryMap];

  // Job Title
  await ctx.reply('Job title:');
  const titleMsg = await conversation.waitFor(':text');
  const title = titleMsg.message!.text!;

  // Job Description
  await ctx.reply('Job description (you can write multiple paragraphs):');
  const descMsg = await conversation.waitFor(':text');
  const description = descMsg.message!.text!;

  // Required Skills
  await ctx.reply('Required skills (separate with commas):');
  const skillsMsg = await conversation.waitFor(':text');
  const requiredSkills = skillsMsg.message!.text!.split(',').map(s => s.trim());

  // Experience Level
  await ctx.reply(
    'Required experience level?\n\n' +
    '1️⃣ Entry\n' +
    '2️⃣ Intermediate\n' +
    '3️⃣ Senior\n' +
    '4️⃣ Expert\n'
  );
  const expMsg = await conversation.waitFor(':text');
  const expMap = { '1': 'ENTRY', '2': 'INTERMEDIATE', '3': 'SENIOR', '4': 'EXPERT' };
  const experienceLevel = expMap[expMsg.message!.text! as keyof typeof expMap];

  // Engagement Type
  await ctx.reply(
    'Engagement type?\n\n' +
    '1️⃣ Full-time\n' +
    '2️⃣ Part-time\n' +
    '3️⃣ Contract\n' +
    '4️⃣ Freelance\n' +
    '5️⃣ Internship\n'
  );
  const engMsg = await conversation.waitFor(':text');
  const engMap = {
    '1': 'FULL_TIME',
    '2': 'PART_TIME',
    '3': 'CONTRACT',
    '4': 'FREELANCE',
    '5': 'INTERNSHIP',
  };
  const engagementType = engMap[engMsg.message!.text! as keyof typeof engMap];

  // Duration (optional)
  await ctx.reply('Duration/scope (optional, or send /skip):');
  const durCtx = await conversation.wait();
  const duration = durCtx.message?.text === '/skip' ? undefined : durCtx.message?.text;

  // Review & Submit
  await ctx.reply(
    '📋 Review job posting:\n\n' +
    `Title: ${title}\n` +
    `Category: ${serviceCategory}\n` +
    `Experience: ${experienceLevel}\n` +
    `Type: ${engagementType}\n` +
    `${duration ? `Duration: ${duration}\n` : ''}` +
    `Skills: ${requiredSkills.join(', ')}\n\n` +
    `Description: ${description}\n\n` +
    'Submit? (Yes/No)'
  );

  const confirmMsg = await conversation.waitFor(':text');
  if (!confirmMsg.message?.text.toLowerCase().startsWith('y')) {
    await ctx.reply('Job creation cancelled.');
    return;
  }

  // Submit to API
  try {
    const job = await apiClient.createJob({
      title,
      description,
      serviceCategory,
      requiredSkills,
      experienceLevel,
      engagementType,
      duration,
    });

    await ctx.reply(
      '✅ Job created successfully!\n\n' +
      'The job is pending approval. It will be published once approved.\n\n' +
      'Use /my_jobs to view your jobs.'
    );
  } catch (error) {
    await ctx.reply('❌ Failed to create job.');
    console.error('Job creation error:', error);
  }
}
```

**Acceptance Criteria**:
- Job creation conversation works end-to-end
- All steps collect data correctly
- API submission works
- Admin-only access is enforced

---

#### Subtask 5.3.2: Admin Commands (Day 2-3)
- [ ] Implement `/create_job` command
- [ ] Implement `/my_jobs` command
- [ ] Implement `/edit_job` command (basic)
- [ ] Implement job status management commands

**Files to create**:
- `packages/telegram-bot/src/handlers/admin-commands.ts`

**Admin Commands Template**:
```typescript
export function registerAdminCommands(bot: Bot) {
  // /create_job
  bot.command('create_job', adminOnly(), async (ctx) => {
    await ctx.conversation.enter('jobCreationConversation');
  });

  // /my_jobs - List jobs with status and stats
  bot.command('my_jobs', adminOnly(), async (ctx) => {
    try {
      const jobs = await apiClient.getJobsByAdmin(ctx.from!.id.toString());

      if (!jobs || jobs.length === 0) {
        await ctx.reply('You haven\'t created any jobs yet.');
        return;
      }

      let message = '📝 Your Jobs:\n\n';
      jobs.forEach((job, index) => {
        const statusEmoji = {
          PENDING: '⏳',
          PUBLISHED: '✅',
          REJECTED: '❌',
          CLOSED: '🔒',
        }[job.status] || '📄';
        
        message += `${index + 1}. ${statusEmoji} ${job.title}\n`;
        message += `   Status: ${job.status}\n`;
        message += `   Applicants: ${job.applicantCount || 0}\n`;
        message += `   Hired: ${job.hiredCount || 0}\n`;
        message += `   Created: ${new Date(job.createdAt).toLocaleDateString()}\n\n`;
      });

      await ctx.reply(message);
    } catch (error) {
      await ctx.reply('❌ Failed to fetch jobs.');
    }
  });

  // /job_status - View job status and details
  bot.command('job_status', adminOnly(), async (ctx) => {
    await ctx.reply('Send the job ID to view status:');
    // TODO: Implement job status view
  });

  // /publish_job - Publish a pending job
  bot.command('publish_job', adminOnly(), async (ctx) => {
    await ctx.reply('Send the job ID to publish:');
    // TODO: Implement publish job
  });

  // /reject_job - Reject a pending job
  bot.command('reject_job', adminOnly(), async (ctx) => {
    await ctx.reply('Send the job ID to reject:');
    // TODO: Implement reject job with reason
  });

  // /close_job - Close a published job
  bot.command('close_job', adminOnly(), async (ctx) => {
    await ctx.reply('Send the job ID to close:');
    // TODO: Implement close job
  });
}
```

**Acceptance Criteria**:
- All admin commands work
- Admin-only access is enforced
- Commands interact with API correctly
- Job status is displayed with emojis
- Job statistics (applicants, hired) are shown

---

### TASK 5.4: Bot Testing & Refinement (3-4 days)
**Priority**: HIGH  
**Status**: ❌ NOT STARTED  
**Dependencies**: Task 5.2, Task 5.3

#### Subtask 5.4.1: Unit Tests (Day 1-2)
- [ ] Write tests for API client
- [ ] Write tests for middleware
- [ ] Write tests for conversation logic (if possible)

**Testing Framework**: Jest or Vitest

**Acceptance Criteria**:
- Unit tests pass
- Test coverage >70%

#### Subtask 5.4.2: Integration Tests (Day 2)
- [ ] Test talent onboarding flow end-to-end
- [ ] Test job creation flow end-to-end
- [ ] Test API integration

**Acceptance Criteria**:
- Integration tests pass
- Flows work correctly with real API

#### Subtask 5.4.3: User Acceptance Testing (Day 3)
- [ ] Test with real users (team members)
- [ ] Test error scenarios
- [ ] Collect feedback
- [ ] Fix bugs

**Acceptance Criteria**:
- UAT is complete
- Major bugs are fixed
- User feedback is incorporated

---

## 📋 Testing Requirements

### Manual Testing Checklist

#### Talent Flow
- [ ] Send `/start` → Complete onboarding
- [ ] Verify profile is created in database
- [ ] Send `/profile` → Verify data
- [ ] Test `/help` command
- [ ] Test `/cancel` during onboarding

#### Admin Flow
- [ ] Send `/create_job` as admin
- [ ] Complete job creation
- [ ] Verify job is created in database
- [ ] Send `/my_jobs` → Verify jobs shown
- [ ] Test admin commands as non-admin (should fail)

#### Error Scenarios
- [ ] Test with invalid inputs
- [ ] Test with API down
- [ ] Test rate limiting (send 20 messages quickly)
- [ ] Test session expiry

---

## 🎯 Definition of Done

### Bot Foundation
- ✅ grammY bot is initialized
- ✅ API client works
- ✅ Session management works
- ✅ Rate limiting works
- ✅ RBAC works

### Talent Flow
- ✅ Onboarding conversation works
- ✅ All talent commands work
- ✅ API integration works
- ✅ Error handling works

### Admin Flow
- ✅ Job creation conversation works
- ✅ All admin commands work
- ✅ Admin-only access works
- ✅ API integration works

### Testing
- ✅ Unit tests pass (>70% coverage)
- ✅ Integration tests pass
- ✅ UAT is complete

---

## 📂 Key Files

### Bot Core
- `packages/telegram-bot/src/index.ts`
- `packages/telegram-bot/src/config.ts`
- `packages/telegram-bot/src/api/api-client.ts`

### Middleware
- `packages/telegram-bot/src/middleware/session.ts`
- `packages/telegram-bot/src/middleware/rate-limit.ts`
- `packages/telegram-bot/src/middleware/rbac.ts`

### Conversations
- `packages/telegram-bot/src/conversations/onboarding.ts`
- `packages/telegram-bot/src/conversations/job-creation.ts`

### Handlers
- `packages/telegram-bot/src/handlers/talent-commands.ts`
- `packages/telegram-bot/src/handlers/admin-commands.ts`

---

## 🚨 Blockers & Dependencies

### Current Blockers
- ⚠️ **Stream 2 Task 2.3**: Talent API must be complete
- ⚠️ **Stream 3 Task 3.1**: Jobs API must be complete
- ⚠️ **Telegram Bot Token**: Must obtain from @BotFather

### This Stream Blocks
- **Stream 7**: Integration testing needs bot working

---

**Last Updated**: 2025-01-15  
**Next Review**: Daily standup  
**Owner**: Bot Specialist  
**Status Note**: All dependencies from Streams 1-4 are complete. Ready to start pending Telegram bot token from @BotFather.


