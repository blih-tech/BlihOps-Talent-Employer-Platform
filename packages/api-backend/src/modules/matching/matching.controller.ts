import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { MatchingService } from './matching.service';

@ApiTags('matching')
@Controller('matching')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('jobs/:jobId/talents')
  @ApiOperation({
    summary: 'Find matching talents for a job',
    description:
      'Returns a list of talents that match the specified job, sorted by match score (highest first). Only returns matches with score >= 50%.',
  })
  @ApiParam({
    name: 'jobId',
    description: 'The ID of the job to find matches for',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of matching talents with scores',
  })
  @ApiResponse({
    status: 404,
    description: 'Job not found',
  })
  async findMatchingTalentsForJob(@Param('jobId') jobId: string) {
    return this.matchingService.findMatchingTalentsForJob(jobId);
  }

  @Get('talents/:talentId/jobs')
  @ApiOperation({
    summary: 'Find matching jobs for a talent',
    description:
      'Returns a list of jobs that match the specified talent, sorted by match score (highest first). Only returns matches with score >= 50%.',
  })
  @ApiParam({
    name: 'talentId',
    description: 'The ID of the talent to find matches for',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of matching jobs with scores',
  })
  @ApiResponse({
    status: 404,
    description: 'Talent not found',
  })
  async findMatchingJobsForTalent(@Param('talentId') talentId: string) {
    return this.matchingService.findMatchingJobsForTalent(talentId);
  }
}



