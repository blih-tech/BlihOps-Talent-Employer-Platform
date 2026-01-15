import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { FileCleanupService } from './file-cleanup.service';

@Module({
  controllers: [FilesController],
  providers: [FilesService, FileCleanupService],
  exports: [FilesService],
})
export class FilesModule {}
