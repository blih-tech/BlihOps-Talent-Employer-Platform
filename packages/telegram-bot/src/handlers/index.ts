import { Bot, InlineKeyboard } from 'grammy';
import { MyContext } from '../middleware';
import { registerAdminCommands } from './admin-commands';
import { registerTalentCommands } from './talent-commands';
import { registerMatchingCommands } from './matching-commands';
import { registerAdminStatsCommands } from './admin-stats-commands';
import { registerApplicationCommands } from './application-commands';
import { apiClient } from '../api/api-client';
import { isAdmin } from '../utils/bot-commands';
import { config } from '../config';
import { handleError, handleCallbackError } from '../utils/error-handler';

/**
 * Register all command and message handlers
 */
export function registerHandlers(bot: Bot<MyContext>): void {
  // /start - Entry point with role-based menu
  bot.command('start', async (ctx: MyContext) => {
    try {
      const telegramId = ctx.from!.id.toString();
      const userIsAdmin = isAdmin(Number(telegramId));
      const existingTalent = await apiClient.getTalentByTelegramId(telegramId);

      if (userIsAdmin) {
        // Admin menu
        const adminKeyboard = new InlineKeyboard()
          .text('📝 Create Job', 'cmd:create_job').row()
          .text('📋 My Jobs', 'cmd:my_jobs')
          .text('📊 Job Status', 'cmd:job_status').row()
          .text('✅ Publish Job', 'cmd:publish_job')
          .text('❌ Reject Job', 'cmd:reject_job').row()
          .text('🔒 Close Job', 'cmd:close_job')
          .text('👥 Find Talents', 'cmd:find_talents').row()
          .text('📋 View Applicants', 'cmd:view_applicants')
          .text('📈 Platform Stats', 'cmd:stats').row()
          .text('❓ Help', 'cmd:help');

        await ctx.reply(
          '👋 Welcome to BlihOps Talent Platform!\n\n' +
          '👨‍💼 **Admin Menu**\n\n' +
          '**Admin Commands:**\n' +
          '• Create Job - Create a new job posting\n' +
          '• My Jobs - List all your created jobs\n' +
          '• Job Status - View detailed job status\n' +
          '• Publish Job - Publish a pending job\n' +
          '• Reject Job - Reject a pending job\n' +
          '• Close Job - Close a published job\n' +
          '• Find Talents - Find matching talents for a job\n' +
          '• View Applicants - View applicants for a job\n' +
          '• Platform Stats - View platform statistics and analytics\n\n' +
          'Select an option below or use commands:',
          { reply_markup: adminKeyboard, parse_mode: 'Markdown' }
        );
      } else {
        // Talent menu
        const talentKeyboard = new InlineKeyboard()
          .text('👤 Create Talent Account', 'cmd:create_account').row()
          .text('📄 View Profile', 'cmd:profile')
          .text('✏️ Update Profile', 'cmd:update_profile').row()
          .text('📎 Upload CV', 'cmd:upload_cv')
          .text('🔍 Find Jobs', 'cmd:find_jobs').row()
          .text('📋 My Applications', 'cmd:my_applications')
          .text('💼 Post Jobs', 'cmd:post_jobs').row()
          .text('❓ Help', 'cmd:help')
          .text('❌ Cancel', 'cmd:cancel');

        if (existingTalent) {
          await ctx.reply(
            '👋 Welcome back to BlihOps Talent Platform!\n\n' +
            '👤 **Talent Menu**\n\n' +
            '**Talent Commands:**\n' +
            '• Create Talent Account - Create your talent profile\n' +
            '• View Profile - View your talent profile\n' +
            '• Update Profile - Update the profile\n' +
            '• Upload CV - Upload or update your CV\n' +
            '• Find Jobs - Find matching jobs for your profile\n' +
            '• My Applications - View your job applications\n' +
            '• Post Jobs - Navigate to the channel\n' +
            '• Help - Show help information\n' +
            '• Cancel - Cancel current operation\n\n' +
            'Select an option below or use commands:',
            { reply_markup: talentKeyboard, parse_mode: 'Markdown' }
          );
        } else {
          await ctx.reply(
            '👋 Welcome to BlihOps Talent Platform!\n\n' +
            '👤 **Talent Menu**\n\n' +
            '**Talent Commands:**\n' +
            '• Create Talent Account - Create your talent profile\n' +
            '• View Profile - View your talent profile\n' +
            '• Update Profile - Update the profile\n' +
            '• Upload CV - Upload or update your CV\n' +
            '• Find Jobs - Find matching jobs for your profile\n' +
            '• My Applications - View your job applications\n' +
            '• Post Jobs - Navigate to the channel\n' +
            '• Help - Show help information\n' +
            '• Cancel - Cancel current operation\n\n' +
            'Start by creating your talent account:',
            { reply_markup: talentKeyboard, parse_mode: 'Markdown' }
          );
        }
      }
    } catch (error) {
      await handleError(
        ctx,
        error,
        '👋 Welcome to BlihOps Talent Platform!\n\n' +
        'An error occurred. Please try again or use /help for assistance.'
      );
    }
  });

  // Handle inline button callbacks - redirect to commands
  bot.callbackQuery(/^cmd:(.+)$/, async (ctx: MyContext) => {
    if (!ctx.match || !ctx.match[1]) {
      await ctx.answerCallbackQuery({ text: 'Invalid command', show_alert: true });
      return;
    }
    
    const command = ctx.match[1];
    
    try {
      await ctx.answerCallbackQuery();
      
      // Handle special cases
      if (command === 'create_account') {
        await ctx.conversation.enter('onboardingConversation');
        return;
      }
      
      if (command === 'post_jobs') {
        // Use jobs channel for job postings
        const jobsChannelId = config.TELEGRAM_CHANNEL_ID_JOBS || config.TELEGRAM_CHANNEL_ID;
        if (jobsChannelId) {
          const channelId = jobsChannelId.replace('@', '').replace('-', '');
          await ctx.reply(
            `💼 **Job Postings Channel**\n\n` +
            `View all available job postings in our channel:\n\n` +
            `👉 https://t.me/c/${channelId.substring(1)}/${channelId}\n\n` +
            'Browse jobs, apply directly, and stay updated with new opportunities!',
            { parse_mode: 'Markdown' }
          );
        } else {
          await ctx.reply('Channel link not configured. Please contact support.');
        }
        return;
      }
      
      // For other commands, create a fake message to trigger the command handler
      const fakeMessage = {
        ...ctx.message,
        text: `/${command}`,
        entities: [{ type: 'bot_command', offset: 0, length: command.length + 1 }],
      } as any;
      
      // Trigger the command handler
      await bot.handleUpdate({
        ...ctx.update,
        message: fakeMessage,
        callback_query: undefined,
      } as any);
    } catch (error) {
      await handleCallbackError(
        ctx,
        error,
        'Failed to execute command. Please try using the command directly.'
      );
      await ctx.reply(`Please use /${command} command instead.`);
    }
  });

  // Register talent commands (includes /profile, /upload_cv, /help, /cancel)
  registerTalentCommands(bot);

  // Register admin commands
  registerAdminCommands(bot);

  // Register admin stats commands (includes /stats)
  registerAdminStatsCommands(bot);

  // Register matching commands (includes /find_jobs, /find_talents)
  registerMatchingCommands(bot);

  // Register application commands (includes /view_applicants, /my_applications)
  registerApplicationCommands(bot);

  console.log('✅ Handlers registered');
}

