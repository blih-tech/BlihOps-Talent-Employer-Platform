import { ApiProperty } from '@nestjs/swagger';

export class JobApplicantDto {
  @ApiProperty({ description: 'Talent ID', format: 'uuid' })
  talentId: string;

  @ApiProperty({ description: 'Talent name', example: 'John Doe' })
  name: string;

  @ApiProperty({ description: 'Match score (0-100)', example: 85.5 })
  matchScore: number;

  @ApiProperty({ description: 'Application status', enum: ['PENDING', 'SHORTLISTED', 'HIRED', 'REJECTED'] })
  applicationStatus: string;

  @ApiProperty({ description: 'Applied date', format: 'date-time' })
  appliedAt: Date;

  @ApiProperty({ description: 'CV file ID', format: 'uuid', nullable: true })
  cvFileId?: string;

  @ApiProperty({ description: 'Skills array', type: [String] })
  skills: string[];

  @ApiProperty({ description: 'Experience level' })
  experienceLevel: string;
}

export class JobApplicantsResponseDto {
  @ApiProperty({ description: 'Job ID', format: 'uuid' })
  jobId: string;

  @ApiProperty({ description: 'Job title', example: 'Senior Full-Stack Developer' })
  jobTitle: string;

  @ApiProperty({ description: 'List of applicants', type: [JobApplicantDto] })
  applicants: JobApplicantDto[];

  @ApiProperty({ description: 'Total number of applicants' })
  total: number;

  @ApiProperty({ description: 'Number of shortlisted applicants' })
  shortlisted: number;

  @ApiProperty({ description: 'Number of hired applicants' })
  hired: number;

  @ApiProperty({ description: 'Number of rejected applicants' })
  rejected: number;
}

