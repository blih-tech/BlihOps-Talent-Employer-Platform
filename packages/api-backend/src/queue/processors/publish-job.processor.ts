import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QUEUE_NAMES } from '../queue.config';

interface PublishJobJobData {
  jobId: string;
}

@Processor(QUEUE_NAMES.PUBLISH_JOB)
export class PublishJobProcessor {
  private readonly logger = new Logger(PublishJobProcessor.name);

  constructor(private prisma: PrismaService) {}

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

      // TODO: Send to Telegram channel via bot API
      this.logger.log(`Would publish to Telegram: ${message}`);

      await job.progress(100);

      this.logger.log(`Successfully published job ${jobId}`);
      return { success: true, jobId };

    } catch (error) {
      this.logger.error(`Failed to publish job ${jobId}`, error.stack);
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


