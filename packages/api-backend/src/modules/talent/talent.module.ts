import { Module } from '@nestjs/common';
import { TalentController } from './talent.controller';
import { TalentService } from './talent.service';
import { QueueModule } from '../../queue/queue.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [QueueModule, FilesModule],
  controllers: [TalentController],
  providers: [TalentService],
  exports: [TalentService],
})
export class TalentModule {}



