import { Bot, InlineKeyboard } from 'grammy';
import { MyContext, adminOnly } from '../middleware';
import { apiClient } from '../api/api-client';
import { Application } from '../api/types';
// JobStatus, ServiceCategoryLabels, EngagementTypeLabels not used in this file
import { handleError, handleCallbackError, isNotFoundError } from '../utils/error-handler';
import { isValidJobId, extractId } from '../utils/validators';
import { clearSessionState } from '../utils/session-cleanup';

/**
 * Application status labels
 */
const ApplicationStatusLabels: Record<string, string> = {
  NEW: '🆕 New',
  SHORTLISTED: '⭐ Shortlisted',
  HIRED: '✅ Hired',
  REJECTED: '❌ Rejected',
};

/**
 * Register application management commands
 * Includes admin applicant management and talent application status
 */
export function registerApplicationCommands(bot: Bot<MyContext>): void {
  // ==========================================
  // Admin Application Management (/view_applicants)
  // ==========================================

  bot.command('view_applicants', adminOnly(), async (ctx: MyContext) => {
    try {
      ctx.session.state = 'awaiting_view_applicants_job_id';
      await ctx.reply(
        '📋 **View Applicants**\n\n' +
        'Please send the Job ID to view applicants:'
      );
    } catch (error) {
      clearSessionState(ctx);
      await handleError(ctx, error, '❌ An error occurred. Please try again.');
    }
  });

  // Handle job ID input for view_applicants
  bot.on('message:text', adminOnly(), async (ctx: MyContext) => {
    const state = ctx.session.state;
    if (state !== 'awaiting_view_applicants_job_id') return;
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
      // Verify job exists and belongs to admin
      const job = await apiClient.getJob(jobId);
      
      if (job.createdBy !== ctx.from!.id.toString()) {
        await ctx.reply('❌ You can only view applicants for jobs you created.');
        return;
      }

      await ctx.reply('📋 Loading applicants...');
      
      // Get applicants
      const applicants = await apiClient.getJobApplicants(jobId);
      
      if (!applicants || applicants.length === 0) {
        await ctx.reply(
          `📭 No applicants found for job "${job.title}".`
        );
        return;
      }

      // Group applicants by status
      const groupedByStatus: Record<string, Application[]> = {
        NEW: [],
        SHORTLISTED: [],
        HIRED: [],
        REJECTED: [],
      };

      applicants.forEach((app) => {
        const statusArray = groupedByStatus[app.status];
        if (statusArray) {
          statusArray.push(app);
        }
      });

      // Sort each group by match score (descending)
      Object.keys(groupedByStatus).forEach((status) => {
        const statusArray = groupedByStatus[status];
        if (statusArray) {
          statusArray.sort((a, b) => {
            const scoreA = a.matchScore || 0;
            const scoreB = b.matchScore || 0;
            return scoreB - scoreA;
          });
        }
      });

      // Display applicants
      let message = `📋 **Applicants for: ${job.title}**\n\n`;
      
      // Show summary
      const total = applicants.length;
      const newCount = groupedByStatus.NEW?.length || 0;
      const shortlistedCount = groupedByStatus.SHORTLISTED?.length || 0;
      const hiredCount = groupedByStatus.HIRED?.length || 0;
      const rejectedCount = groupedByStatus.REJECTED?.length || 0;

      message += `📊 **Summary:**\n`;
      message += `Total: ${total}\n`;
      message += `🆕 New: ${newCount}\n`;
      message += `⭐ Shortlisted: ${shortlistedCount}\n`;
      message += `✅ Hired: ${hiredCount}\n`;
      message += `❌ Rejected: ${rejectedCount}\n\n`;

      // Show top applicants by status
      const statusesToShow = ['NEW', 'SHORTLISTED', 'HIRED'];
      
      statusesToShow.forEach((status) => {
        const apps = groupedByStatus[status];
        if (apps && apps.length > 0) {
          message += `**${ApplicationStatusLabels[status]}** (${apps.length}):\n`;
          
          // Show top 5 for each status
          apps.slice(0, 5).forEach((app, index) => {
            const score = Math.round(app.matchScore || 0);
            const appliedDate = new Date(app.appliedAt).toLocaleDateString();
            message += `${index + 1}. Match: ${score}% | Applied: ${appliedDate}\n`;
            message += `   ID: \`${app.id}\`\n`;
          });
          
          if (apps.length > 5) {
            message += `   ... and ${apps.length - 5} more\n`;
          }
          message += '\n';
        }
      });

      // Create inline keyboard with filter buttons
      const keyboard = new InlineKeyboard();
      keyboard
        .text('🆕 New', `filter_applicants_${jobId}_NEW`)
        .text('⭐ Shortlisted', `filter_applicants_${jobId}_SHORTLISTED`)
        .row()
        .text('✅ Hired', `filter_applicants_${jobId}_HIRED`)
        .text('❌ Rejected', `filter_applicants_${jobId}_REJECTED`)
        .row()
        .text('🔄 Refresh', `refresh_applicants_${jobId}`);

      await ctx.reply(message, {
        reply_markup: keyboard,
        parse_mode: 'Markdown',
      });
    } catch (error) {
      if (isNotFoundError(error)) {
        await ctx.reply(
          '❌ Job not found. Please check the job ID and try again.\n\n' +
          'Use /my_jobs to see your jobs.'
        );
      } else {
        await handleError(
          ctx,
          error,
          '❌ Failed to fetch applicants. Please check the job ID and try again.'
        );
      }
    }
  });

  // ==========================================
  // Talent Application Status (/my_applications)
  // ==========================================

  bot.command('my_applications', async (ctx: MyContext) => {
    try {
      const telegramId = ctx.from!.id.toString();
      
      // Verify talent exists
      const talent = await apiClient.getTalentByTelegramId(telegramId);
      
      if (!talent) {
        await ctx.reply(
          "❌ You don't have a talent profile yet.\n\n" +
          "Please create your profile first using /start or /create_account."
        );
        return;
      }

      await ctx.reply('📋 Loading your applications...');
      
      // Get applications
      const applications = await apiClient.getApplicationsByTalent(talent.id);
      
      if (!applications || applications.length === 0) {
        await ctx.reply(
          '📭 You haven\'t applied to any jobs yet.\n\n' +
          'Use /find_jobs to discover matching opportunities!'
        );
        return;
      }

      // Group by status
      const groupedByStatus: Record<string, Application[]> = {
        NEW: [],
        SHORTLISTED: [],
        HIRED: [],
        REJECTED: [],
      };

      applications.forEach((app) => {
        const statusArray = groupedByStatus[app.status];
        if (statusArray) {
          statusArray.push(app);
        }
      });

      // Sort by applied date (newest first)
      Object.keys(groupedByStatus).forEach((status) => {
        const statusArray = groupedByStatus[status];
        if (statusArray) {
          statusArray.sort((a, b) => {
            return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
          });
        }
      });

      // Display applications
      let message = '📋 **Your Applications**\n\n';
      
      // Show summary
      const total = applications.length;
      const newCount = groupedByStatus.NEW?.length || 0;
      const shortlistedCount = groupedByStatus.SHORTLISTED?.length || 0;
      const hiredCount = groupedByStatus.HIRED?.length || 0;
      const rejectedCount = groupedByStatus.REJECTED?.length || 0;

      message += `📊 **Summary:**\n`;
      message += `Total: ${total}\n`;
      message += `🆕 New: ${newCount}\n`;
      message += `⭐ Shortlisted: ${shortlistedCount}\n`;
      message += `✅ Hired: ${hiredCount}\n`;
      message += `❌ Rejected: ${rejectedCount}\n\n`;

      // Show applications by status
      const statusesToShow = ['NEW', 'SHORTLISTED', 'HIRED', 'REJECTED'];
      
      for (const status of statusesToShow) {
        const apps = groupedByStatus[status];
        if (apps && apps.length > 0) {
          message += `**${ApplicationStatusLabels[status]}** (${apps.length}):\n`;
          
          for (const app of apps) {
            try {
              // Get job details
              const job = await apiClient.getJob(app.jobId);
              const score = Math.round(app.matchScore || 0);
              const appliedDate = new Date(app.appliedAt).toLocaleDateString();
              
              message += `• **${job.title}**\n`;
              message += `  Match: ${score}% | Applied: ${appliedDate}\n`;
              
              if (app.status === 'REJECTED' && app.rejectionReason) {
                message += `  Reason: ${app.rejectionReason}\n`;
              }
              
              if (app.status === 'HIRED' && app.hiredAt) {
                const hiredDate = new Date(app.hiredAt).toLocaleDateString();
                message += `  Hired: ${hiredDate}\n`;
              }
              
              message += `  Job ID: \`${job.id}\`\n\n`;
            } catch (error) {
              // If job not found, show application ID only
              const appliedDate = new Date(app.appliedAt).toLocaleDateString();
              message += `• Application ID: \`${app.id}\`\n`;
              message += `  Applied: ${appliedDate}\n`;
              message += `  Job ID: \`${app.jobId}\` (Job may have been deleted)\n\n`;
            }
          }
        }
      }

      await ctx.reply(message, { parse_mode: 'Markdown' });
    } catch (error) {
      await handleError(
        ctx,
        error,
        '❌ Failed to fetch your applications. Please try again later.'
      );
    }
  });

  // ==========================================
  // Callback Query Handlers
  // ==========================================

  // Filter applicants by status: filter_applicants_${jobId}_${status}
  bot.callbackQuery(/^filter_applicants_(.+)_(.+)$/, async (ctx: MyContext) => {
    if (!ctx.match || !ctx.match[1] || !ctx.match[2]) {
      await ctx.answerCallbackQuery({ text: 'Invalid parameters', show_alert: true });
      return;
    }

    const jobId = ctx.match[1];
    const status = ctx.match[2];

    try {
      await ctx.answerCallbackQuery();
      
      // Verify job exists and belongs to admin
      const job = await apiClient.getJob(jobId);
      
      if (job.createdBy !== ctx.from!.id.toString()) {
        await ctx.reply('❌ You can only view applicants for jobs you created.');
        return;
      }

      // Get applicants
      const applicants = await apiClient.getJobApplicants(jobId);
      
      // Filter by status
      const filtered = applicants.filter((app) => app.status === status);
      
      if (filtered.length === 0) {
        await ctx.editMessageText(
          `📭 No ${ApplicationStatusLabels[status]} applicants for this job.`,
          { parse_mode: 'Markdown' }
        );
        return;
      }

      // Sort by match score
      filtered.sort((a, b) => {
        const scoreA = a.matchScore || 0;
        const scoreB = b.matchScore || 0;
        return scoreB - scoreA;
      });

      let message = `📋 **${ApplicationStatusLabels[status]} Applicants**\n\n`;
      message += `Job: ${job.title}\n\n`;

      filtered.forEach((app, index) => {
        const score = Math.round(app.matchScore || 0);
        const appliedDate = new Date(app.appliedAt).toLocaleDateString();
        
        message += `${index + 1}. Match: ${score}%\n`;
        message += `   Applied: ${appliedDate}\n`;
        message += `   ID: \`${app.id}\`\n`;
        
        if (app.notes) {
          message += `   Notes: ${app.notes}\n`;
        }
        
        if (app.status === 'REJECTED' && app.rejectionReason) {
          message += `   Reason: ${app.rejectionReason}\n`;
        }
        
        message += '\n';
      });

      // Create inline keyboard with action buttons
      const keyboard = new InlineKeyboard();
      
      filtered.slice(0, 10).forEach((app) => {
        keyboard
          .text(`👤 ${app.id.substring(0, 8)}...`, `applicant_detail_${app.id}_${jobId}`)
          .row();
      });

      keyboard
        .text('🔙 Back to All', `refresh_applicants_${jobId}`)
        .row()
        .text('🔄 Refresh', `refresh_applicants_${jobId}`);

      await ctx.editMessageText(message, {
        reply_markup: keyboard,
        parse_mode: 'Markdown',
      });
    } catch (error) {
      await handleCallbackError(
        ctx,
        error,
        'Failed to filter applicants. Please try again.'
      );
    }
  });

  // Applicant detail: applicant_detail_${applicationId}_${jobId}
  bot.callbackQuery(/^applicant_detail_(.+)_(.+)$/, async (ctx: MyContext) => {
    if (!ctx.match || !ctx.match[1] || !ctx.match[2]) {
      await ctx.answerCallbackQuery({ text: 'Invalid parameters', show_alert: true });
      return;
    }

    const applicationId = ctx.match[1];
    const jobId = ctx.match[2];

    try {
      await ctx.answerCallbackQuery();
      
      // Get applicant details
      const applicant = await apiClient.getApplicant(jobId, applicationId);
      const job = await apiClient.getJob(jobId);
      
      // Get talent details if available
      let talentInfo = '';
      if (applicant.talent) {
        const talent = applicant.talent;
        talentInfo = `\n**Talent:**\n`;
        talentInfo += `Name: ${talent.name}\n`;
        talentInfo += `Skills: ${talent.skills.join(', ')}\n`;
        talentInfo += `Experience: ${talent.experienceLevel}\n`;
        if (talent.cvUrl) {
          talentInfo += `CV: Available\n`;
        }
      }

      const score = Math.round(applicant.matchScore || 0);
      const appliedDate = new Date(applicant.appliedAt).toLocaleDateString();
      
      let message = `📋 **Applicant Details**\n\n`;
      message += `**Job:** ${job.title}\n`;
      message += `**Status:** ${ApplicationStatusLabels[applicant.status]}\n`;
      message += `**Match Score:** ${score}%\n`;
      message += `**Applied:** ${appliedDate}\n`;
      
      if (applicant.shortlistedAt) {
        const shortlistedDate = new Date(applicant.shortlistedAt).toLocaleDateString();
        message += `**Shortlisted:** ${shortlistedDate}\n`;
      }
      
      if (applicant.hiredAt) {
        const hiredDate = new Date(applicant.hiredAt).toLocaleDateString();
        message += `**Hired:** ${hiredDate}\n`;
      }
      
      if (applicant.rejectedAt) {
        const rejectedDate = new Date(applicant.rejectedAt).toLocaleDateString();
        message += `**Rejected:** ${rejectedDate}\n`;
      }
      
      if (applicant.notes) {
        message += `\n**Notes:**\n${applicant.notes}\n`;
      }
      
      if (applicant.rejectionReason) {
        message += `\n**Rejection Reason:**\n${applicant.rejectionReason}\n`;
      }
      
      message += talentInfo;
      message += `\n**Application ID:** \`${applicant.id}\`\n`;

      // Create inline keyboard with action buttons based on status
      const keyboard = new InlineKeyboard();
      
      if (applicant.status === 'NEW') {
        keyboard
          .text('⭐ Shortlist', `action_shortlist_${applicationId}_${jobId}`)
          .text('❌ Reject', `action_reject_${applicationId}_${jobId}`)
          .row();
      } else if (applicant.status === 'SHORTLISTED') {
        keyboard
          .text('✅ Hire', `action_hire_${applicationId}_${jobId}`)
          .text('❌ Reject', `action_reject_${applicationId}_${jobId}`)
          .row();
      }
      
      keyboard.text('🔙 Back', `refresh_applicants_${jobId}`);

      await ctx.editMessageText(message, {
        reply_markup: keyboard,
        parse_mode: 'Markdown',
      });
    } catch (error) {
      await handleCallbackError(
        ctx,
        error,
        isNotFoundError(error)
          ? 'Applicant not found. It may have been deleted.'
          : 'Failed to load applicant details. Please try again.'
      );
    }
  });

  // Shortlist applicant: action_shortlist_${applicationId}_${jobId}
  bot.callbackQuery(/^action_shortlist_(.+)_(.+)$/, async (ctx: MyContext) => {
    if (!ctx.match || !ctx.match[1] || !ctx.match[2]) {
      await ctx.answerCallbackQuery({ text: 'Invalid parameters', show_alert: true });
      return;
    }

    const applicationId = ctx.match[1];
    const jobId = ctx.match[2];

    try {
      await ctx.answerCallbackQuery({ text: 'Shortlisting applicant...' });
      
      await apiClient.shortlistApplicant(jobId, applicationId);
      
      await ctx.reply(
        '✅ **Applicant Shortlisted!**\n\n' +
        'The applicant has been added to your shortlist.',
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      await handleCallbackError(
        ctx,
        error,
        'Failed to shortlist applicant. Please try again.'
      );
    }
  });

  // Hire applicant: action_hire_${applicationId}_${jobId}
  bot.callbackQuery(/^action_hire_(.+)_(.+)$/, async (ctx: MyContext) => {
    if (!ctx.match || !ctx.match[1] || !ctx.match[2]) {
      await ctx.answerCallbackQuery({ text: 'Invalid parameters', show_alert: true });
      return;
    }

    const applicationId = ctx.match[1];
    const jobId = ctx.match[2];

    try {
      await ctx.answerCallbackQuery();
      
      // Set session state to wait for hire notes (optional)
      ctx.session.state = 'awaiting_hire_notes';
      ctx.session.data = { applicationId, jobId };
      
      await ctx.reply(
        '✅ **Hire Applicant**\n\n' +
        'Optional: Add notes about this hire (or send /skip to hire without notes):'
      );
    } catch (error) {
      await handleCallbackError(
        ctx,
        error,
        'Failed to initiate hire process. Please try again.'
      );
    }
  });

  // Handle hire notes input
  bot.on('message:text', adminOnly(), async (ctx: MyContext) => {
    const state = ctx.session.state;
    if (state !== 'awaiting_hire_notes') return;
    if (!ctx.message?.text) return;

    const data = ctx.session.data;
    if (!data || !data.applicationId || !data.jobId) {
      clearSessionState(ctx);
      await ctx.reply('❌ Session expired. Please try again.');
      return;
    }

    const applicationId = data.applicationId;
    const jobId = data.jobId;
    const text = ctx.message.text.trim();
    
    clearSessionState(ctx);

    try {
      const notes = text === '/skip' || text.toLowerCase() === 'skip' ? undefined : text;
      
      await apiClient.hireApplicant(jobId, applicationId, undefined, notes);
      
      await ctx.reply(
        '✅ **Applicant Hired!**\n\n' +
        (notes ? `**Notes:** ${notes}` : 'The applicant has been marked as hired.'),
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      await handleError(
        ctx,
        error,
        'Failed to hire applicant. Please try again.'
      );
    }
  });

  // Reject applicant: action_reject_${applicationId}_${jobId}
  bot.callbackQuery(/^action_reject_(.+)_(.+)$/, async (ctx: MyContext) => {
    if (!ctx.match || !ctx.match[1] || !ctx.match[2]) {
      await ctx.answerCallbackQuery({ text: 'Invalid parameters', show_alert: true });
      return;
    }

    const applicationId = ctx.match[1];
    const jobId = ctx.match[2];

    try {
      await ctx.answerCallbackQuery();
      
      // Set session state to wait for rejection reason
      ctx.session.state = 'awaiting_reject_reason';
      ctx.session.data = { applicationId, jobId };
      
      await ctx.reply(
        '❌ **Reject Applicant**\n\n' +
        'Optional: Send a reason for rejection or send /skip:'
      );
    } catch (error) {
      await handleCallbackError(
        ctx,
        error,
        'Failed to initiate reject process. Please try again.'
      );
    }
  });

  // Handle rejection reason input
  bot.on('message:text', adminOnly(), async (ctx: MyContext) => {
    const state = ctx.session.state;
    if (state !== 'awaiting_reject_reason') return;
    if (!ctx.message?.text) return;

    const data = ctx.session.data;
    if (!data || !data.applicationId || !data.jobId) {
      clearSessionState(ctx);
      await ctx.reply('❌ Session expired. Please try again.');
      return;
    }

    const applicationId = data.applicationId;
    const jobId = data.jobId;
    const text = ctx.message.text.trim();
    
    clearSessionState(ctx);

    try {
      const reason = text === '/skip' || text.toLowerCase() === 'skip' ? undefined : text;
      
      await apiClient.rejectApplicant(jobId, applicationId, reason);
      
      await ctx.reply(
        '✅ **Applicant Rejected**\n\n' +
        (reason ? `Reason: ${reason}` : 'The applicant has been rejected.'),
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      await handleError(
        ctx,
        error,
        'Failed to reject applicant. Please try again.'
      );
    }
  });

  // Refresh applicants: refresh_applicants_${jobId}
  bot.callbackQuery(/^refresh_applicants_(.+)$/, async (ctx: MyContext) => {
    if (!ctx.match || !ctx.match[1]) {
      await ctx.answerCallbackQuery({ text: 'Invalid job ID', show_alert: true });
      return;
    }

    const jobId = ctx.match[1];

    try {
      await ctx.answerCallbackQuery();
      
      // Verify job exists and belongs to admin
      const job = await apiClient.getJob(jobId);
      
      if (job.createdBy !== ctx.from!.id.toString()) {
        await ctx.reply('❌ You can only view applicants for jobs you created.');
        return;
      }

      // Get applicants again
      const applicants = await apiClient.getJobApplicants(jobId);
      
      if (!applicants || applicants.length === 0) {
        await ctx.editMessageText(
          `📭 No applicants found for job "${job.title}".`
        );
        return;
      }

      // Group and display (same logic as initial view)
      const groupedByStatus: Record<string, Application[]> = {
        NEW: [],
        SHORTLISTED: [],
        HIRED: [],
        REJECTED: [],
      };

      applicants.forEach((app) => {
        const statusArray = groupedByStatus[app.status];
        if (statusArray) {
          statusArray.push(app);
        }
      });

      Object.keys(groupedByStatus).forEach((status) => {
        const statusArray = groupedByStatus[status];
        if (statusArray) {
          statusArray.sort((a, b) => {
            const scoreA = a.matchScore || 0;
            const scoreB = b.matchScore || 0;
            return scoreB - scoreA;
          });
        }
      });

      let message = `📋 **Applicants for: ${job.title}**\n\n`;
      
      const total = applicants.length;
      const newCount = groupedByStatus.NEW?.length || 0;
      const shortlistedCount = groupedByStatus.SHORTLISTED?.length || 0;
      const hiredCount = groupedByStatus.HIRED?.length || 0;
      const rejectedCount = groupedByStatus.REJECTED?.length || 0;

      message += `📊 **Summary:**\n`;
      message += `Total: ${total}\n`;
      message += `🆕 New: ${newCount}\n`;
      message += `⭐ Shortlisted: ${shortlistedCount}\n`;
      message += `✅ Hired: ${hiredCount}\n`;
      message += `❌ Rejected: ${rejectedCount}\n\n`;

      const statusesToShow = ['NEW', 'SHORTLISTED', 'HIRED'];
      
      statusesToShow.forEach((status) => {
        const apps = groupedByStatus[status];
        if (apps && apps.length > 0) {
          message += `**${ApplicationStatusLabels[status]}** (${apps.length}):\n`;
          
          apps.slice(0, 5).forEach((app, index) => {
            const score = Math.round(app.matchScore || 0);
            const appliedDate = new Date(app.appliedAt).toLocaleDateString();
            message += `${index + 1}. Match: ${score}% | Applied: ${appliedDate}\n`;
            message += `   ID: \`${app.id}\`\n`;
          });
          
          if (apps.length > 5) {
            message += `   ... and ${apps.length - 5} more\n`;
          }
          message += '\n';
        }
      });

      const keyboard = new InlineKeyboard();
      keyboard
        .text('🆕 New', `filter_applicants_${jobId}_NEW`)
        .text('⭐ Shortlisted', `filter_applicants_${jobId}_SHORTLISTED`)
        .row()
        .text('✅ Hired', `filter_applicants_${jobId}_HIRED`)
        .text('❌ Rejected', `filter_applicants_${jobId}_REJECTED`)
        .row()
        .text('🔄 Refresh', `refresh_applicants_${jobId}`);

      await ctx.editMessageText(message, {
        reply_markup: keyboard,
        parse_mode: 'Markdown',
      });
    } catch (error: any) {
      if (error.message && error.message.includes('message to edit not found')) {
        await ctx.reply('Please use /view_applicants command to refresh the results.');
      } else {
        await handleCallbackError(
          ctx,
          error,
          'Failed to refresh. Please use /view_applicants command.'
        );
      }
    }
  });
}
