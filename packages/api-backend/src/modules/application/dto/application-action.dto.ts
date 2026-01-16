import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ApplicationActionDto {
  @ApiPropertyOptional({
    description: 'Notes or reason for the action',
    maxLength: 500,
    example: 'Candidate has excellent experience in React and TypeScript',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Rejection reason (for reject action)',
    maxLength: 500,
    example: 'Does not meet minimum experience requirements',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}



