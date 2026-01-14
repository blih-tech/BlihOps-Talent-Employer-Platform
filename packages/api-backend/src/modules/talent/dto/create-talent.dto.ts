import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsInt,
  MinLength,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';
import { ServiceCategory, ExperienceLevel, AvailabilityStatus, EngagementType } from '@blihops/shared';

export class CreateTalentDto {
  @ApiProperty({
    description: 'Telegram user ID',
    example: 123456789,
    type: Number,
  })
  @IsInt()
  telegramId: number;

  @ApiProperty({
    description: 'Full name',
    minLength: 2,
    maxLength: 100,
    example: 'John Doe',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    enum: ServiceCategory,
    description: 'Service category',
    example: ServiceCategory.ITO,
  })
  @IsEnum(ServiceCategory)
  serviceCategory: ServiceCategory;

  @ApiPropertyOptional({
    description: 'Role specialization',
    maxLength: 200,
    example: 'Senior Full-Stack Developer',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  roleSpecialization?: string;

  @ApiProperty({
    description: 'Skills array',
    type: [String],
    minItems: 1,
    maxItems: 50,
    example: ['TypeScript', 'NestJS', 'PostgreSQL', 'React'],
  })
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  skills: string[];

  @ApiProperty({
    enum: ExperienceLevel,
    description: 'Experience level',
    example: ExperienceLevel.SENIOR,
  })
  @IsEnum(ExperienceLevel)
  experienceLevel: ExperienceLevel;

  @ApiProperty({
    enum: AvailabilityStatus,
    description: 'Availability status',
    example: AvailabilityStatus.AVAILABLE,
  })
  @IsEnum(AvailabilityStatus)
  availability: AvailabilityStatus;

  @ApiProperty({
    enum: EngagementType,
    description: 'Engagement preference',
    example: EngagementType.FULL_TIME,
  })
  @IsEnum(EngagementType)
  engagementPreference: EngagementType;

  @ApiPropertyOptional({
    description: 'CV file ID (UUID)',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  cvFileId?: string;

  @ApiPropertyOptional({
    description: 'Consent for public visibility',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  consentForPublicVisibility?: boolean;
}

