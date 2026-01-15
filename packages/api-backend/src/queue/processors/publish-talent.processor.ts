import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QUEUE_NAMES } from '../queue.config';

interface PublishTalentJobData {
  talentId: string;
}

@Processor(QUEUE_NAMES.PUBLISH_TALENT)
export class PublishTalentProcessor {
  private readonly logger = new Logger(PublishTalentProcessor.name);

  constructor(private prisma: PrismaService) {}

  @Process()
  async handlePublishTalent(job: Job<PublishTalentJobData>) {
    const { talentId } = job.data;

    try {
      this.logger.log(`Publishing talent ${talentId} to Telegram channel`);

      // Get talent details
      const talent = await this.prisma.talent.findUnique({
        where: { id: talentId },
      });

      if (!talent) {
        throw new Error(`Talent ${talentId} not found`);
      }

      // Format message for Telegram
      const message = this.formatTalentMessage(talent);

      // TODO: Send to Telegram channel via bot API
      // This will be implemented when bot is ready
      // For now, just log the message
      this.logger.log(`Would publish to Telegram: ${message}`);

      // Update job progress
      await job.progress(100);

      this.logger.log(`Successfully published talent ${talentId}`);
      return { success: true, talentId };

    } catch (error) {
      this.logger.error(`Failed to publish talent ${talentId}`, error.stack);
      throw error; // Will trigger retry
    }
  }

  private formatTalentMessage(talent: any): string {
    return `
🎯 New Talent Available!

Name: ${talent.name}
Category: ${talent.serviceCategory}
Experience: ${talent.experienceLevel}
Skills: ${talent.skills.join(', ')}

${talent.bio || ''}

Contact via bot: /talent_${talent.id}
    `.trim();
  }
}


