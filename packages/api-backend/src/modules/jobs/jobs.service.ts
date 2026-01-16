import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobQueryDto } from './dto/job-query.dto';
import { ServiceCategory as PrismaServiceCategory, ExperienceLevel as PrismaExperienceLevel, EngagementType as PrismaEngagementType } from '@prisma/client';

@Injectable()
export class JobsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async findAll(_query: JobQueryDto) {
    // TODO: Implement filtering and pagination
    return this.prisma.job.findMany();
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    return job;
  }

  async create(dto: CreateJobDto, adminId: string) {
    // TODO: Implement job creation
    return this.prisma.job.create({
      data: {
        ...dto,
        serviceCategory: dto.serviceCategory as PrismaServiceCategory,
        experienceLevel: dto.experienceLevel as PrismaExperienceLevel,
        engagementType: dto.engagementType as PrismaEngagementType,
        createdById: adminId,
      },
    });
  }

  async update(id: string, dto: UpdateJobDto) {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    // TODO: Implement update logic
    const updateData: any = { ...dto };
    if (dto.serviceCategory !== undefined) {
      updateData.serviceCategory = dto.serviceCategory as PrismaServiceCategory;
    }
    if (dto.experienceLevel !== undefined) {
      updateData.experienceLevel = dto.experienceLevel as PrismaExperienceLevel;
    }
    if (dto.engagementType !== undefined) {
      updateData.engagementType = dto.engagementType as PrismaEngagementType;
    }
    return this.prisma.job.update({
      where: { id },
      data: updateData,
    });
  }

  async publish(id: string, _adminId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    // TODO: Implement publish logic and queue job
    return this.prisma.job.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });
  }

  async reject(id: string, adminId: string, reason: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    // TODO: Implement reject logic - store reason in metadata
    return this.prisma.job.update({
      where: { id },
      data: {
        status: 'REJECTED',
        metadata: {
          ...(job.metadata as object || {}),
          rejectionReason: reason,
          rejectedBy: adminId,
          rejectedAt: new Date().toISOString(),
        },
      },
    });
  }

  async close(id: string, _adminId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    // TODO: Implement close logic
    return this.prisma.job.update({
      where: { id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
      },
    });
  }

  async archive(id: string, _adminId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    // TODO: Implement archive logic - store archivedAt in metadata
    return this.prisma.job.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
        metadata: {
          ...(job.metadata as object || {}),
          archivedAt: new Date().toISOString(),
          archivedBy: _adminId,
        },
      },
    });
  }
}
