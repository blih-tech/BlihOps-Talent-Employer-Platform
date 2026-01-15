import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceCategory } from '@blihops/shared';
import { TalentStatus } from '@prisma/client';

export class TalentQueryDto {
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
    description: 'Filter by approval status',
    enum: TalentStatus,
    example: TalentStatus.PENDING,
  })
  @IsOptional()
  @Type(() => String)
  @IsEnum(TalentStatus)
  status?: TalentStatus;

  @ApiPropertyOptional({
    enum: ServiceCategory,
    description: 'Filter by service category',
  })
  @IsOptional()
  @Type(() => String)
  @IsEnum(ServiceCategory)
  category?: ServiceCategory;

  @ApiPropertyOptional({
    description: 'Filter by skills (comma-separated)',
    example: 'TypeScript,NestJS,PostgreSQL',
  })
  @IsOptional()
  @IsString()
  skills?: string;

  @ApiPropertyOptional({
    description: 'Search in name and skills',
    example: 'developer',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: ['createdAt', 'name', 'experienceLevel'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsEnum(['createdAt', 'name', 'experienceLevel'])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}



