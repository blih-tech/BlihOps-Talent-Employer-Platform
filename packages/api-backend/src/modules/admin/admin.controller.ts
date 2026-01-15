import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
// TODO: Uncomment when auth guards are implemented
// import { UseGuards } from '@nestjs/common';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';
import { AdminService } from './admin.service';

@ApiTags('admin')
@ApiBearerAuth('BearerAuth')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  // TODO: Uncomment when auth guards are implemented
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('ADMIN')
  @ApiOperation({
    summary: 'Get dashboard statistics',
    description: 'Returns aggregated statistics for talents, jobs, and applications',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        talents: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            pending: { type: 'number' },
            approved: { type: 'number' },
          },
        },
        jobs: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            pending: { type: 'number' },
            published: { type: 'number' },
          },
        },
        applications: {
          type: 'object',
          properties: {
            total: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getStatistics() {
    return this.adminService.getStatistics();
  }

  @Get('analytics')
  // TODO: Uncomment when auth guards are implemented
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('ADMIN')
  @ApiOperation({
    summary: 'Get analytics data',
    description: 'Returns conversion rates and analytics metrics',
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        conversionRates: {
          type: 'object',
          properties: {
            talentApprovalRate: { type: 'number', description: 'Percentage of approved talents' },
            jobPublishRate: { type: 'number', description: 'Percentage of published jobs' },
            applicationHireRate: { type: 'number', description: 'Percentage of hired applications' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getAnalytics() {
    return this.adminService.getAnalytics();
  }

  @Get('metrics')
  // TODO: Uncomment when auth guards are implemented
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('ADMIN')
  @ApiOperation({
    summary: 'Get key metrics',
    description: 'Returns recent activity metrics (last 7 days)',
  })
  @ApiResponse({
    status: 200,
    description: 'Key metrics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        recentActivity: {
          type: 'object',
          properties: {
            newTalents: { type: 'number', description: 'New talents in last 7 days' },
            newJobs: { type: 'number', description: 'New jobs in last 7 days' },
            newApplications: { type: 'number', description: 'New applications in last 7 days' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getKeyMetrics() {
    return this.adminService.getKeyMetrics();
  }
}


