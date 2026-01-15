import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { readdir, stat, unlink } from 'fs/promises';
import { join } from 'path';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FileCleanupService {
  private readonly logger = new Logger(FileCleanupService.name);
  private readonly STORAGE_PATH = process.env.STORAGE_PATH || '/app/storage';

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupOrphanedFiles() {
    this.logger.log('Starting orphaned file cleanup...');

    try {
      const cvsDir = join(this.STORAGE_PATH, 'cvs');

      // Get all CV paths from database
      const talents = await this.prisma.talent.findMany({
        where: { cvUrl: { not: null } },
        select: { cvUrl: true },
      });

      const dbPaths = new Set(talents.map((t) => t.cvUrl).filter(Boolean));

      // Scan storage directory
      let talentDirs: string[];
      try {
        talentDirs = await readdir(cvsDir);
      } catch (error) {
        // CVs directory might not exist, that's ok
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          this.logger.log('CVs directory does not exist, skipping cleanup');
          return;
        }
        throw error;
      }

      let deletedCount = 0;

      for (const talentDir of talentDirs) {
        const dirPath = join(cvsDir, talentDir);
        const files = await readdir(dirPath);

        for (const file of files) {
          const filePath = join(dirPath, file);
          const relativePath = `/cvs/${talentDir}/${file}`;

          // Check if file is in database
          if (!dbPaths.has(relativePath)) {
            const fileStats = await stat(filePath);
            const ageInDays =
              (Date.now() - fileStats.mtimeMs) / (1000 * 60 * 60 * 24);

            // Delete if older than 30 days
            if (ageInDays > 30) {
              await unlink(filePath);
              deletedCount++;
              this.logger.log(`Deleted orphaned file: ${relativePath}`);
            }
          }
        }
      }

      this.logger.log(
        `Cleanup complete. Deleted ${deletedCount} orphaned files.`,
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.stack : String(error);
      this.logger.error('File cleanup failed', errorMessage);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupTempFiles() {
    this.logger.log('Starting temporary file cleanup...');

    try {
      const tempDir = join(this.STORAGE_PATH, 'temp');

      // Check if temp directory exists
      try {
        const files = await readdir(tempDir);
        let deletedCount = 0;

        for (const file of files) {
          const filePath = join(tempDir, file);
          const fileStats = await stat(filePath);
          const ageInHours =
            (Date.now() - fileStats.mtimeMs) / (1000 * 60 * 60);

          // Delete if older than 24 hours
          if (ageInHours > 24) {
            await unlink(filePath);
            deletedCount++;
            this.logger.log(`Deleted temp file: ${file}`);
          }
        }

        this.logger.log(
          `Temp cleanup complete. Deleted ${deletedCount} temp files.`,
        );
      } catch (error) {
        // Temp directory might not exist, that's ok
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw error;
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.stack : String(error);
      this.logger.error('Temp file cleanup failed', errorMessage);
    }
  }
}
