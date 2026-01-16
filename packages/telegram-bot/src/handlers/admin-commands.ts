import { adminOnly, MyContext } from '../middleware';
import { apiClient } from '../api/api-client';
import { JobStatus } from '@blihops/shared';
import { Bot } from 'grammy';

/**
 * Register admin-only commands
 */
export function registerAdminCommands(bot: Bot<MyContext>): void {
  // /create_job - Start job creation conversation
  bot.command('create_job', adminOnly(), async (ctx: MyContext) => {
    await ctx.conversation.enter('jobCreationConversation');
  });

  // /my_jobs - List jobs with status and stats
  bot.command('my_jobs', adminOnly(), async (ctx: MyContext) => {
    try {
      const adminId = ctx.from!.id.toString();
      const jobs = await apiClient.getJobsByAdmin(adminId);

      if (!jobs || jobs.length === 0) {
        await ctx.reply('You haven\'t created any jobs yet.');
        return;
      }

      let message = '📝 Your Jobs:\n\n';
      jobs.forEach((job, index) => {
        const statusEmoji: Record<JobStatus, string> = {
          [JobStatus.DRAFT]: '📄',
          [JobStatus.PENDING]: '⏳',
          [JobStatus.PUBLISHED]: '✅',
          [JobStatus.ARCHIVED]: '📦',
          [JobStatus.CLOSED]: '🔒',
        };

        const emoji = statusEmoji[job.status] || '📄';

        // Get applicant count (if available in job object)
        // Note: The API might need to include applicantCount in the Job response
        // For now, we'll show what's available
        const applicantCount = (job as any).applicantCount || 0;
        const hiredCount = (job as any).hiredCount || 0;

        message += `${index + 1}. ${emoji} ${job.title}\n`;
        message += `   Status: ${job.status}\n`;
        message += `   ID: ${job.id}\n`;
        message += `   Applicants: ${applicantCount}\n`;
        message += `   Hired: ${hiredCount}\n`;
        message += `   Created: ${new Date(job.createdAt).toLocaleDateString()}\n\n`;
      });

      await ctx.reply(message);
    } catch (error) {
      await ctx.reply('❌ Failed to fetch jobs.');
      console.error('Error fetching jobs:', error);
    }
  });

  // /job_status - View job status and details
  bot.command('job_status', adminOnly(), async (ctx: MyContext) => {
    ctx.session.state = 'awaiting_job_status_id';
    await ctx.reply('Send the job ID to view status:');
  });

  // /publish_job - Publish a pending job
  bot.command('publish_job', adminOnly(), async (ctx: MyContext) => {
    ctx.session.state = 'awaiting_publish_job_id';
    await ctx.reply('Send the job ID to publish:');
  });

  // /reject_job - Reject a pending job
  bot.command('reject_job', adminOnly(), async (ctx: MyContext) => {
    ctx.session.state = 'awaiting_reject_job_id';
    await ctx.reply('Send the job ID to reject:');
  });

  // /close_job - Close a published job
  bot.command('close_job', adminOnly(), async (ctx: MyContext) => {
    ctx.session.state = 'awaiting_close_job_id';
    await ctx.reply('Send the job ID to close:');
  });

  // Consolidated message handler for all admin command inputs
  bot.on('message:text', adminOnly(), async (ctx: MyContext) => {
    const state = ctx.session.state;
    if (!state) return; // Not waiting for input

    if (!ctx.message?.text) return; // No text message
    const text = ctx.message.text.trim();

    // Handle job status input
    if (state === 'awaiting_job_status_id') {
      ctx.session.state = undefined;
      const jobId = text;

      if (!jobId) {
        await ctx.reply('❌ Invalid job ID.');
        return;
      }

      try {
        const job = await apiClient.getJob(jobId);
        
        // Verify the job belongs to this admin
        if (job.createdBy !== ctx.from!.id.toString()) {
          await ctx.reply('❌ You can only view jobs you created.');
          return;
        }

        const statusEmoji: Record<JobStatus, string> = {
          [JobStatus.DRAFT]: '📄',
          [JobStatus.PENDING]: '⏳',
          [JobStatus.PUBLISHED]: '✅',
          [JobStatus.ARCHIVED]: '📦',
          [JobStatus.CLOSED]: '🔒',
        };

        const emoji = statusEmoji[job.status] || '📄';

        let message = `${emoji} Job Status\n\n`;
        message += `Title: ${job.title}\n`;
        message += `ID: ${job.id}\n`;
        message += `Status: ${job.status}\n`;
        message += `Category: ${job.serviceCategory}\n`;
        message += `Engagement: ${job.engagementType}\n`;
        message += `Skills: ${job.requiredSkills.join(', ')}\n`;
        if (job.duration) {
          message += `Duration: ${job.duration}\n`;
        }
        message += `Created: ${new Date(job.createdAt).toLocaleDateString()}\n`;
        message += `Updated: ${new Date(job.updatedAt).toLocaleDateString()}\n`;

        await ctx.reply(message);
      } catch (error) {
        await ctx.reply('❌ Failed to fetch job. Please check the job ID.');
        console.error('Error fetching job:', error);
      }
      return;
    }

    // Handle publish job input
    if (state === 'awaiting_publish_job_id') {
      ctx.session.state = undefined;
      const jobId = text;

      if (!jobId) {
        await ctx.reply('❌ Invalid job ID.');
        return;
      }

      try {
        // First verify the job belongs to this admin
        const job = await apiClient.getJob(jobId);
        
        if (job.createdBy !== ctx.from!.id.toString()) {
          await ctx.reply('❌ You can only publish jobs you created.');
          return;
        }

        const updatedJob = await apiClient.publishJob(jobId);
        await ctx.reply(`✅ Job "${updatedJob.title}" has been published!`);
      } catch (error) {
        await ctx.reply('❌ Failed to publish job. Please check the job ID and status.');
        console.error('Error publishing job:', error);
      }
      return;
    }

    // Handle reject job input (two-step: job ID, then reason)
    if (state === 'awaiting_reject_job_id') {
      ctx.session.state = 'awaiting_reject_reason';
      ctx.session.data = { jobId: text };

      if (!text) {
        ctx.session.state = undefined;
        ctx.session.data = undefined;
        await ctx.reply('❌ Invalid job ID.');
        return;
      }

      await ctx.reply('Optional: Send a reason for rejection (or /skip):');
      return;
    }

    if (state === 'awaiting_reject_reason') {
      const jobId = ctx.session.data?.jobId;
      ctx.session.state = undefined;
      ctx.session.data = undefined;

      if (!jobId) {
        await ctx.reply('❌ Job ID not found. Please start over.');
        return;
      }

      const reason =
        text === '/skip' || text.toLowerCase() === 'skip' ? undefined : text;

      try {
        // First verify the job belongs to this admin
        const job = await apiClient.getJob(jobId);
        
        if (job.createdBy !== ctx.from!.id.toString()) {
          await ctx.reply('❌ You can only reject jobs you created.');
          return;
        }

        const updatedJob = await apiClient.rejectJob(jobId, reason);
        await ctx.reply(
          `✅ Job "${updatedJob.title}" has been rejected.${reason ? `\nReason: ${reason}` : ''}`
        );
      } catch (error) {
        await ctx.reply('❌ Failed to reject job. Please check the job ID and status.');
        console.error('Error rejecting job:', error);
      }
      return;
    }

    // Handle close job input
    if (state === 'awaiting_close_job_id') {
      ctx.session.state = undefined;
      const jobId = text;

      if (!jobId) {
        await ctx.reply('❌ Invalid job ID.');
        return;
      }

      try {
        // First verify the job belongs to this admin
        const job = await apiClient.getJob(jobId);
        
        if (job.createdBy !== ctx.from!.id.toString()) {
          await ctx.reply('❌ You can only close jobs you created.');
          return;
        }

        const updatedJob = await apiClient.closeJob(jobId);
        await ctx.reply(`✅ Job "${updatedJob.title}" has been closed.`);
      } catch (error) {
        await ctx.reply('❌ Failed to close job. Please check the job ID and status.');
        console.error('Error closing job:', error);
      }
      return;
    }
  });
}

