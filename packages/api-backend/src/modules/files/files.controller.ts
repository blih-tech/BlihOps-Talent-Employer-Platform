import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { FilesService } from './files.service';
import { UploadCvResponseDto } from './dto/upload-cv-response.dto';
// TODO: Import JwtAuthGuard when authentication is implemented
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { UseGuards } from '@nestjs/common';

@ApiTags('Files')
@ApiBearerAuth('BearerAuth')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload-cv')
  @HttpCode(HttpStatus.OK)
  // TODO: Uncomment when JwtAuthGuard is implemented
  // @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload CV file',
    description:
      'Upload a CV file (PDF, DOC, or DOCX) for a talent profile. ' +
      'The file must be less than 10 MB. If the talent already has a CV, it will be replaced. ' +
      'The file is stored in the configured storage directory and the path is returned.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'talentId'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CV file (PDF, DOC, or DOCX). Maximum size: 10 MB',
        },
        talentId: {
          type: 'string',
          format: 'uuid',
          description: 'UUID of the talent profile',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'CV uploaded successfully',
    type: UploadCvResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request - validation error. Possible reasons: ' +
      'file size exceeds 10 MB, invalid file type (must be PDF, DOC, or DOCX), ' +
      'invalid file extension, or missing required fields',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example: 'File size exceeds maximum of 10 MB',
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token is missing or invalid',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - file storage operation failed',
  })
  async uploadCV(
    @UploadedFile() file: Express.Multer.File,
    @Body('talentId') talentId: string,
  ): Promise<UploadCvResponseDto> {
    const cvPath = await this.filesService.uploadCV(file, talentId);
    return { cvPath, message: 'CV uploaded successfully' };
  }
}

