import { Bot } from 'grammy';
import { MyContext } from '../middleware';
import { config } from '../config';

/**
 * Bot command definition
 */
export interface BotCommand {
  command: string;
  description: string;
}

/**
 * Talent commands (available to all users)
 */
export const TALENT_COMMANDS: BotCommand[] = [
  { command: 'start', description: 'Create talent account or view main menu' },
  { command: 'profile', description: 'View your talent profile' },
  { command: 'update_profile', description: 'Update the profile' },
  { command: 'upload_cv', description: 'Upload or update your CV' },
  { command: 'post_jobs', description: 'Navigate to the channel' },
  { command: 'help', description: 'Show help information' },
  { command: 'cancel', description: 'Cancel current operation' },
];

/**
 * Admin commands (only for admins)
 */
export const ADMIN_COMMANDS: BotCommand[] = [
  { command: 'create_job', description: 'Create a new job posting' },
  { command: 'my_jobs', description: 'List all your created jobs' },
  { command: 'job_status', description: 'View detailed job status' },
  { command: 'publish_job', description: 'Publish a pending job' },
  { command: 'reject_job', description: 'Reject a pending job' },
  { command: 'close_job', description: 'Close a published job' },
];

/**
 * Set bot commands for a specific user based on their role
 * This updates the command list that appears when typing "/" in Telegram
 */
export async function setUserCommands(
  bot: Bot<MyContext>,
  userId: number,
  isAdmin: boolean
): Promise<void> {
  try {
    const commands = isAdmin
      ? [...TALENT_COMMANDS, ...ADMIN_COMMANDS]
      : TALENT_COMMANDS;

    // Set commands for specific user using BotCommandScope
    // For private chats, use 'chat' scope type with user's chat ID
    // In private chats, chat_id equals user_id
    await bot.api.setMyCommands(commands, {
      scope: {
        type: 'chat',
        chat_id: userId,
      },
    });
  } catch (error) {
    console.error('Failed to set user commands:', error);
    // Fallback: set default commands if user-specific fails
    // Note: This might not be supported in all Telegram clients
    // The commands will still work, just won't show in the menu
  }
}

/**
 * Set default bot commands (shown to all users)
 * This is a fallback if user-specific commands fail
 */
export async function setDefaultCommands(
  bot: Bot<MyContext>,
  showAdminCommands: boolean = false
): Promise<void> {
  try {
    const commands = showAdminCommands
      ? [...TALENT_COMMANDS, ...ADMIN_COMMANDS]
      : TALENT_COMMANDS;

    await bot.api.setMyCommands(commands);
    console.log(`✅ Default bot commands set (${commands.length} commands)`);
  } catch (error) {
    console.error('Failed to set default commands:', error);
  }
}

/**
 * Check if a user is an admin
 */
export function isAdmin(userId: number | string): boolean {
  const userIdStr = userId.toString();
  return config.ADMIN_TELEGRAM_IDS.includes(userIdStr);
}

/**
 * Initialize bot commands on startup
 * Sets default commands for talents (most common case)
 */
export async function initializeBotCommands(bot: Bot<MyContext>): Promise<void> {
  // Set default commands for talents (most users)
  await setDefaultCommands(bot, false);
  console.log('✅ Bot commands initialized');
}

