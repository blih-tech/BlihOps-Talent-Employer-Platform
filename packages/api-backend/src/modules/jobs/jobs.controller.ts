import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JobsService } from './jobs.service';
import { CreateJobDto, UpdateJobDto, JobQueryDto, RejectJobDto } from './dto';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @ApiOperation({
    summary: 'List jobs',
    description: 'Get paginated list of jobs with filtering and sorting',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'PUBLISHED', 'REJECTED', 'CLOSED', 'ARCHIVED'], description: 'Filter by job status' })
  @ApiQuery({ name: 'serviceCategory', required: false, type: String, description: 'Filter by service category' })
  @ApiQuery({ name: 'experienceLevel', required: false, enum: ['JUNIOR', 'MID', 'SENIOR', 'LEAD'], description: 'Filter by experience level' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['createdAt', 'updatedAt', 'title'], description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  @ApiResponse({
    status: 200,
    description: 'List of jobs',
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
      },
    },
  })
  findAll(@Query() query: JobQueryDto) {
    return this.jobsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get job by ID',
    description: 'Get detailed job information',
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
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth('BearerAuth')
  @ApiOperation({
    summary: 'Create job',
    description: 'Create a new job posting (admin only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Job created successfully',
    schema: { $ref: '#/components/schemas/Job' },
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  create(@Body() dto: CreateJobDto, @CurrentUser('id') adminId: string) {
    return this.jobsService.create(dto, adminId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth('BearerAuth')
  @ApiOperation({
    summary: 'Update job',
    description: 'Update job posting (partial update, admin only)',
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
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  update(@Param('id') id: string, @Body() dto: UpdateJobDto) {
    return this.jobsService.update(id, dto);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth('BearerAuth')
  @ApiOperation({
    summary: 'Publish job',
    description: 'Publish a pending job to make it visible to talents and trigger matching',
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
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  publish(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.jobsService.publish(id, adminId);
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth('BearerAuth')
  @ApiOperation({
    summary: 'Reject job',
    description: 'Reject a pending job with optional reason',
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
  @ApiResponse({ status: 409, description: 'Job already rejected or cannot be rejected' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  reject(@Param('id') id: string, @Body() dto: RejectJobDto, @CurrentUser('id') adminId: string) {
    return this.jobsService.reject(id, adminId, dto.reason || 'No reason provided');
  }

  @Post(':id/close')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth('BearerAuth')
  @ApiOperation({
    summary: 'Close job',
    description: 'Close a published job (no longer accepting applications)',
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
  @ApiResponse({ status: 409, description: 'Job already closed or cannot be closed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  close(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.jobsService.close(id, adminId);
  }

  @Post(':id/archive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth('BearerAuth')
  @ApiOperation({
    summary: 'Archive job',
    description: 'Archive a closed or expired job',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Job UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Job archived successfully',
    schema: { $ref: '#/components/schemas/Job' },
  })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiResponse({ status: 409, description: 'Job already archived or cannot be archived' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  archive(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.jobsService.archive(id, adminId);
  }
}
