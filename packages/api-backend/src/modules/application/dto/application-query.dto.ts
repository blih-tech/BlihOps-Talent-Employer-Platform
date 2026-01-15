import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum ApplicationStatus {
  NEW = 'NEW',
  SHORTLISTED = 'SHORTLISTED',
  HIRED = 'HIRED',
  REJECTED = 'REJECTED',
}

export class ApplicationQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (1-indexed)',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 20,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Filter by application status',
    enum: ApplicationStatus,
    example: ApplicationStatus.NEW,
  })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @ApiPropertyOptional({
    description: 'Minimum match score',
    minimum: 0,
    maximum: 100,
    example: 70,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  minMatchScore?: number;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: ['matchScore', 'appliedAt', 'updatedAt'],
    default: 'matchScore',
  })
  @IsOptional()
  @IsEnum(['matchScore', 'appliedAt', 'updatedAt'])
  sortBy?: 'matchScore' | 'appliedAt' | 'updatedAt' = 'matchScore';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

