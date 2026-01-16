import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QUEUE_NAMES } from '../queue.config';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

interface NotifyTalentJobData {
  talentId: string;
  jobId: string;
  matchScore: number;
}

@Processor(QUEUE_NAMES.NOTIFY_TALENT)
export class NotifyTalentProcessor {
  private readonly logger = new Logger(NotifyTalentProcessor.name);
  private readonly RATE_LIMIT_MAX = 10; // 10 messages per hour per talent
  private readonly RATE_LIMIT_WINDOW = 3600; // 1 hour in seconds

  constructor(
    private prisma: PrismaService,
    @InjectRedis() private redis: Redis,
  ) {}

  @Process()
  async handleNotifyTalent(job: Job<NotifyTalentJobData>) {
    const { talentId, jobId, matchScore } = job.data;

    try {
      this.logger.log(`Notifying talent ${talentId} about job ${jobId} (match score: ${matchScore})`);

      // Check rate limit before processing
      const rateLimitKey = `rate_limit:notify_talent:${talentId}`;
      const currentCount = await this.redis.incr(rateLimitKey);

      // Set expiration on first increment
      if (currentCount === 1) {
        await this.redis.expire(rateLimitKey, this.RATE_LIMIT_WINDOW);
      }

      // Check if rate limit exceeded
      if (currentCount > this.RATE_LIMIT_MAX) {
        this.logger.warn(
          `Rate limit exceeded for talent ${talentId}. Current count: ${currentCount}/${this.RATE_LIMIT_MAX}. Skipping notification.`,
        );
        // Decrement since we're not processing
        await this.redis.decr(rateLimitKey);
        // Mark job as completed with rate limit warning
        await job.progress(100);
        return {
          success: false,
          talentId,
          jobId,
          reason: 'rate_limit_exceeded',
          skipped: true,
        };
      }

      // Get talent and job details
      const [talent, jobData] = await Promise.all([
        this.prisma.talent.findUnique({ where: { id: talentId } }),
        this.prisma.job.findUnique({ where: { id: jobId } }),
      ]);

      if (!talent || !jobData) {
        // Decrement counter since we're not processing
        await this.redis.decr(rateLimitKey);
        throw new Error(`Talent ${talentId} or Job ${jobId} not found`);
      }

      // Format notification message
      const message = this.formatNotificationMessage(talent, jobData, matchScore);

      // TODO: Send DM to talent via Telegram bot
      // This will be implemented when bot is ready
      this.logger.log(`Would send to Telegram user ${talent.telegramId}: ${message}`);

      await job.progress(100);

      this.logger.log(`Successfully notified talent ${talentId} about job ${jobId}`);
      return { success: true, talentId, jobId, matchScore };

    } catch (error: unknown) {
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to notify talent ${talentId} about job ${jobId}`, errorStack);
      throw error; // Will trigger retry based on queue configuration
    }
  }

  private formatNotificationMessage(talent: any, job: any, matchScore: number): string {
    // Use talent to avoid unused parameter warning
    const talentName = talent?.name || 'Talent';
    return `
🎯 New Job Match Found!

A new job opportunity matches your profile (${talentName}):

• Title: ${job.title}
• Category: ${job.serviceCategory}
• Match Score: ${matchScore.toFixed(1)}%
• Type: ${job.engagementType}
${job.duration ? `• Duration: ${job.duration}` : ''}

View details: /job_${job.id}
    `.trim();
  }
}


