import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  MinLength,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';
import { ServiceCategory, ExperienceLevel, EngagementType } from '@blihops/shared';

export class CreateJobDto {
  @ApiProperty({
    description: 'Job title',
    minLength: 3,
    maxLength: 200,
    example: 'Senior Full-Stack Developer',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Job description',
    minLength: 10,
    example: 'We are looking for an experienced full-stack developer...',
  })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({
    enum: ServiceCategory,
    description: 'Service category',
    example: ServiceCategory.ITO,
  })
  @IsEnum(ServiceCategory)
  serviceCategory: ServiceCategory;

  @ApiProperty({
    description: 'Required skills array',
    type: [String],
    minItems: 1,
    maxItems: 50,
    example: ['TypeScript', 'NestJS', 'PostgreSQL', 'React'],
  })
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  requiredSkills: string[];

  @ApiProperty({
    enum: ExperienceLevel,
    description: 'Required experience level',
    example: ExperienceLevel.SENIOR,
  })
  @IsEnum(ExperienceLevel)
  experienceLevel: ExperienceLevel;

  @ApiProperty({
    enum: EngagementType,
    description: 'Engagement type',
    example: EngagementType.FULL_TIME,
  })
  @IsEnum(EngagementType)
  engagementType: EngagementType;

  @ApiPropertyOptional({
    description: 'Job duration',
    maxLength: 100,
    example: '6 months',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  duration?: string;

  @ApiPropertyOptional({
    description: 'Budget or salary range',
    maxLength: 100,
    example: '$5000 - $7000/month',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  budget?: string;
}

