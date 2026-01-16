import { Bot, InlineKeyboard } from 'grammy';
import { MyContext, adminOnly } from '../middleware';
import { apiClient } from '../api/api-client';
import {
  TalentStatus,
  JobStatus,
  ServiceCategoryLabels,
  ExperienceLevelLabels,
  EngagementTypeLabels,
} from '@blihops/shared';
import { handleError, handleCallbackError, isDuplicateError, isNotFoundError } from '../utils/error-handler';
import { isValidJobId, extractId } from '../utils/validators';
import { clearSessionState } from '../utils/session-cleanup';

/**
 * Register matching-related commands
 * Includes talent job matching and admin talent matching
 */
export function registerMatchingCommands(bot: Bot<MyContext>): void {
  // ==========================================
  // Talent Job Matching (/find_jobs)
  // ==========================================

  bot.command('find_jobs', async (ctx: MyContext) => {
    try {
      const telegramId = ctx.from!.id.toString();
      
      // Verify talent exists and is approved
      const talent = await apiClient.getTalentByTelegramId(telegramId);
      
      if (!talent) {
        await ctx.reply(
          "❌ You don't have a talent profile yet.\n\n" +
          "Please create your profile first using /start or /create_account."
        );
        return;
      }

      if (talent.status !== TalentStatus.APPROVED) {
        const statusMessage: Record<TalentStatus, string> = {
          [TalentStatus.PENDING]: '⏳ Your profile is pending approval. Please wait for admin approval.',
          [TalentStatus.REJECTED]: '❌ Your profile has been rejected. Please contact support.',
          [TalentStatus.HIRED]: '🎉 Congratulations! You have been hired.',
          [TalentStatus.INACTIVE]: '💤 Your profile is inactive. Please contact support to reactivate.',
          [TalentStatus.APPROVED]: '', // Should not reach here
        };
        
        await ctx.reply(statusMessage[talent.status] || '❌ Your profile is not approved.');
        return;
      }

      // Get matching jobs
      await ctx.reply('🔍 Searching for matching jobs...');
      
      const matches = await apiClient.getMatchingJobsForTalent(talent.id);
      
      if (!matches || matches.length === 0) {
        await ctx.reply(
          '📭 No matching jobs found at the moment.\n\n' +
          'Try updating your profile with more skills or check back later!'
        );
        return;
      }

      // Display top 10 matches
      const topMatches = matches.slice(0, 10);
      
      let message = '💼 **Matching Jobs** (Top 10)\n\n';
      
      topMatches.forEach((match, index) => {
        const job = match.job;
        const score = Math.round(match.matchScore || 0);
        
        // Only show published jobs
        if (job.status !== JobStatus.PUBLISHED) {
          return;
        }
        
        const categoryText = Array.isArray(job.serviceCategory)
          ? job.serviceCategory.map((cat: any) => ServiceCategoryLabels[cat as keyof typeof ServiceCategoryLabels] || cat).join(', ')
          : ServiceCategoryLabels[job.serviceCategory as keyof typeof ServiceCategoryLabels] || job.serviceCategory;
        
        const engagementText = Array.isArray(job.engagementType)
          ? job.engagementType.map((eng: any) => EngagementTypeLabels[eng as keyof typeof EngagementTypeLabels] || eng).join(', ')
          : EngagementTypeLabels[job.engagementType as keyof typeof EngagementTypeLabels] || job.engagementType;
        
        message += `${index + 1}. **${job.title}**\n`;
        message += `   📊 Match Score: ${score}%\n`;
        message += `   📁 Category: ${categoryText}\n`;
        message += `   💼 Engagement: ${engagementText}\n`;
        message += `   🆔 ID: \`${job.id}\`\n\n`;
      });

      // Create inline keyboard with buttons for each job
      const keyboard = new InlineKeyboard();
      
      topMatches
        .filter((match) => match.job.status === JobStatus.PUBLISHED)
        .forEach((match, index) => {
          const job = match.job;
          keyboard
            .text(`📋 ${index + 1}. ${job.title.substring(0, 20)}...`, `job_detail_${job.id}`)
            .row();
        });

      keyboard.text('🔄 Refresh', 'refresh_find_jobs').row();

      await ctx.reply(message, {
        reply_markup: keyboard,
        parse_mode: 'Markdown',
      });
    } catch (error) {
      await handleError(
        ctx,
        error,
        '❌ Failed to find matching jobs. Please try again later.'
      );
    }
  });

  // ==========================================
  // Admin Talent Matching (/find_talents)
  // ==========================================

  bot.command('find_talents', adminOnly(), async (ctx: MyContext) => {
    try {
      ctx.session.state = 'awaiting_find_talents_job_id';
      await ctx.reply(
        '🔍 **Find Matching Talents**\n\n' +
        'Please send the Job ID to find matching talents:'
      );
    } catch (error) {
      clearSessionState(ctx);
      await handleError(ctx, error, '❌ An error occurred. Please try again.');
    }
  });

  // Handle job ID input for find_talents
  bot.on('message:text', adminOnly(), async (ctx: MyContext) => {
    const state = ctx.session.state;
    if (state !== 'awaiting_find_talents_job_id') return;
    if (!ctx.message?.text) return;

    // Ignore commands
    if (ctx.message.text.startsWith('/')) {
      return;
    }

    // Extract and validate job ID
    const extractedId = extractId(ctx.message.text);
    const jobId = extractedId || ctx.message.text.trim();
    
    // Clear session state early
    clearSessionState(ctx);

    // Validate job ID format
    if (!isValidJobId(jobId)) {
      await ctx.reply(
        '❌ Invalid job ID format. Please provide a valid job ID.\n\n' +
        'Example: Send just the job ID (e.g., abc123def456)'
      );
      return;
    }

    try {
      // Verify job exists
      const job = await apiClient.getJob(jobId);
      
      await ctx.reply('🔍 Searching for matching talents...');
      
      // Get matching talents
      const matches = await apiClient.getMatchingTalentsForJob(jobId);
      
      if (!matches || matches.length === 0) {
        await ctx.reply(
          `📭 No matching talents found for job "${job.title}".\n\n` +
          'Try adjusting the job requirements or check back later!'
        );
        return;
      }

      // Display matching talents
      let message = `👥 **Matching Talents for: ${job.title}**\n\n`;
      
      matches.forEach((match, index) => {
        const talent = match.talent;
        const score = Math.round(match.matchScore || 0);
        
        // Only show approved talents
        if (talent.status !== TalentStatus.APPROVED) {
          return;
        }
        
        const categoryText = Array.isArray(talent.serviceCategory)
          ? talent.serviceCategory.map((cat) => ServiceCategoryLabels[cat]).join(', ')
          : ServiceCategoryLabels[talent.serviceCategory];
        
        const experienceText = ExperienceLevelLabels[talent.experienceLevel];
        
        message += `${index + 1}. **${talent.name}**\n`;
        message += `   📊 Match Score: ${score}%\n`;
        message += `   📁 Category: ${categoryText}\n`;
        message += `   💼 Experience: ${experienceText}\n`;
        message += `   🆔 ID: \`${talent.id}\`\n\n`;
      });

      // Create inline keyboard with buttons for each talent
      const keyboard = new InlineKeyboard();
      
      matches
        .filter((match) => match.talent.status === TalentStatus.APPROVED)
        .forEach((match, index) => {
          const talent = match.talent;
          keyboard
            .text(`👤 ${index + 1}. ${talent.name}`, `talent_detail_${talent.id}_${jobId}`)
            .row();
        });

      keyboard.text('🔄 Refresh', `refresh_find_talents_${jobId}`).row();

      await ctx.reply(message, {
        reply_markup: keyboard,
        parse_mode: 'Markdown',
      });
    } catch (error) {
      // Provide specific error messages based on error type
      if (isNotFoundError(error)) {
        await ctx.reply(
          '❌ Job not found. Please check the job ID and try again.\n\n' +
          'Use /my_jobs to see your jobs.'
        );
      } else {
        await handleError(
          ctx,
          error,
          '❌ Failed to find matching talents. Please check the job ID and try again.'
        );
      }
    }
  });

  // ==========================================
  // Callback Query Handlers
  // ==========================================

  // Job detail callback: job_detail_${jobId}
  bot.callbackQuery(/^job_detail_(.+)$/, async (ctx: MyContext) => {
    if (!ctx.match || !ctx.match[1]) {
      await ctx.answerCallbackQuery({ text: 'Invalid job ID', show_alert: true });
      return;
    }

    const jobId = ctx.match[1];

    try {
      await ctx.answerCallbackQuery();
      
      const job = await apiClient.getJob(jobId);
      
      const categoryText = Array.isArray(job.serviceCategory)
        ? job.serviceCategory.map((cat: any) => ServiceCategoryLabels[cat as keyof typeof ServiceCategoryLabels] || cat).join(', ')
        : ServiceCategoryLabels[job.serviceCategory as keyof typeof ServiceCategoryLabels] || job.serviceCategory;
      
      const engagementText = Array.isArray(job.engagementType)
        ? job.engagementType.map((eng: any) => EngagementTypeLabels[eng as keyof typeof EngagementTypeLabels] || eng).join(', ')
        : EngagementTypeLabels[job.engagementType as keyof typeof EngagementTypeLabels] || job.engagementType;
      
      let message = `📋 **Job Details**\n\n`;
      message += `**Title:** ${job.title}\n`;
      message += `**Description:** ${job.description || 'N/A'}\n`;
      message += `**Category:** ${categoryText}\n`;
      message += `**Engagement:** ${engagementText}\n`;
      message += `**Skills Required:** ${job.requiredSkills.join(', ')}\n`;
      
      if (job.duration) {
        message += `**Duration:** ${job.duration}\n`;
      }
      
      // Budget property may not exist on Job type
      // if (job.budget) {
      //   message += `**Budget:** ${job.budget}\n`;
      // }
      
      message += `**Status:** ${job.status}\n`;
      message += `**ID:** \`${job.id}\`\n`;

      // Get talent to check if they can apply
      const telegramId = ctx.from!.id.toString();
      const talent = await apiClient.getTalentByTelegramId(telegramId);
      
      const keyboard = new InlineKeyboard();
      
      if (talent && talent.status === TalentStatus.APPROVED && job.status === JobStatus.PUBLISHED) {
        keyboard.text('✅ Apply Now', `apply_job_${jobId}`).row();
      }
      
      keyboard.text('🔙 Back to Matches', 'refresh_find_jobs');

      await ctx.editMessageText(message, {
        reply_markup: keyboard,
        parse_mode: 'Markdown',
      });
    } catch (error) {
      await handleCallbackError(
        ctx,
        error,
        isNotFoundError(error)
          ? 'Job not found. It may have been deleted.'
          : 'Failed to load job details. Please try again.'
      );
    }
  });

  // Apply to job callback: apply_job_${jobId}
  bot.callbackQuery(/^apply_job_(.+)$/, async (ctx: MyContext) => {
    if (!ctx.match || !ctx.match[1]) {
      await ctx.answerCallbackQuery({ text: 'Invalid job ID', show_alert: true });
      return;
    }

    const jobId = ctx.match[1];

    try {
      await ctx.answerCallbackQuery({ text: 'Processing application...' });
      
      const telegramId = ctx.from!.id.toString();
      const talent = await apiClient.getTalentByTelegramId(telegramId);
      
      if (!talent) {
        await ctx.reply(
          "❌ You don't have a talent profile. Please create one first."
        );
        return;
      }

      if (talent.status !== TalentStatus.APPROVED) {
        await ctx.reply(
          '❌ Your profile must be approved before you can apply to jobs.'
        );
        return;
      }

      // Get match score if available
      const matches = await apiClient.getMatchingJobsForTalent(talent.id);
      const match = matches.find((m) => m.job.id === jobId);
      const matchScore = match?.matchScore;

      // Create application
      const application = await apiClient.createApplication(jobId, talent.id, matchScore);
      
      await ctx.reply(
        `✅ **Application Submitted!**\n\n` +
        `You have successfully applied to the job.\n` +
        `Application ID: \`${application.id}\`\n\n` +
        `We'll notify you when the employer reviews your application.`,
        { parse_mode: 'Markdown' }
      );
    } catch (error: any) {
      // Handle duplicate application error
      if (isDuplicateError(error)) {
        await handleCallbackError(
          ctx,
          error,
          'You have already applied to this job.'
        );
        return;
      }
      
      await handleCallbackError(
        ctx,
        error,
        'Failed to submit application. Please try again later.'
      );
    }
  });

  // Talent detail callback: talent_detail_${talentId}_${jobId}
  bot.callbackQuery(/^talent_detail_(.+)_(.+)$/, async (ctx: MyContext) => {
    if (!ctx.match || !ctx.match[1] || !ctx.match[2]) {
      await ctx.answerCallbackQuery({ text: 'Invalid parameters', show_alert: true });
      return;
    }

    const talentId = ctx.match[1];
    const jobId = ctx.match[2];

    try {
      await ctx.answerCallbackQuery();
      
      const talent = await apiClient.getTalent(talentId);
      
      const categoryText = Array.isArray(talent.serviceCategory)
        ? talent.serviceCategory.map((cat) => ServiceCategoryLabels[cat]).join(', ')
        : ServiceCategoryLabels[talent.serviceCategory];
      
      const experienceText = ExperienceLevelLabels[talent.experienceLevel];
      
      let message = `👤 **Talent Profile**\n\n`;
      message += `**Name:** ${talent.name}\n`;
      message += `**Category:** ${categoryText}\n`;
      
      if (talent.roleSpecialization) {
        message += `**Role:** ${talent.roleSpecialization}\n`;
      }
      
      message += `**Skills:** ${talent.skills.join(', ')}\n`;
      message += `**Experience:** ${experienceText}\n`;
      message += `**Availability:** ${talent.availability}\n`;
      message += `**Status:** ${talent.status}\n`;
      
      if (talent.metadata && typeof talent.metadata.bio === 'string') {
        message += `\n**Bio:** ${talent.metadata.bio}\n`;
      }
      
      if (talent.cvUrl) {
        message += `\n📄 CV: Available\n`;
      }
      
      message += `\n**ID:** \`${talent.id}\`\n`;

      const keyboard = new InlineKeyboard();
      keyboard.text('⭐ Shortlist', `shortlist_${talentId}_${jobId}`).row();
      keyboard.text('🔙 Back to Matches', `refresh_find_talents_${jobId}`);

      await ctx.editMessageText(message, {
        reply_markup: keyboard,
        parse_mode: 'Markdown',
      });
    } catch (error) {
      await handleCallbackError(
        ctx,
        error,
        isNotFoundError(error)
          ? 'Talent profile not found. It may have been deleted.'
          : 'Failed to load talent profile. Please try again.'
      );
    }
  });

  // Shortlist talent callback: shortlist_${talentId}_${jobId}
  bot.callbackQuery(/^shortlist_(.+)_(.+)$/, async (ctx: MyContext) => {
    if (!ctx.match || !ctx.match[1] || !ctx.match[2]) {
      await ctx.answerCallbackQuery({ text: 'Invalid parameters', show_alert: true });
      return;
    }

    const talentId = ctx.match[1];
    const jobId = ctx.match[2];

    try {
      await ctx.answerCallbackQuery({ text: 'Shortlisting talent...' });
      
      // First check if application exists, if not create it
      // Then shortlist it
      try {
        // Try to get existing applicants
        const applicants = await apiClient.getJobApplicants(jobId);
        const existingApplication = applicants.find((app) => app.talentId === talentId);
        
        if (existingApplication) {
          // Shortlist existing application
          await apiClient.shortlistApplicant(jobId, existingApplication.id);
        } else {
          // Create application first, then shortlist
          const application = await apiClient.createApplication(jobId, talentId);
          await apiClient.shortlistApplicant(jobId, application.id);
        }
        
        await ctx.reply(
          `✅ **Talent Shortlisted!**\n\n` +
          `The talent has been added to your shortlist for this job.`,
          { parse_mode: 'Markdown' }
        );
      } catch (error: any) {
        // If application already exists and is already shortlisted, that's okay
        if (isDuplicateError(error)) {
          await ctx.reply(
            `ℹ️ This talent is already in your shortlist.`
          );
          return;
        }
        throw error;
      }
    } catch (error) {
      await handleCallbackError(
        ctx,
        error,
        'Failed to shortlist talent. Please try again later.'
      );
    }
  });

  // Refresh find_jobs callback
  bot.callbackQuery('refresh_find_jobs', async (ctx: MyContext) => {
    try {
      await ctx.answerCallbackQuery();
      // Trigger the find_jobs command again
      const fakeMessage = {
        ...ctx.message,
        text: '/find_jobs',
        entities: [{ type: 'bot_command', offset: 0, length: 9 }],
      } as any;
      
      await bot.handleUpdate({
        ...ctx.update,
        message: fakeMessage,
        callback_query: undefined,
      } as any);
    } catch (error: any) {
      // If message was deleted, send a new one
      if (error.message && error.message.includes('message to edit not found')) {
        await ctx.reply('Please use /find_jobs command to refresh the results.');
      } else {
        await handleCallbackError(
          ctx,
          error,
          'Failed to refresh. Please use /find_jobs command.'
        );
      }
    }
  });

  // Refresh find_talents callback
  bot.callbackQuery(/^refresh_find_talents_(.+)$/, async (ctx: MyContext) => {
    if (!ctx.match || !ctx.match[1]) {
      await ctx.answerCallbackQuery({ text: 'Invalid job ID', show_alert: true });
      return;
    }

    const jobId = ctx.match[1];

    try {
      await ctx.answerCallbackQuery();
      
      // Get job and matching talents again
      const job = await apiClient.getJob(jobId);
      const matches = await apiClient.getMatchingTalentsForJob(jobId);
      
      if (!matches || matches.length === 0) {
        await ctx.editMessageText(
          `📭 No matching talents found for job "${job.title}".`
        );
        return;
      }

      let message = `👥 **Matching Talents for: ${job.title}**\n\n`;
      
      matches.forEach((match, index) => {
        const talent = match.talent;
        const score = Math.round(match.matchScore || 0);
        
        if (talent.status !== TalentStatus.APPROVED) {
          return;
        }
        
        const categoryText = Array.isArray(talent.serviceCategory)
          ? talent.serviceCategory.map((cat) => ServiceCategoryLabels[cat]).join(', ')
          : ServiceCategoryLabels[talent.serviceCategory];
        
        const experienceText = ExperienceLevelLabels[talent.experienceLevel];
        
        message += `${index + 1}. **${talent.name}**\n`;
        message += `   📊 Match Score: ${score}%\n`;
        message += `   📁 Category: ${categoryText}\n`;
        message += `   💼 Experience: ${experienceText}\n`;
        message += `   🆔 ID: \`${talent.id}\`\n\n`;
      });

      const keyboard = new InlineKeyboard();
      
      matches
        .filter((match) => match.talent.status === TalentStatus.APPROVED)
        .forEach((match, index) => {
          const talent = match.talent;
          keyboard
            .text(`👤 ${index + 1}. ${talent.name}`, `talent_detail_${talent.id}_${jobId}`)
            .row();
        });

      keyboard.text('🔄 Refresh', `refresh_find_talents_${jobId}`).row();

      await ctx.editMessageText(message, {
        reply_markup: keyboard,
        parse_mode: 'Markdown',
      });
    } catch (error: any) {
      // If message was deleted, send a new one
      if (error.message && error.message.includes('message to edit not found')) {
        await ctx.reply('Please use /find_talents command to refresh the results.');
      } else {
        await handleCallbackError(
          ctx,
          error,
          'Failed to refresh. Please use /find_talents command.'
        );
      }
    }
  });
}

