import { Context, NextFunction } from 'grammy';

/**
 * Logging middleware
 * Logs all incoming messages and commands for debugging and monitoring
 */
export function loggerMiddleware() {
  return async (ctx: Context, next: NextFunction) => {
    const userId = ctx.from?.id;
    const username = ctx.from?.username;
    const chatId = ctx.chat?.id;
    
    // Log command or message
    if (ctx.message) {
      const messageType = ctx.message.text ? 'text' : 
                         ctx.message.document ? 'document' :
                         ctx.message.photo ? 'photo' :
                         'other';
      
      const logData = {
        userId,
        username: username || 'unknown',
        chatId,
        messageType,
        text: ctx.message.text?.substring(0, 100), // Truncate long messages
        command: ctx.message.entities?.find(e => e.type === 'bot_command')?.type,
        timestamp: new Date().toISOString(),
      };
      
      console.log(`[BOT] ${logData.messageType.toUpperCase()}`, logData);
    }
    
    // Log callback queries (button clicks)
    if (ctx.callbackQuery) {
      console.log(`[BOT] CALLBACK_QUERY`, {
        userId,
        username: username || 'unknown',
        chatId,
        data: ctx.callbackQuery.data,
        timestamp: new Date().toISOString(),
      });
    }

    // Continue to next middleware
    return next();
  };
}


