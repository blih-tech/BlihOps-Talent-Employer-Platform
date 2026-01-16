import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { TelegramService } from '../../modules/telegram/telegram.service';
import { QUEUE_NAMES } from '../queue.config';

interface PublishTalentJobData {
  talentId: string;
}

@Processor(QUEUE_NAMES.PUBLISH_TALENT)
export class PublishTalentProcessor {
  private readonly logger = new Logger(PublishTalentProcessor.name);
  private readonly talentChannelId: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private telegramService: TelegramService,
  ) {
    // Get talents channel ID from environment
    // Default: -1003451753461 (BlihOps Talents Channel)
    this.talentChannelId = this.configService.get<string>(
      'TELEGRAM_CHANNEL_ID_TALENTS',
      '-1003451753461',
    );
  }

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

      // Send to Telegram Talents Channel
      // Channel ID: -1003451753461 (BlihOps Talents Channel)
      const messageId = await this.telegramService.sendMessageToTalentsChannel(message);
      
      if (!messageId) {
        throw new Error(`Failed to publish talent ${talentId} to Telegram channel`);
      }

      this.logger.log(
        `Successfully published talent ${talentId} to Talents Channel (${this.talentChannelId}). Message ID: ${messageId}`,
      );

      // Update job progress
      await job.progress(100);

      this.logger.log(`Successfully published talent ${talentId}`);
      return { success: true, talentId };

    } catch (error: unknown) {
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to publish talent ${talentId}`, errorStack);
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


