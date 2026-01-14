import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobQueryDto } from './dto/job-query.dto';
import { ApplicationActionDto, BulkApplicationActionDto } from './dto/application-action.dto';
import { JobApplicantsResponseDto } from './dto/job-applicant.dto';

@ApiTags('Jobs')
@ApiBearerAuth('BearerAuth')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @ApiOperation({
    summary: 'List job postings',
    description: 'Get paginated list of job postings with filtering and sorting. Employees can see all jobs with real-time status updates.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of job postings',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Job' },
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' },
            hasNext: { type: 'boolean' },
            hasPrev: { type: 'boolean' },
          },
        },
        statusSummary: {
          type: 'object',
          description: 'Real-time status summary',
          properties: {
            pending: { type: 'number', description: 'Jobs awaiting approval' },
            published: { type: 'number', description: 'Live jobs accepting applications' },
            rejected: { type: 'number', description: 'Jobs that need review' },
            closed: { type: 'number', description: 'Jobs no longer accepting applications' },
            expired: { type: 'number', description: 'Expired job postings' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Query() query: JobQueryDto) {
    return this.jobsService.findAll(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create job posting',
    description: 'Create a new job posting. Status will be set to PENDING for approval.',
  })
  @ApiResponse({
    status: 201,
    description: 'Job created successfully',
    schema: { $ref: '#/components/schemas/Job' },
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createJobDto: CreateJobDto) {
    return this.jobsService.create(createJobDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get job by ID',
    description: 'Get detailed job posting information',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Job UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Job details',
    schema: { $ref: '#/components/schemas/Job' },
  })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update job posting',
    description: 'Update job posting (partial update). Can be used to make adjustments to rejected jobs.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Job UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Job updated successfully',
    schema: { $ref: '#/components/schemas/Job' },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.jobsService.update(id, updateJobDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete job posting',
    description: 'Soft delete job posting',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Job UUID',
  })
  @ApiResponse({ status: 204, description: 'Job deleted successfully' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async remove(@Param('id') id: string) {
    return this.jobsService.remove(id);
  }

  @Post(':id/publish')
  @ApiOperation({
    summary: 'Publish job posting',
    description: 'Publish job to make it live and accepting applications. Changes status from PENDING to PUBLISHED.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Job UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Job published successfully',
    schema: { $ref: '#/components/schemas/Job' },
  })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiResponse({ status: 409, description: 'Job already published or cannot be published' })
  async publish(@Param('id') id: string) {
    return this.jobsService.publish(id);
  }

  @Post(':id/reject')
  @ApiOperation({
    summary: 'Reject job posting',
    description: 'Reject job posting. Status changes to REJECTED - review and make adjustments needed.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Job UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Job rejected successfully',
    schema: { $ref: '#/components/schemas/Job' },
  })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async reject(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.jobsService.reject(id, reason);
  }

  @Post(':id/close')
  @ApiOperation({
    summary: 'Close job posting',
    description: 'Close job posting - no longer accepting applications. Status changes to CLOSED.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Job UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Job closed successfully',
    schema: { $ref: '#/components/schemas/Job' },
  })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async close(@Param('id') id: string) {
    return this.jobsService.close(id);
  }

  @Get(':id/applicants')
  @ApiOperation({
    summary: 'View all applicants for a job',
    description: 'Get list of all applicants for a specific job post. Employees can view application details, match scores, and manage candidates.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Job UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of applicants with details',
    type: JobApplicantsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async getApplicants(@Param('id') id: string) {
    return this.jobsService.getApplicants(id);
  }

  @Post(':id/applicants/:talentId/action')
  @ApiOperation({
    summary: 'Manage candidate application',
    description: 'Shortlist, hire, or reject a candidate for a job. Check application details and make decisions.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Job UUID',
  })
  @ApiParam({
    name: 'talentId',
    type: 'string',
    format: 'uuid',
    description: 'Talent UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Action performed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        application: { $ref: '#/components/schemas/JobApplicant' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Job or talent not found' })
  @ApiResponse({ status: 400, description: 'Invalid action or application not found' })
  async manageApplication(
    @Param('id') jobId: string,
    @Param('talentId') talentId: string,
    @Body() actionDto: ApplicationActionDto,
  ) {
    return this.jobsService.manageApplication(jobId, talentId, actionDto);
  }

  @Post(':id/applicants/bulk-action')
  @ApiOperation({
    summary: 'Bulk manage candidates',
    description: 'Perform action (shortlist, hire, reject) on multiple candidates at once',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Job UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Bulk action performed',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'number', description: 'Number of successful actions' },
        failed: { type: 'number', description: 'Number of failed actions' },
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              talentId: { type: 'string' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async bulkManageApplications(
    @Param('id') jobId: string,
    @Body() bulkActionDto: BulkApplicationActionDto,
  ) {
    return this.jobsService.bulkManageApplications(jobId, bulkActionDto);
  }
}

