# STREAM 3: Backend Jobs, Matching & Admin Modules

**Developer**: Backend Developer 2  
**Duration**: 2-3 weeks (Week 5-10)  
**Status**: ❌ NOT STARTED  
**Dependencies**: ⚠️ REQUIRES Stream 2 Task 2.1 (Database), Task 2.2 (NestJS Core)  
**Can Work Parallel**: ✅ YES - After dependencies met, can work parallel with Stream 2

---

## 📊 Stream Overview

This stream covers:
1. **Jobs Module** - Complete job management (CRUD, status workflow, publishing)
2. **Matching Module** - On-the-fly matching algorithm with Redis caching
3. **Admin Module** - Admin dashboard API endpoints (statistics, analytics)
4. **Telegram Webhook Module** - Webhook handler for bot integration

---

## 🚨 DEPENDENCY CHECK

### ✅ Prerequisites (Must be completed first)
- [ ] **Stream 1**: Development environment running
- [ ] **Stream 2 Task 2.1**: Prisma setup complete - Database schema exists
- [ ] **Stream 2 Task 2.2**: NestJS core infrastructure ready
- [ ] **Decision 003**: Rate limiting strategy defined

### ⚠️ Before Starting
- [ ] **Verify Docker services are running**: `docker-compose -f docker-compose.dev.yml up -d`
- [ ] **Verify PostgreSQL is accessible**: Port 5432
- [ ] **Verify Redis is accessible**: Port 6379
- [ ] **Verify Prisma client is generated**: `npx prisma generate`
- [ ] **Verify database migrations are applied**: `npx prisma migrate dev`

**❌ IF ANY DEPENDENCY IS NOT MET, STOP AND NOTIFY TEAM**

---

## ✅ Already Completed

### Core Infrastructure
- [x] `packages/core/` - Logger, exceptions, config, events
- [x] `packages/shared/` - Types, constants, schemas, utils
- [x] `packages/api-backend/modules/auth/` - JWT authentication
- [x] Decision 003 - Rate limiting strategy defined

---

## 🚀 Tasks to Complete

### TASK 3.1: Jobs Module Implementation (1 week)
**Priority**: CRITICAL - Blocks bot job creation flow  
**Status**: ❌ NOT STARTED  
**Dependencies**: Stream 2 Task 2.1 (Database)

#### Subtask 3.1.1: Jobs Service (Day 1-2)
- [ ] Create jobs module structure
- [ ] Create jobs service with Prisma
- [ ] Implement CRUD operations
- [ ] Implement job status workflow
- [ ] Add status transition validation
- [ ] Add audit logging

**Files to create**:
- `packages/api-backend/src/modules/jobs/jobs.service.ts`
- `packages/api-backend/src/modules/jobs/jobs.module.ts`

**Job Status Workflow**:
```
PENDING → PUBLISHED → CLOSED
        ↘ REJECTED  ↗ ARCHIVED
```

