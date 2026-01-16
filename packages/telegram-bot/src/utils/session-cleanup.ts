import { Context } from 'grammy';
import { SessionData } from '../middleware';

/**
 * Clear session state and data
 * Useful when errors occur or operations are cancelled
 */
export function clearSessionState(ctx: Context & { session?: SessionData }): void {
  if (ctx.session) {
    ctx.session.state = undefined;
    ctx.session.data = undefined;
  }
}

/**
 * Reset session to initial state
 */
export function resetSession(ctx: Context & { session?: SessionData }): void {
  if (ctx.session) {
    ctx.session.state = undefined;
    ctx.session.data = undefined;
    // Keep role if it exists, as it's useful to maintain
    // ctx.session.role can stay as is
  }
}

/**
 * Clear specific session state
 */
export function clearSessionStateValue(
  ctx: Context & { session?: SessionData },
  key: keyof SessionData
): void {
  if (ctx.session) {
    if (key === 'state') {
      ctx.session.state = undefined;
    } else if (key === 'data') {
      ctx.session.data = undefined;
    } else if (key === 'role') {
      // Don't clear role, as it's set by middleware
      // But if needed, uncomment:
      // ctx.session.role = undefined;
    }
  }
}

/**
 * Check if session has active state
 */
export function hasActiveSessionState(
  ctx: Context & { session?: SessionData }
): boolean {
  return !!(ctx.session?.state);
}

/**
 * Get current session state
 */
export function getSessionState(
  ctx: Context & { session?: SessionData }
): string | undefined {
  return ctx.session?.state;
}


