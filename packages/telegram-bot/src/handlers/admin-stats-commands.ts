import { Bot } from 'grammy';
import { MyContext, adminOnly } from '../middleware';
import { apiClient } from '../api/api-client';
import { handleError } from '../utils/error-handler';

/**
 * Register admin statistics commands
 */
export function registerAdminStatsCommands(bot: Bot<MyContext>): void {
  // /stats - Platform statistics
  bot.command('stats', adminOnly(), async (ctx: MyContext) => {
    try {
      await ctx.reply('📊 Fetching platform statistics...');

      // Fetch all statistics in parallel for better performance
      const [statistics, analytics, metrics] = await Promise.all([
        apiClient.getAdminStatistics(),
        apiClient.getAdminAnalytics(),
        apiClient.getAdminMetrics(),
      ]);

      // Calculate date range for recent activity (7 days)
      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);
      const dateRangeText = `${sevenDaysAgo.toLocaleDateString()} - ${today.toLocaleDateString()}`;

      // Format percentages with 2 decimal places
      const formatPercentage = (value: number): string => {
        return `${value.toFixed(2)}%`;
      };

      // Build the statistics message
      let message = '📊 **Platform Statistics**\n\n';

      // Talents section
      message += '👥 **Talents:**\n';
      message += `   📈 Total: ${statistics.talents.total}\n`;
      message += `   ⏳ Pending: ${statistics.talents.pending}\n`;
      message += `   ✅ Approved: ${statistics.talents.approved}\n\n`;

      // Jobs section
      message += '📝 **Jobs:**\n';
      message += `   📈 Total: ${statistics.jobs.total}\n`;
      message += `   ⏳ Pending: ${statistics.jobs.pending}\n`;
      message += `   ✅ Published: ${statistics.jobs.published}\n\n`;

      // Applications section
      message += '📋 **Applications:**\n';
      message += `   📈 Total: ${statistics.applications.total}\n\n`;

      // Analytics section (conversion rates)
      message += '📈 **Analytics:**\n';
      message += `   🎯 Talent Approval Rate: ${formatPercentage(analytics.conversionRates.talentApprovalRate)}\n`;
      message += `   📢 Job Publish Rate: ${formatPercentage(analytics.conversionRates.jobPublishRate)}\n`;
      message += `   💼 Hire Rate: ${formatPercentage(analytics.conversionRates.applicationHireRate)}\n\n`;

      // Recent activity section (7 days)
      message += '🔄 **Recent Activity** (7 days):\n';
      message += `   📅 Period: ${dateRangeText}\n`;
      message += `   👥 New Talents: ${metrics.recentActivity.newTalents}\n`;
      message += `   📝 New Jobs: ${metrics.recentActivity.newJobs}\n`;
      message += `   📋 New Applications: ${metrics.recentActivity.newApplications}\n`;

      await ctx.reply(message, { parse_mode: 'Markdown' });
    } catch (error) {
      await handleError(
        ctx,
        error,
        '❌ Failed to fetch platform statistics.\n\n' +
        'Please try again later or contact support if the issue persists.'
      );
    }
  });
}

