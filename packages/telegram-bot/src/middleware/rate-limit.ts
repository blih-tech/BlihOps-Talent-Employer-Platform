import { Context, NextFunction } from 'grammy';
import { Redis } from 'ioredis';

/**
 * Rate limiting configuration
 * Limits users to 15 messages per hour
 */
const RATE_LIMIT = 15; // messages per hour
const RATE_WINDOW = 3600; // 1 hour in seconds

/**
 * Rate limiting middleware
 * Prevents spam by limiting the number of messages a user can send per hour
 * Uses Redis to track message counts per user
 */
export function rateLimitMiddleware(redis: Redis) {
  return async (ctx: Context, next: NextFunction) => {
    const userId = ctx.from?.id;
    
    // Skip rate limiting if no user ID (shouldn't happen, but safety check)
    if (!userId) {
      return next();
    }

    const key = `ratelimit:${userId}`;
    
    try {
      // Increment the counter for this user
      const current = await redis.incr(key);

      // Set expiration on first message in the window
      if (current === 1) {
        await redis.expire(key, RATE_WINDOW);
      }

      // Check if rate limit exceeded
      if (current > RATE_LIMIT) {
        await ctx.reply(
          '⏳ Rate limit exceeded. Please wait before trying again.\n\n' +
          `You can send up to ${RATE_LIMIT} messages per hour.`
        );
        return; // Don't call next(), stop processing
      }

      // Rate limit not exceeded, continue
      return next();
    } catch (error) {
      // If Redis fails, log error but allow request to proceed
      // This prevents Redis issues from breaking the bot
      console.error('Rate limiting error:', error);
      return next();
    }
  };
}


