import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { TalentModule } from './modules/talent/talent.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ApplicationModule } from './modules/application/application.module';
import { AdminModule } from './modules/admin/admin.module';
import { TelegramModule } from './modules/telegram/telegram.module';
import { QueueModule } from './queue/queue.module';
import { MatchingModule } from './modules/matching/matching.module';
import { FilesModule } from './modules/files/files.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute (default)
      },
    ]),
    PrismaModule,
    HealthModule,
    QueueModule,
    AuthModule,
    FilesModule,
    TalentModule,
    JobsModule,
    ApplicationModule,
    MatchingModule,
    AdminModule,
    TelegramModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Apply throttler guard globally (can be overridden per route)
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

