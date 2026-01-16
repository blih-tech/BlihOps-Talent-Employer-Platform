import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { TelegramService } from '../../modules/telegram/telegram.service';
import { QUEUE_NAMES } from '../queue.config';

interface PublishJobJobData {
  jobId: string;
}

@Processor(QUEUE_NAMES.PUBLISH_JOB)
export class PublishJobProcessor {
  private readonly logger = new Logger(PublishJobProcessor.name);
  private readonly jobChannelId: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private telegramService: TelegramService,
  ) {
    // Get jobs channel ID from environment
    // Default: -1002985721031 (BlihOps Jobs Channel)
    this.jobChannelId = this.configService.get<string>(
      'TELEGRAM_CHANNEL_ID_JOBS',
      '-1002985721031',
    );
  }

  @Process()
  async handlePublishJob(job: Job<PublishJobJobData>) {
    const { jobId } = job.data;

    try {
      this.logger.log(`Publishing job ${jobId} to Telegram channel`);

      // Get job details
      const jobData = await this.prisma.job.findUnique({
        where: { id: jobId },
        include: { createdBy: true },
      });

      if (!jobData) {
        throw new Error(`Job ${jobId} not found`);
      }

      // Format message for Telegram
      const message = this.formatJobMessage(jobData);

      // Send to Telegram Jobs Channel
      // Channel ID: -1002985721031 (BlihOps Jobs Channel)
      const messageId = await this.telegramService.sendMessageToJobsChannel(message);
      
      if (!messageId) {
        throw new Error(`Failed to publish job ${jobId} to Telegram channel`);
      }

      this.logger.log(
        `Successfully published job ${jobId} to Jobs Channel (${this.jobChannelId}). Message ID: ${messageId}`,
      );

      await job.progress(100);

      this.logger.log(`Successfully published job ${jobId}`);
      return { success: true, jobId };

    } catch (error: unknown) {
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to publish job ${jobId}`, errorStack);
      throw error;
    }
  }

  private formatJobMessage(job: any): string {
    return `
📢 New Job Opportunity

Title: ${job.title}
Category: ${job.serviceCategory}
Experience: ${job.experienceLevel}
Type: ${job.engagementType}
${job.duration ? `Duration: ${job.duration}` : ''}

Required Skills:
${job.requiredSkills.map((skill: string) => `• ${skill}`).join('\n')}

Description:
${job.description}

Apply via bot: /apply_${job.id}
    `.trim();
  }
}


