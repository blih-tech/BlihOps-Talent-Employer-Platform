import { Injectable, BadRequestException } from '@nestjs/common';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilesService {
  private readonly STORAGE_PATH = process.env.STORAGE_PATH || '/app/storage';
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
  private readonly ALLOWED_MIMETYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  async uploadCV(file: Express.Multer.File, talentId: string): Promise<string> {
    // Validate file
    this.validateFile(file);

    // Generate unique filename
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const talentDir = join(this.STORAGE_PATH, 'cvs', talentId);
    const filePath = join(talentDir, fileName);

    // Create directory if it doesn't exist
    await mkdir(talentDir, { recursive: true });

    // Write file to storage
    await writeFile(filePath, file.buffer);

    // Return relative path (for database storage)
    return `/cvs/${talentId}/${fileName}`;
  }

  async deleteCV(cvPath: string): Promise<void> {
    const fullPath = join(this.STORAGE_PATH, cvPath);

    try {
      await unlink(fullPath);
    } catch (error) {
      // File might not exist, log but don't throw
      console.error(`Failed to delete file ${cvPath}:`, error);
    }
  }

  private validateFile(file: Express.Multer.File): void {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(`File size exceeds maximum of 10 MB`);
    }

    // Check MIME type
    if (!this.ALLOWED_MIMETYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed: PDF, DOC, DOCX`,
      );
    }

    // Additional validation: check file extension
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext || '')) {
      throw new BadRequestException(`Invalid file extension`);
    }
  }
}

