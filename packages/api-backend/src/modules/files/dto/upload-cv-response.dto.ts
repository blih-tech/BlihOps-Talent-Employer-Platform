import { ApiProperty } from '@nestjs/swagger';

export class UploadCvResponseDto {
  @ApiProperty({
    description: 'Relative path to the uploaded CV file',
    example: '/cvs/123e4567-e89b-12d3-a456-426614174000/550e8400-e29b-41d4-a716-446655440000.pdf',
  })
  cvPath: string;

  @ApiProperty({
    description: 'Success message',
    example: 'CV uploaded successfully',
  })
  message: string;
}


