import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApplicationService } from './application.service';
import { CreateApplicationDto, ApplicationQueryDto, ApplicationActionDto } from './dto';

@ApiTags('Applications')
@Controller('jobs/:jobId/applicants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@ApiBearerAuth('BearerAuth')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create application',
    description: 'Create a new job application (typically called from matching service)',
  })
  @ApiParam({
    name: 'jobId',
    type: 'string',
    format: 'uuid',
    description: 'Job UUID',
  })
  @ApiResponse({
    status: 201,
    description: 'Application created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 404, description: 'Job or Talent not found' })
  @ApiResponse({ status: 409, description: 'Application already exists' })
  async create(
    @Param('jobId') jobId: string,
    @Body() createDto: Omit<CreateApplicationDto, 'jobId'>,
  ) {
    return this.applicationService.create({
      ...createDto,
      jobId,
    });
  }

  @Get()
  @ApiOperation({
    summary: 'Get all applicants for a job',
    description: 'Get paginated list of applications for a specific job with filtering and sorting',
  })
  @ApiParam({
    name: 'jobId',
    type: 'string',
    format: 'uuid',
    description: 'Job UUID',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['NEW', 'SHORTLISTED', 'HIRED', 'REJECTED'] })
  @ApiQuery({ name: 'minMatchScore', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['matchScore', 'appliedAt', 'updatedAt'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({
    status: 200,
    description: 'List of applications',
  })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async findAll(
    @Param('jobId') jobId: string,
    @Query() query: ApplicationQueryDto,
  ) {
    return this.applicationService.findByJob(jobId, query);
  }

  @Get(':applicantId')
  @ApiOperation({
    summary: 'Get application details',
    description: 'Get detailed information about a specific application',
  })
  @ApiParam({
    name: 'jobId',
    type: 'string',
    format: 'uuid',
    description: 'Job UUID',
  })
  @ApiParam({
    name: 'applicantId',
    type: 'string',
    format: 'uuid',
    description: 'Application UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Application details',
  })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async findOne(
    @Param('jobId') _jobId: string,
    @Param('applicantId') applicantId: string,
  ) {
    return this.applicationService.findOne(applicantId);
  }

  @Post(':applicantId/shortlist')
  @ApiOperation({
    summary: 'Shortlist applicant',
    description: 'Mark an application as shortlisted',
  })
  @ApiParam({
    name: 'jobId',
    type: 'string',
    format: 'uuid',
    description: 'Job UUID',
  })
  @ApiParam({
    name: 'applicantId',
    type: 'string',
    format: 'uuid',
    description: 'Application UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Application shortlisted successfully',
  })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @ApiResponse({ status: 409, description: 'Application already shortlisted or cannot be shortlisted' })
  async shortlist(
    @Param('jobId') _jobId: string,
    @Param('applicantId') applicantId: string,
    @Body() dto: ApplicationActionDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.applicationService.shortlist(applicantId, adminId, dto);
  }

  @Post(':applicantId/hire')
  @ApiOperation({
    summary: 'Hire applicant',
    description: 'Mark an application as hired and update talent status',
  })
  @ApiParam({
    name: 'jobId',
    type: 'string',
    format: 'uuid',
    description: 'Job UUID',
  })
  @ApiParam({
    name: 'applicantId',
    type: 'string',
    format: 'uuid',
    description: 'Application UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Applicant hired successfully',
  })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @ApiResponse({ status: 409, description: 'Application already hired or cannot be hired' })
  async hire(
    @Param('jobId') _jobId: string,
    @Param('applicantId') applicantId: string,
    @Body() dto: ApplicationActionDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.applicationService.hire(applicantId, adminId, dto);
  }

  @Post(':applicantId/reject')
  @ApiOperation({
    summary: 'Reject applicant',
    description: 'Mark an application as rejected',
  })
  @ApiParam({
    name: 'jobId',
    type: 'string',
    format: 'uuid',
    description: 'Job UUID',
  })
  @ApiParam({
    name: 'applicantId',
    type: 'string',
    format: 'uuid',
    description: 'Application UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Application rejected successfully',
  })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @ApiResponse({ status: 409, description: 'Application already rejected or cannot be rejected' })
  async reject(
    @Param('jobId') _jobId: string,
    @Param('applicantId') applicantId: string,
    @Body() dto: ApplicationActionDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.applicationService.reject(applicantId, adminId, dto);
  }
}


