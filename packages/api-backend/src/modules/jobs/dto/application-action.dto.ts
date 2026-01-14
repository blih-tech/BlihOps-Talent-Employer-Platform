import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export enum ApplicationAction {
  SHORTLIST = 'SHORTLIST',
  HIRE = 'HIRE',
  REJECT = 'REJECT',
}

export class ApplicationActionDto {
  @ApiProperty({
    enum: ApplicationAction,
    description: 'Action to perform on the application',
    example: ApplicationAction.SHORTLIST,
  })
  @IsEnum(ApplicationAction)
  action: ApplicationAction;

  @ApiPropertyOptional({
    description: 'Optional reason or notes for the action',
    example: 'Strong technical skills match',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class BulkApplicationActionDto {
  @ApiProperty({
    description: 'Array of talent IDs to perform action on',
    type: [String],
    format: 'uuid',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
  })
  @IsUUID('4', { each: true })
  talentIds: string[];

  @ApiProperty({
    enum: ApplicationAction,
    description: 'Action to perform on all applications',
    example: ApplicationAction.SHORTLIST,
  })
  @IsEnum(ApplicationAction)
  action: ApplicationAction;

  @ApiPropertyOptional({
    description: 'Optional reason or notes for the action',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