**Jobs Service Template**:
```typescript
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateJobDto, UpdateJobDto, JobQueryDto } from './dto';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateJobDto, adminId: string) {
    return this.prisma.job.create({
      data: {
        title: dto.title,
        description: dto.description,
        serviceCategory: dto.serviceCategory,
        requiredSkills: dto.requiredSkills,
        experienceLevel: dto.experienceLevel,
        engagementType: dto.engagementType,
        duration: dto.duration,
        budget: dto.budget,
        status: 'PENDING',
        createdById: adminId,
      },
    });
  }

  async findAll(query: JobQueryDto) {
    const { page = 1, limit = 10, status, serviceCategory } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (serviceCategory) where.serviceCategory = serviceCategory;

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        skip,
        take: limit,
        include: { createdBy: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      data: jobs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        createdBy: true,
        applications: {
          include: { talent: true },
          orderBy: { matchScore: 'desc' },
        },
      },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    return job;
  }

  async update(id: string, dto: UpdateJobDto) {
    return this.prisma.job.update({
      where: { id },
      data: dto,
    });
  }

  async publish(id: string, adminId: string) {
    const job = await this.findOne(id);

    // Validate status transition
    if (job.status !== 'PENDING') {
      throw new BadRequestException(`Job must be in PENDING status to publish`);
    }

    const updatedJob = await this.prisma.job.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'PUBLISH_JOB',
        resourceType: 'JOB',
        resourceId: id,
        metadata: { jobTitle: job.title },
      },
    });

    // TODO: Emit event for publishing to Telegram channel
    // this.eventEmitter.emit('job.published', updatedJob);

    return updatedJob;
  }

  async reject(id: string, adminId: string, reason?: string) {
    const job = await this.findOne(id);

    if (job.status !== 'PENDING') {
      throw new BadRequestException(`Job must be in PENDING status to reject`);
    }

    const updatedJob = await this.prisma.job.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'REJECT_JOB',
        resourceType: 'JOB',
        resourceId: id,
        metadata: { jobTitle: job.title, reason },
      },
    });

    return updatedJob;
  }

  async close(id: string, adminId: string) {
    const job = await this.findOne(id);

    if (job.status !== 'PUBLISHED') {
      throw new BadRequestException(`Only published jobs can be closed`);
    }

    const updatedJob = await this.prisma.job.update({
      where: { id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'CLOSE_JOB',
        resourceType: 'JOB',
        resourceId: id,
        metadata: { jobTitle: job.title },
      },
    });

    return updatedJob;
  }

  async archive(id: string, adminId: string) {
    const job = await this.findOne(id);

    if (job.status !== 'CLOSED') {
      throw new BadRequestException(`Only closed jobs can be archived`);
    }

    const updatedJob = await this.prisma.job.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'ARCHIVE_JOB',
        resourceType: 'JOB',
        resourceId: id,
        metadata: { jobTitle: job.title },
      },
    });

    return updatedJob;
  }
}
```

**Acceptance Criteria**:
- All CRUD operations work
- Status transitions are validated
- Audit logs are created for status changes
- Errors are handled gracefully

---

#### Subtask 3.1.2: Jobs DTOs (Day 1)
- [ ] Create CreateJobDto
- [ ] Create UpdateJobDto
- [ ] Create JobQueryDto
- [ ] Create JobStatusDto
- [ ] Create RejectJobDto
- [ ] Add validation decorators

**Files to create**:
- `packages/api-backend/src/modules/jobs/dto/create-job.dto.ts`
- `packages/api-backend/src/modules/jobs/dto/update-job.dto.ts`
- `packages/api-backend/src/modules/jobs/dto/job-query.dto.ts`
- `packages/api-backend/src/modules/jobs/dto/job-status.dto.ts`
- `packages/api-backend/src/modules/jobs/dto/reject-job.dto.ts`

**CreateJobDto Template**:
```typescript
import { IsString, IsEnum, IsArray, IsOptional, MinLength } from 'class-validator';
import { ServiceCategory, ExperienceLevel, EngagementType } from '@blihops/shared';

export class CreateJobDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsEnum(ServiceCategory)
  serviceCategory: ServiceCategory;

  @IsArray()
  @IsString({ each: true })
  requiredSkills: string[];

  @IsEnum(ExperienceLevel)
  experienceLevel: ExperienceLevel;

  @IsEnum(EngagementType)
  engagementType: EngagementType;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsString()
  budget?: string;
}
```

**RejectJobDto Template**:
```typescript
import { IsString, IsOptional } from 'class-validator';

export class RejectJobDto {
  @IsString()
  @IsOptional()
  reason?: string;
}
```

**Acceptance Criteria**:
- All DTOs have proper validation
- DTOs use shared types from `@blihops/shared`

---

