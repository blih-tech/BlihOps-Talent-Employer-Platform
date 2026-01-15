import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class RejectJobDto {
  @ApiPropertyOptional({
    description: 'Reason for rejection',
    maxLength: 500,
    example: 'Job posting does not meet quality standards',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}


