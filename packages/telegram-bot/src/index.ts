import 'dotenv/config';
import { Redis } from 'ioredis';
import { conversations, createConversation } from '@grammyjs/conversations';
import { config } from './config';
import { setupMiddleware, MyContext } from './middleware';
import { registerHandlers } from './handlers';
import { jobCreationConversation } from './conversations/job-creation';
import { onboardingConversation } from './conversations/onboarding';
import { Bot } from 'grammy';
import { initializeBotCommands } from './utils/bot-commands';

async function main() {
  // Validate required configuration
  if (!config.BOT_TOKEN) {
    console.error('❌ BOT_TOKEN is required. Please set it in your .env file.');
    process.exit(1);
  }

  // Create bot instance with MyContext type
  const bot = new Bot<MyContext>(config.BOT_TOKEN);

  // Setup Redis for sessions with retry strategy
  const redis = new Redis({
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      console.log(`🔄 Retrying Redis connection (attempt ${times})...`);
      return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    connectTimeout: 10000,
    lazyConnect: false,
  });

  // Handle Redis connection events
  redis.on('connect', () => {
    console.log('🔄 Connecting to Redis...');
  });

  redis.on('ready', () => {
    console.log('✅ Redis connection ready');
  });

  redis.on('error', (error) => {
    console.error('❌ Redis error:', error.message);
    // Don't exit on error - let retry strategy handle reconnection
  });

  redis.on('close', () => {
    console.log('⚠️  Redis connection closed');
  });

  redis.on('reconnecting', (delay: number) => {
    console.log(`🔄 Redis reconnecting in ${delay}ms...`);
  });

  // Test Redis connection with retries
  let connected = false;
  const maxRetries = 10;
  for (let i = 0; i < maxRetries; i++) {
    try {
      await redis.ping();
      connected = true;
      console.log('✅ Redis connection established');
      break;
    } catch (error) {
      if (i < maxRetries - 1) {
        const delay = Math.min((i + 1) * 500, 2000);
        console.log(`⏳ Redis connection attempt ${i + 1}/${maxRetries} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('❌ Failed to connect to Redis after', maxRetries, 'attempts:', error);
        process.exit(1);
      }
    }
  }

  if (!connected) {
    console.error('❌ Failed to establish Redis connection');
    process.exit(1);
  }

  // Setup middleware
  setupMiddleware(bot, redis);

  // Setup conversations plugin
  bot.use(conversations());
  bot.use(createConversation(onboardingConversation, 'onboardingConversation'));
  bot.use(createConversation(jobCreationConversation, 'jobCreationConversation'));

  // Initialize bot commands (sets default commands)
  await initializeBotCommands(bot);

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
    // TODO: Configure webhook in Subtask 5.1.3 or later
    console.warn('⚠️  Webhook mode not yet implemented. Falling back to polling.');
    await bot.start();
  } else {
    // Polling mode (development)
    console.log('Starting bot in polling mode');
    await bot.start();
  }

  console.log('✅ Bot is running!');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