#### Subtask 3.1.3: Jobs Controller (Day 2-3)
- [ ] Create jobs controller
- [ ] Implement all endpoints
- [ ] Add auth guards
- [ ] Add role-based guards (admin only for some endpoints)
- [ ] Add Swagger documentation
- [ ] Add rate limiting decorators

**Files to create**:
- `packages/api-backend/src/modules/jobs/jobs.controller.ts`

**Endpoints to implement**:
- `GET /api/v1/jobs` - List jobs (with filters)
- `GET /api/v1/jobs/:id` - Get job details
- `POST /api/v1/jobs` - Create job (admin only)
- `PATCH /api/v1/jobs/:id` - Update job (admin only)
- `POST /api/v1/jobs/:id/publish` - Publish job (admin only)
- `POST /api/v1/jobs/:id/reject` - Reject job (admin only)
- `POST /api/v1/jobs/:id/close` - Close job (admin only)
- `POST /api/v1/jobs/:id/archive` - Archive job (admin only)

**Jobs Controller Template**:
```typescript
import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JobsService } from './jobs.service';
import { CreateJobDto, UpdateJobDto, JobQueryDto, RejectJobDto } from './dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  findAll(@Query() query: JobQueryDto) {
    return this.jobsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  create(@Body() dto: CreateJobDto, @CurrentUser('id') adminId: string) {
    return this.jobsService.create(dto, adminId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() dto: UpdateJobDto) {
    return this.jobsService.update(id, dto);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  publish(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.jobsService.publish(id, adminId);
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  reject(@Param('id') id: string, @Body() dto: RejectJobDto, @CurrentUser('id') adminId: string) {
    return this.jobsService.reject(id, adminId, dto.reason);
  }

  @Post(':id/close')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  close(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.jobsService.close(id, adminId);
  }

  @Post(':id/archive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  archive(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.jobsService.archive(id, adminId);
  }
}
```

**Acceptance Criteria**:
- All endpoints are functional
- Auth guards protect admin-only endpoints
- Swagger documentation is complete
- Rate limiting is configured

---

#### Subtask 3.1.4: Jobs Module Testing (Day 3-4)
- [ ] Write unit tests for jobs service
- [ ] Write integration tests for jobs controller
- [ ] Test status transitions
- [ ] Test error scenarios

**Files to create**:
- `packages/api-backend/src/modules/jobs/jobs.service.spec.ts`
- `packages/api-backend/src/modules/jobs/jobs.controller.spec.ts`

**Acceptance Criteria**:
- Unit tests pass
- Integration tests pass
- Test coverage >80%

---

### TASK 3.2: Matching Module Implementation (1 week)
**Priority**: HIGH - Needed for matching algorithm  
**Status**: ❌ NOT STARTED  
**Dependencies**: Task 3.1 (Jobs module), Stream 2 Task 2.3 (Talent module)

#### ⚠️ DEPENDENCY CHECK
**BEFORE STARTING**: Verify prerequisites
- [ ] Jobs module is complete (Task 3.1)
- [ ] Talent module is complete (Stream 2 Task 2.3)
- [ ] Redis is running and accessible

**❌ IF DEPENDENCIES NOT MET, CANNOT PROCEED**

#### Subtask 3.2.1: Matching Service (Day 1-3)
- [ ] Create matching module structure
- [ ] Implement on-the-fly matching algorithm
- [ ] Implement score calculation logic
- [ ] Add Redis caching
- [ ] Add cache invalidation strategy

**Files to create**:
- `packages/api-backend/src/modules/matching/matching.service.ts`
- `packages/api-backend/src/modules/matching/matching.module.ts`

**Matching Algorithm** (from spec):
- Service Category match: 30% weight
- Skill overlap: 40% weight
- Experience level: 20% weight
- Availability: 10% weight

