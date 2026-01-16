import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { TelegramModule } from '../modules/telegram/telegram.module';
import { QUEUE_NAMES } from './queue.config';
import { PublishTalentProcessor } from './processors/publish-talent.processor';
import { PublishJobProcessor } from './processors/publish-job.processor';
import { NotifyTalentProcessor } from './processors/notify-talent.processor';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Prefer BULLMQ_REDIS_URL, fallback to REDIS_URL
        const redisUrl = configService.get<string>('BULLMQ_REDIS_URL') || configService.get<string>('REDIS_URL');
        
        // If REDIS_URL is provided, use it directly
        if (redisUrl) {
          return {
            redis: {
              url: redisUrl,
              retryStrategy: (times: number) => {
                // Exponential backoff with max delay of 3 seconds
                const delay = Math.min(times * 100, 3000);
                console.log(`BullMQ Redis connection retry attempt ${times}, waiting ${delay}ms...`);
                return delay;
              },
              reconnectOnError: (err: Error) => {
                // Reconnect on any error (connection refused, etc.)
                console.log(`BullMQ Redis connection error: ${err.message}, attempting reconnect...`);
                return true;
              },
              connectTimeout: 10000, // 10 second connection timeout
            },
          };
        }

        // Otherwise, use individual host/port configuration
        return {
          redis: {
            host: configService.get('REDIS_HOST', 'localhost'),
            port: configService.get<number>('REDIS_PORT', 6379),
            password: configService.get<string>('REDIS_PASSWORD'),
            retryStrategy: (times: number) => {
              // Exponential backoff with max delay of 3 seconds
              const delay = Math.min(times * 100, 3000);
              console.log(`BullMQ Redis connection retry attempt ${times}, waiting ${delay}ms...`);
              return delay;
            },
            reconnectOnError: (err: Error) => {
              // Reconnect on any error (connection refused, etc.)
              console.log(`BullMQ Redis connection error: ${err.message}, attempting reconnect...`);
              return true;
            },
            connectTimeout: 10000, // 10 second connection timeout
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
            options: {
              retryStrategy: (times: number) => {
                // Exponential backoff with max delay of 3 seconds
                const delay = Math.min(times * 100, 3000);
                if (times <= 10) { // Only log first 10 retries to avoid spam
                  console.log(`Redis connection retry attempt ${times}, waiting ${delay}ms...`);
                }
                return delay;
              },
              reconnectOnError: (err: Error) => {
                // Reconnect on any error (connection refused, etc.)
                console.log(`Redis connection error: ${err.message}, attempting reconnect...`);
                return true;
              },
              connectTimeout: 10000, // 10 second connection timeout
            },
          };
        }

        // Otherwise, use individual host/port configuration
        return {
          type: 'single',
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD'),
          options: {
            retryStrategy: (times: number) => {
              // Exponential backoff with max delay of 3 seconds
              const delay = Math.min(times * 100, 3000);
              if (times <= 10) { // Only log first 10 retries to avoid spam
                console.log(`Redis connection retry attempt ${times}, waiting ${delay}ms...`);
              }
              return delay;
            },
            reconnectOnError: (err: Error) => {
              // Reconnect on any error (connection refused, etc.)
              console.log(`Redis connection error: ${err.message}, attempting reconnect...`);
              return true;
            },
            connectTimeout: 10000, // 10 second connection timeout
          },
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
    TelegramModule, // Import TelegramModule to use TelegramService for channel publishing
  ],
  providers: [PublishTalentProcessor, PublishJobProcessor, NotifyTalentProcessor],
  exports: [BullModule],
})
export class QueueModule {}
