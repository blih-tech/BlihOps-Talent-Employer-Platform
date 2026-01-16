import { Bot, Context, session } from 'grammy';
import { Redis } from 'ioredis';
import { ConversationFlavor } from '@grammyjs/conversations';

/**
 * Session data structure
 * Stores user state and conversation data
 */
export interface SessionData {
  role?: 'talent' | 'admin';
  state?: string; // Current scene/state
  data?: Record<string, any>; // Scene data
}

/**
 * Extend grammy Context with session data and conversation flavor
 * ConversationFlavor is added by the conversations plugin
 */
export type MyContext = Context & ConversationFlavor & {
  session: SessionData;
};

/**
 * Setup Redis-backed session middleware
 * Sessions are stored in Redis with a 2-hour TTL
 */
export function setupSession(bot: Bot<MyContext>, redis: Redis): void {
  bot.use(
    session({
      initial: (): SessionData => ({}),
      storage: {
        async read(key: string): Promise<SessionData | undefined> {
          try {
            const data = await redis.get(`session:${key}`);
            return data ? JSON.parse(data) : undefined;
          } catch (error) {
            console.error(`Failed to read session ${key}:`, error);
            return undefined;
          }
        },
        async write(key: string, value: SessionData): Promise<void> {
          try {
            await redis.setex(`session:${key}`, 7200, JSON.stringify(value)); // 2 hour TTL
          } catch (error) {
            console.error(`Failed to write session ${key}:`, error);
          }
        },
        async delete(key: string): Promise<void> {
          try {
            await redis.del(`session:${key}`);
          } catch (error) {
            console.error(`Failed to delete session ${key}:`, error);
          }
        },
      },
    }),
  );
}

