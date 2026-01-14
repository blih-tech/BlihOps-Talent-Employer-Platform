import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { TalentModule } from './modules/talent/talent.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    AuthModule,
    TalentModule,
    // TODO: Add other modules here
    // JobsModule,
    // MatchingModule,
    // AdminModule,
    // TelegramModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