**Matching Service Template**:
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class MatchingService {
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(
    private prisma: PrismaService,
    @InjectRedis() private redis: Redis,
  ) {}

  async findMatchingTalentsForJob(jobId: string) {
    // Check cache first
    const cacheKey = `matches:job:${jobId}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    // Get job details
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');

    // Get all approved talents
    const talents = await this.prisma.talent.findMany({
      where: { status: 'APPROVED' },
    });

    // Calculate match scores
    const matches = talents.map(talent => ({
      talent,
      score: this.calculateMatchScore(job, talent),
    }))
    .filter(match => match.score >= 50) // Only return 50%+ matches
    .sort((a, b) => b.score - a.score);

    // Cache results
    await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(matches));

    return matches;
  }

  async findMatchingJobsForTalent(talentId: string) {
    // Check cache first
    const cacheKey = `matches:talent:${talentId}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    // Get talent details
    const talent = await this.prisma.talent.findUnique({ where: { id: talentId } });
    if (!talent) throw new NotFoundException('Talent not found');

    // Get all published jobs
    const jobs = await this.prisma.job.findMany({
      where: { status: 'PUBLISHED' },
    });

    // Calculate match scores
    const matches = jobs.map(job => ({
      job,
      score: this.calculateMatchScore(job, talent),
    }))
    .filter(match => match.score >= 50)
    .sort((a, b) => b.score - a.score);

    // Cache results
    await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(matches));

    return matches;
  }

  private calculateMatchScore(job: any, talent: any): number {
    let score = 0;

    // 1. Service Category Match (30%)
    if (job.serviceCategory === talent.serviceCategory) {
      score += 30;
    }

    // 2. Skill Overlap (40%)
    const jobSkills = new Set(job.requiredSkills.map(s => s.toLowerCase()));
    const talentSkills = new Set(talent.skills.map(s => s.toLowerCase()));
    const overlap = [...jobSkills].filter(skill => talentSkills.has(skill)).length;
    const skillScore = (overlap / jobSkills.size) * 40;
    score += skillScore;

    // 3. Experience Level Match (20%)
    const expLevels = ['ENTRY', 'INTERMEDIATE', 'SENIOR', 'EXPERT'];
    const jobExpIndex = expLevels.indexOf(job.experienceLevel);
    const talentExpIndex = expLevels.indexOf(talent.experienceLevel);
    
    if (talentExpIndex === jobExpIndex) {
      score += 20;
    } else if (talentExpIndex > jobExpIndex) {
      // Talent is more experienced - good match
      score += 15;
    } else {
      // Talent is less experienced - partial match
      score += 10;
    }

    // 4. Availability (10%) - Simplified for now
    // TODO: Implement actual availability logic
    score += 10;

    return Math.round(score);
  }

  async invalidateCache(type: 'job' | 'talent', id: string) {
    const cacheKey = `matches:${type}:${id}`;
    await this.redis.del(cacheKey);
  }
}
```

**Redis Setup**:
- Install `@nestjs-modules/ioredis` and `ioredis`
  ```bash
  pnpm add @nestjs-modules/ioredis ioredis
  ```
- Configure Redis module in AppModule

**Acceptance Criteria**:
- Matching algorithm calculates scores correctly
- Redis caching works (5-minute TTL)
- Cache invalidation works
- Performance is acceptable (<100ms per match)

---

#### Subtask 3.2.2: Matching Controller (Day 3-4)
- [ ] Create matching controller
- [ ] Implement job-to-talent matching endpoint
- [ ] Implement talent-to-job matching endpoint
- [ ] Add auth guards
- [ ] Add Swagger documentation

**Files to create**:
- `packages/api-backend/src/modules/matching/matching.controller.ts`

**Endpoints to implement**:
- `GET /api/v1/matching/jobs/:jobId/talents` - Find matching talents for a job
- `GET /api/v1/matching/talents/:talentId/jobs` - Find matching jobs for a talent

**Matching Controller Template**:
```typescript
import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MatchingService } from './matching.service';

