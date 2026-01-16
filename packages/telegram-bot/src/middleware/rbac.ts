import { NextFunction } from 'grammy';
import { config } from '../config';
import { MyContext } from './session';

/**
 * Admin-only middleware
 * Restricts access to admin commands
 * Must be used after session middleware and detectRole middleware
 */
export function adminOnly() {
  return async (ctx: MyContext, next: NextFunction) => {
    const userId = ctx.from?.id?.toString();
    
    if (!userId || !config.ADMIN_TELEGRAM_IDS.includes(userId)) {
      await ctx.reply('❌ This command is only available to admins.');
      return; // Don't call next(), stop processing
    }

    // Ensure role is set in session
    ctx.session.role = 'admin';
    return next();
  };
}

/**
 * Role detection middleware
 * Automatically detects if user is admin or talent based on ADMIN_TELEGRAM_IDS
 * Must be used after session middleware
 */
export function detectRole() {
  return async (ctx: MyContext, next: NextFunction) => {
    const userId = ctx.from?.id?.toString();
    
    if (userId && config.ADMIN_TELEGRAM_IDS.includes(userId)) {
      ctx.session.role = 'admin';
    } else {
      ctx.session.role = 'talent';
    }

    return next();
  };
}

