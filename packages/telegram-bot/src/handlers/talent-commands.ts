import { Bot } from 'grammy';
import { apiClient } from '../api/api-client';
import { MyContext } from '../middleware';
import {
  ServiceCategoryLabels,
  ExperienceLevelLabels,
  TalentStatus,
} from '@blihops/shared';
import { setUserCommands, isAdmin } from '../utils/bot-commands';
import { validateCVFile, downloadTelegramFile } from '../utils/file-handler';
import { handleError } from '../utils/error-handler';
import { clearSessionState } from '../utils/session-cleanup';

/**
 * Register talent-specific commands
 * These commands are available to all users, but some may show different content based on role
 */
export function registerTalentCommands(bot: Bot<MyContext>): void {
  // /profile - View profile
  bot.command('profile', async (ctx) => {
    try {
      const telegramId = ctx.from!.id.toString();
      const talent = await apiClient.getTalentByTelegramId(telegramId);

      if (!talent) {
        await ctx.reply(
          "You don't have a profile yet. Send /start to create one."
        );
        return;
      }

      // Format service category
      const categoryText = Array.isArray(talent.serviceCategory)
        ? talent.serviceCategory
            .map((cat) => ServiceCategoryLabels[cat])
            .join(', ')
        : ServiceCategoryLabels[talent.serviceCategory];

      // Format experience level
      const experienceText = ExperienceLevelLabels[talent.experienceLevel];

      // Format status with emoji
      const statusEmoji: Record<TalentStatus, string> = {
        [TalentStatus.PENDING]: '⏳',
        [TalentStatus.APPROVED]: '✅',
        [TalentStatus.REJECTED]: '❌',
        [TalentStatus.HIRED]: '🎉',
        [TalentStatus.INACTIVE]: '💤',
      };

      const statusText = `${statusEmoji[talent.status]} ${talent.status}`;

      // Get bio from metadata if available
      const bio =
        talent.metadata && typeof talent.metadata.bio === 'string'
          ? talent.metadata.bio
          : undefined;

      // Build profile message
      let profileText =
        '👤 Your Profile:\n\n' +
        `Name: ${talent.name}\n` +
        `Category: ${categoryText}\n` +
        `${talent.roleSpecialization ? `Role: ${talent.roleSpecialization}\n` : ''}` +
        `Skills: ${talent.skills.join(', ')}\n` +
        `Experience: ${experienceText}\n` +
        `Availability: ${talent.availability}\n` +
        `Status: ${statusText}\n`;

      if (bio) {
        profileText += `\nBio: ${bio}`;
      }

      if (talent.cvUrl) {
        profileText += '\n\n📄 CV: Uploaded';
      }

      await ctx.reply(profileText);
    } catch (error) {
      await handleError(ctx, error, '❌ Failed to fetch profile. Please try again later.');
    }
  });

  // /update_profile - Update profile
  bot.command('update_profile', async (ctx) => {
    try {
      const telegramId = ctx.from!.id.toString();
      const talent = await apiClient.getTalentByTelegramId(telegramId);

      if (!talent) {
        await ctx.reply(
          "You don't have a profile yet. Send /start to create one first."
        );
        return;
      }

      await ctx.reply(
        'Profile update functionality is being implemented.\n\n' +
        'For now, you can:\n' +
        '• Use /profile to view your current profile\n' +
        '• Contact support to update your profile manually\n\n' +
        'Full profile editing will be available soon!'
      );
      // TODO: Implement profile update conversation
    } catch (error) {
      await handleError(ctx, error, '❌ An error occurred. Please try again later.');
    }
  });

  // /post_jobs - Navigate to channel
  bot.command('post_jobs', async (ctx) => {
    try {
      const { config } = await import('../config');
      
      // Use jobs channel for job postings
      const jobsChannelId = config.TELEGRAM_CHANNEL_ID_JOBS || config.TELEGRAM_CHANNEL_ID;
      if (jobsChannelId) {
        const channelId = jobsChannelId.replace('@', '').replace('-', '');
        await ctx.reply(
          '💼 **Job Postings Channel**\n\n' +
          `View all available job postings in our channel:\n\n` +
          `👉 https://t.me/c/${channelId.substring(1)}/${channelId}\n\n` +
          'Browse jobs, apply directly, and stay updated with new opportunities!',
          { parse_mode: 'Markdown' }
        );
      } else {
        await ctx.reply(
          '❌ Channel link is not configured yet.\n\n' +
          'Please contact support for job postings or check back later.'
        );
      }
    } catch (error) {
      await handleError(ctx, error, '❌ An error occurred. Please try again later.');
    }
  });

  // /upload_cv - Upload CV
  bot.command('upload_cv', async (ctx) => {
    try {
      const telegramId = ctx.from!.id.toString();
      const talent = await apiClient.getTalentByTelegramId(telegramId);

      if (!talent) {
        await ctx.reply(
          "You don't have a profile yet. Send /start to create one first."
        );
        return;
      }

      // Set session state to wait for CV upload
      ctx.session.state = 'uploading_cv';
      ctx.session.data = { talentId: talent.id };

      await ctx.reply(
        '📄 Please upload your CV:\n\n' +
          '**Supported formats:** PDF, DOC, DOCX\n' +
          '**Maximum size:** 10MB\n\n' +
          'Send your CV file now, or /cancel to abort.'
      );
    } catch (error) {
      clearSessionState(ctx);
      await handleError(ctx, error, '❌ An error occurred. Please try again later.');
    }
  });

  // Handle text messages when in uploading_cv state (provide feedback)
  bot.on('message:text', async (ctx: MyContext) => {
    if (ctx.session.state !== 'uploading_cv') {
      return; // Not in CV upload state, ignore
    }

    // Ignore commands (they're handled separately)
    if (ctx.message?.text?.startsWith('/')) {
      return;
    }

    // Provide feedback for text messages during upload
    await ctx.reply(
      '📄 Please upload a CV file (PDF, DOC, or DOCX).\n\n' +
        'Text messages are not accepted. Please send your CV file or use /cancel to abort.'
    );
  });

  // Handle document messages when in uploading_cv state
  bot.on('message:document', async (ctx: MyContext) => {
    if (ctx.session.state !== 'uploading_cv') {
      return; // Not in CV upload state, ignore
    }

    try {
      const doc = ctx.message?.document;
      if (!doc) {
        return;
      }

      const filename = doc.file_name || 'cv.pdf';
      const fileSize = doc.file_size || 0;
      const fileId = doc.file_id;

      if (!fileId) {
        await ctx.reply('❌ Invalid file. Please try again or /cancel to abort.');
        return;
      }

      // Validate file
      const validation = validateCVFile(filename, fileSize);
      if (!validation.isValid) {
        await ctx.reply(
          `❌ ${validation.error}\n\n` +
            'Please upload a valid CV file (PDF, DOC, DOCX, max 10MB) or /cancel to abort.'
        );
        return;
      }

      // Get talent ID from session
      const talentId = ctx.session.data?.talentId;
      if (!talentId) {
        clearSessionState(ctx);
        await ctx.reply(
          '❌ Session error. Please try /upload_cv again or /cancel to abort.'
        );
        return;
      }

      // Show processing message
      await ctx.reply('⏳ Processing your CV...');

      try {
        // Download file from Telegram
        const fileBuffer = await downloadTelegramFile(ctx.api, fileId);

        // Upload to backend
        await apiClient.uploadCV(fileBuffer, talentId, filename);

        // Clear session state
        clearSessionState(ctx);

        await ctx.reply(
          '✅ CV uploaded successfully!\n\n' +
            'Your CV has been updated in your profile. Use /profile to view your updated profile.'
        );
      } catch (uploadError) {
        // Clear session on error
        clearSessionState(ctx);
        await handleError(
          ctx,
          uploadError,
          '❌ Failed to upload CV. Please try again later or contact support.\n\n' +
            'Use /cancel to exit upload mode.'
        );
      }
    } catch (error) {
      // Clear session on error
      clearSessionState(ctx);
      await handleError(
        ctx,
        error,
        '❌ An error occurred while processing your CV. Please try again or /cancel to abort.'
      );
    }
  });

  // /help - Help message
  bot.command('help', async (ctx) => {
    const userIsAdmin = ctx.session.role === 'admin';

    let helpText = '📖 **Available Commands**\n\n';
    helpText += '**Talent Commands:**\n';
    helpText += '• /start - Create talent account or view main menu\n';
    helpText += '• /profile - View your talent profile\n';
    helpText += '• /update_profile - Update the profile\n';
    helpText += '• /upload_cv - Upload or update your CV\n';
    helpText += '• /find_jobs - Find matching jobs for your profile\n';
    helpText += '• /my_applications - View your job applications\n';
    helpText += '• /post_jobs - Navigate to the channel\n';
    helpText += '• /help - Show help information\n';
    helpText += '• /cancel - Cancel current operation\n';

    if (userIsAdmin) {
      helpText += '\n👨‍💼 **Admin Commands:**\n';
      helpText += '• /create_job - Create a new job posting\n';
      helpText += '• /my_jobs - List all your created jobs\n';
      helpText += '• /job_status - View detailed job status\n';
      helpText += '• /publish_job - Publish a pending job\n';
      helpText += '• /reject_job - Reject a pending job\n';
      helpText += '• /close_job - Close a published job\n';
      helpText += '• /find_talents - Find matching talents for a job\n';
      helpText += '• /view_applicants - View applicants for a job\n';
      helpText += '• /stats - View platform statistics and analytics\n';
    }

    await ctx.reply(helpText, { parse_mode: 'Markdown' });
  });

  // /cancel - Cancel operation
  bot.command('cancel', async (ctx) => {
    try {
      // Clear session state if in upload mode
      if (ctx.session.state === 'uploading_cv') {
        clearSessionState(ctx);
        await ctx.reply('✅ CV upload cancelled.');
        return;
      }

      // Exit any active conversation
      await ctx.conversation.exit();
      await ctx.reply('✅ Operation cancelled.');
    } catch (error) {
      // If no conversation is active, just confirm
      // Also clear upload state if it exists
      if (ctx.session.state === 'uploading_cv') {
        clearSessionState(ctx);
      }
      await ctx.reply('✅ No active operation to cancel.');
    }
  });

  // /refresh_commands - Refresh bot commands menu (useful for admins)
  bot.command('refresh_commands', async (ctx: MyContext) => {
    try {
      if (ctx.chat?.type === 'private' && ctx.from) {
        const userId = ctx.from.id;
        const userIsAdmin = isAdmin(userId);
        
        await setUserCommands(bot, userId, userIsAdmin);
        
        // Clear the session flag to force update
        if (ctx.session.data) {
          ctx.session.data.commandsSet = false;
        }
        
        await ctx.reply(
          '✅ Bot commands refreshed!\n\n' +
          'Try typing "/" to see your available commands.'
        );
      } else {
        await ctx.reply('This command only works in private chats.');
      }
    } catch (error) {
      await handleError(
        ctx,
        error,
        '❌ Failed to refresh commands. They will still work, just might not show in the menu.'
      );
    }
  });
}