@ApiTags('matching')
@Controller('matching')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('jobs/:jobId/talents')
  findMatchingTalentsForJob(@Param('jobId') jobId: string) {
    return this.matchingService.findMatchingTalentsForJob(jobId);
  }

  @Get('talents/:talentId/jobs')
  findMatchingJobsForTalent(@Param('talentId') talentId: string) {
    return this.matchingService.findMatchingJobsForTalent(talentId);
  }
}
```

**Acceptance Criteria**:
- Both endpoints return matches sorted by score
- Only matches ≥50% are returned
- Swagger docs are complete

---

#### Subtask 3.2.3: Matching Module Testing (Day 4-5)
- [ ] Write unit tests for matching service
- [ ] Test score calculation logic
- [ ] Test caching behavior
- [ ] Test cache invalidation
- [ ] Write integration tests for matching controller

**Acceptance Criteria**:
- Unit tests pass
- Integration tests pass
- Test coverage >80%

---

### TASK 3.3: Admin Module Implementation (3-4 days)
**Priority**: MEDIUM - Needed for dashboard  
**Status**: ❌ NOT STARTED  
**Dependencies**: Task 3.1 (Jobs), Stream 2 Task 2.3 (Talent)

#### Subtask 3.3.1: Admin Service (Day 1-2)
- [ ] Create admin module structure
- [ ] Implement statistics aggregation
- [ ] Implement analytics queries
- [ ] Add bulk operations (optional for MVP)

**Files to create**:
- `packages/api-backend/src/modules/admin/admin.service.ts`
- `packages/api-backend/src/modules/admin/admin.module.ts`

**Admin Service Template**:
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStatistics() {
    const [
      totalTalents,
      pendingTalents,
      approvedTalents,
      totalJobs,
      pendingJobs,
      publishedJobs,
      totalApplications,
    ] = await Promise.all([
      this.prisma.talent.count(),
      this.prisma.talent.count({ where: { status: 'PENDING' } }),
      this.prisma.talent.count({ where: { status: 'APPROVED' } }),
      this.prisma.job.count(),
      this.prisma.job.count({ where: { status: 'PENDING' } }),
      this.prisma.job.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.application.count(),
    ]);

    return {
      talents: {
        total: totalTalents,
        pending: pendingTalents,
        approved: approvedTalents,
      },
      jobs: {
        total: totalJobs,
        pending: pendingJobs,
        published: publishedJobs,
      },
      applications: {
        total: totalApplications,
      },
    };
  }

  async getAnalytics() {
    // Conversion rates
    const totalTalents = await this.prisma.talent.count();
    const approvedTalents = await this.prisma.talent.count({ where: { status: 'APPROVED' } });
    const talentApprovalRate = totalTalents > 0 ? (approvedTalents / totalTalents) * 100 : 0;

    // Job analytics
    const totalJobs = await this.prisma.job.count();
    const publishedJobs = await this.prisma.job.count({ where: { status: 'PUBLISHED' } });
    const jobPublishRate = totalJobs > 0 ? (publishedJobs / totalJobs) * 100 : 0;

    // Application conversion rates
    const totalApplications = await this.prisma.application.count();
    const hiredApplications = await this.prisma.application.count({ where: { status: 'HIRED' } });
    const hireRate = totalApplications > 0 ? (hiredApplications / totalApplications) * 100 : 0;

    return {
      conversionRates: {
        talentApprovalRate: Math.round(talentApprovalRate * 100) / 100,
        jobPublishRate: Math.round(jobPublishRate * 100) / 100,
        applicationHireRate: Math.round(hireRate * 100) / 100,
      },
      // TODO: Add more analytics (time-to-hire, engagement metrics, etc.)
    };
  }

  async getKeyMetrics() {
    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      recentTalents,
      recentJobs,
      recentApplications,
    ] = await Promise.all([
      this.prisma.talent.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      this.prisma.job.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      this.prisma.application.count({ where: { appliedAt: { gte: sevenDaysAgo } } }),
    ]);

    return {
      recentActivity: {
        newTalents: recentTalents,
        newJobs: recentJobs,
        newApplications: recentApplications,
      },
    };
  }
}
```

