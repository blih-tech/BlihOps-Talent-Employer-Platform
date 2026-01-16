import { Redis } from 'ioredis';
import { setupSession, MyContext } from './session';
import { rateLimitMiddleware } from './rate-limit';
import { detectRole } from './rbac';
import { loggerMiddleware } from './logger';
import { Bot, NextFunction } from 'grammy';
import { setUserCommands, isAdmin } from '../utils/bot-commands';

/**
 * Setup all middleware for the bot
 * 
 * Middleware order is important:
 * 1. Session (first) - Must be first to initialize session data
 * 2. Logger - Log all requests for debugging
 * 3. Rate limiting - Prevent spam before processing
 * 4. Role detection - Detect admin/talent role based on user ID
 * 
 * Note: adminOnly() middleware should be used on specific commands,
 * not as a global middleware (it's exported from rbac.ts)
 */
export function setupMiddleware(bot: Bot<MyContext>, redis: Redis): void {
  // 1. Session (first) - Must initialize session before other middleware
  setupSession(bot, redis);

  // 2. Logger - Log all incoming messages
  bot.use(loggerMiddleware());

  // 3. Rate limiting - Prevent spam
  bot.use(rateLimitMiddleware(redis));

  // 4. Role detection - Automatically detect admin/talent role
  bot.use(detectRole());

  // 5. Update bot commands based on user role
  // This ensures the "/" menu shows correct commands for each user
  bot.use(async (ctx: MyContext, next: NextFunction) => {
    // Only update commands for private chats (not groups/channels)
    if (ctx.chat?.type === 'private' && ctx.from) {
      const userId = ctx.from.id;
      const userIsAdmin = isAdmin(userId);
      
      // Update commands for this user (only if role changed or first interaction)
      // We check session to avoid updating on every message
      if (!ctx.session.data?.commandsSet || ctx.session.data?.lastRole !== ctx.session.role) {
        try {
          await setUserCommands(bot, userId, userIsAdmin);
          ctx.session.data = {
            ...ctx.session.data,
            commandsSet: true,
            lastRole: ctx.session.role,
          };
        } catch (error) {
          // Silently fail - commands will still work, just won't show in menu
          console.debug('Could not update user commands:', error);
        }
      }
    }
    
    return next();
  });

  console.log('✅ Middleware setup complete');
}

// Re-export middleware for use in handlers
export { adminOnly } from './rbac';
export type { MyContext, SessionData } from './session';

