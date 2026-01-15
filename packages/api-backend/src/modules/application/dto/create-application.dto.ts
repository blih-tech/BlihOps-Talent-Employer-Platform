import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty({
    description: 'Job ID',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  jobId: string;

  @ApiProperty({
    description: 'Talent ID',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  talentId: string;

  @ApiProperty({
    description: 'Match score (0-100)',
    minimum: 0,
    maximum: 100,
    example: 85.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  matchScore?: number;

  @ApiProperty({
    description: 'Match breakdown details (JSON)',
    required: false,
  })
  @IsOptional()
  matchBreakdown?: any;
}


