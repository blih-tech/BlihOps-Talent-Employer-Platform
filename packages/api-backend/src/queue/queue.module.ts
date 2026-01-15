import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { QUEUE_NAMES } from './queue.config';
import { PublishTalentProcessor } from './processors/publish-talent.processor';
import { PublishJobProcessor } from './processors/publish-job.processor';
import { NotifyTalentProcessor } from './processors/notify-talent.processor';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        
        // If REDIS_URL is provided, use it directly
        if (redisUrl) {
          return {
            redis: {
              url: redisUrl,
            },
          };
        }

        // Otherwise, use individual host/port configuration
        return {
          redis: {
            host: configService.get('REDIS_HOST', 'localhost'),
            port: configService.get<number>('REDIS_PORT', 6379),
            password: configService.get<string>('REDIS_PASSWORD'),
          },
        };
      },
    }),
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');

        // If REDIS_URL is provided, use it directly
        if (redisUrl) {
          return {
            type: 'single',
            url: redisUrl,
          };
        }

        // Otherwise, use individual host/port configuration
        return {
          type: 'single',
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD'),
        };
      },
    }),
    // Register all queues with default options
    BullModule.registerQueue(
      { 
        name: QUEUE_NAMES.PUBLISH_TALENT,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 100,
          removeOnFail: 500,
        },
      },
      { 
        name: QUEUE_NAMES.PUBLISH_JOB,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 100,
          removeOnFail: 500,
        },
      },
      { 
        name: QUEUE_NAMES.NOTIFY_TALENT,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 100,
          removeOnFail: 500,
        },
      },
    ),
  ],
  providers: [PublishTalentProcessor, PublishJobProcessor, NotifyTalentProcessor],
  exports: [BullModule],
})
export class QueueModule {}