**Acceptance Criteria**:
- Statistics endpoint returns accurate counts
- Analytics calculations are correct
- Performance is acceptable (<1 second)

---

#### Subtask 3.3.2: Admin Controller (Day 2-3)
- [ ] Create admin controller
- [ ] Implement statistics endpoint
- [ ] Implement analytics endpoint
- [ ] Implement key metrics endpoint
- [ ] Add auth guards (admin only)
- [ ] Add Swagger documentation

**Files to create**:
- `packages/api-backend/src/modules/admin/admin.controller.ts`

**Endpoints to implement**:
- `GET /api/v1/admin/stats` - Get dashboard statistics
- `GET /api/v1/admin/analytics` - Get analytics data
- `GET /api/v1/admin/metrics` - Get key metrics

**Acceptance Criteria**:
- All endpoints are functional
- Admin auth guards protect endpoints
- Swagger docs are complete

---

#### Subtask 3.3.3: Admin Module Testing (Day 3)
- [ ] Write unit tests for admin service
- [ ] Write integration tests for admin controller
- [ ] Test statistics calculations
- [ ] Test analytics calculations

**Acceptance Criteria**:
- Unit tests pass
- Integration tests pass
- Test coverage >80%

---

### TASK 3.4: Telegram Webhook Module (2-3 days)
**Priority**: MEDIUM - Needed for bot integration  
**Status**: ❌ NOT STARTED  
**Dependencies**: Task 3.1 (NestJS Core), Decision 003 (Rate limiting)

#### Subtask 3.4.1: Webhook Handler (Day 1-2)
- [ ] Create telegram webhook module
- [ ] Implement webhook handler endpoint
- [ ] Add webhook secret verification
- [ ] Add request validation
- [ ] Add rate limiting
- [ ] Add event routing

**Files to create**:
- `packages/api-backend/src/modules/telegram/telegram.service.ts`
- `packages/api-backend/src/modules/telegram/telegram.controller.ts`
- `packages/api-backend/src/modules/telegram/telegram.module.ts`

**Telegram Controller Template**:
```typescript
import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiExcludeEndpoint } from '@nestjs/swagger';
import { TelegramService } from './telegram.service';
import * as crypto from 'crypto';

@ApiTags('telegram')
@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post('webhook')
  @ApiExcludeEndpoint() // Hide from Swagger (internal endpoint)
  async handleWebhook(
    @Body() update: any,
    @Headers('x-telegram-bot-api-secret-token') secretToken: string,
  ) {
    // Verify webhook secret
    const expectedToken = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (secretToken !== expectedToken) {
      throw new UnauthorizedException('Invalid webhook secret');
    }

    // Process webhook update
    return this.telegramService.handleUpdate(update);
  }
}
```

**TelegramService Template**:
```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class TelegramService {
  async handleUpdate(update: any) {
    // Route update to appropriate handler
    if (update.message) {
      return this.handleMessage(update.message);
    }
    // Add more update types as needed
    return { ok: true };
  }

  private async handleMessage(message: any) {
    // Process message
    // This will be expanded when bot is implemented
    console.log('Received message:', message);
    return { ok: true };
  }
}
```

**Acceptance Criteria**:
- Webhook endpoint accepts POST requests
- Secret token verification works
- Invalid requests are rejected
- Rate limiting is applied

---

#### Subtask 3.4.2: Webhook Testing (Day 2)
- [ ] Write unit tests for telegram service
- [ ] Test webhook secret verification
- [ ] Test rate limiting
- [ ] Test error handling

**Acceptance Criteria**:
- Unit tests pass
- Webhook security is verified

---

### TASK 3.5: API Versioning & Documentation (1 day)
**Priority**: MEDIUM  
**Status**: ❌ NOT STARTED

#### Subtask 3.5.1: Swagger/OpenAPI Setup
- [ ] Install `@nestjs/swagger`
  ```bash
  pnpm add @nestjs/swagger
  ```
- [ ] Configure SwaggerModule in `main.ts`
- [ ] Add API metadata
- [ ] Add decorators to all controllers
- [ ] Add decorators to all DTOs
- [ ] Generate OpenAPI spec
- [ ] Host Swagger UI at `/api-docs`

**Update main.ts**:
```typescript
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('BlihOps Talent Platform API')
    .setDescription('API for talent and job management')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3000);
}
```

**Acceptance Criteria**:
- Swagger UI is accessible at `/api-docs`
- All endpoints are documented
- Request/response examples are included
- Auth is properly documented

---

## 📋 Testing Requirements

### Manual Testing Checklist

#### Jobs Module
- [ ] Create a new job via API
- [ ] List all jobs with pagination
- [ ] Filter jobs by status
- [ ] Update a job
- [ ] Publish a job
- [ ] Reject a job
- [ ] Close a job
- [ ] Archive a job
- [ ] Verify audit logs

#### Matching Module
- [ ] Find matching talents for a job
- [ ] Find matching jobs for a talent
- [ ] Verify match scores are correct
- [ ] Test Redis caching (2nd request should be faster)
- [ ] Test cache invalidation

#### Admin Module
- [ ] Get dashboard statistics
- [ ] Get analytics data
- [ ] Get key metrics
- [ ] Verify calculations are accurate

#### Telegram Webhook
- [ ] Send test webhook request
- [ ] Verify secret validation works
- [ ] Test rate limiting

---

## 🎯 Definition of Done

### Jobs Module
- ✅ All CRUD operations work
- ✅ Status workflow is implemented
- ✅ Audit logging works
- ✅ Tests pass (>80% coverage)
- ✅ Swagger docs are complete

### Matching Module
- ✅ Matching algorithm works correctly
- ✅ Redis caching is implemented
- ✅ Cache invalidation works
- ✅ Tests pass (>80% coverage)

### Admin Module
- ✅ Statistics endpoint works
- ✅ Analytics calculations are correct
- ✅ Tests pass (>80% coverage)

### Telegram Webhook
- ✅ Webhook endpoint is secure
- ✅ Rate limiting is applied
- ✅ Tests pass

### Documentation
- ✅ Swagger UI is accessible
- ✅ All endpoints are documented
- ✅ OpenAPI spec is up to date

---

## 📂 Key Files

### Jobs Module
- `packages/api-backend/src/modules/jobs/jobs.service.ts`
- `packages/api-backend/src/modules/jobs/jobs.controller.ts`
- `packages/api-backend/src/modules/jobs/dto/`

### Matching Module
- `packages/api-backend/src/modules/matching/matching.service.ts`
- `packages/api-backend/src/modules/matching/matching.controller.ts`

### Admin Module
- `packages/api-backend/src/modules/admin/admin.service.ts`
- `packages/api-backend/src/modules/admin/admin.controller.ts`

### Telegram Module
- `packages/api-backend/src/modules/telegram/telegram.service.ts`
- `packages/api-backend/src/modules/telegram/telegram.controller.ts`

---

## 🚨 Blockers & Dependencies

### Current Blockers
- ⚠️ **Stream 2 Task 2.1**: Database must be set up first
- ⚠️ **Stream 2 Task 2.2**: NestJS core must be ready
- ⚠️ **Task 3.2**: Matching module needs Jobs and Talent modules complete

### This Stream Blocks
- **Stream 4**: Queue workers need Jobs module
- **Stream 5**: Telegram bot needs Jobs API and Webhook handler
- **Stream 6**: Admin dashboard needs Admin API
- **Stream 2 Task 2.4**: Application module needs Jobs module

---

**Last Updated**: 2026-01-14  
**Next Review**: Daily standup  
**Owner**: Backend Developer 2

