import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateApplicationDto, ApplicationQueryDto, ApplicationActionDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ApplicationService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateApplicationDto) {
    // Check if job exists
    const job = await this.prisma.job.findUnique({
      where: { id: dto.jobId },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${dto.jobId} not found`);
    }

    // Check if talent exists
    const talent = await this.prisma.talent.findUnique({
      where: { id: dto.talentId },
    });

    if (!talent) {
      throw new NotFoundException(`Talent with ID ${dto.talentId} not found`);
    }

    // Check if application already exists
    const existing = await this.prisma.application.findUnique({
      where: {
        jobId_talentId: {
          jobId: dto.jobId,
          talentId: dto.talentId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Application already exists for this job and talent');
    }

    // Create application
    return this.prisma.application.create({
      data: {
        jobId: dto.jobId,
        talentId: dto.talentId,
        matchScore: dto.matchScore,
        matchBreakdown: dto.matchBreakdown,
        status: 'NEW',
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        talent: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });
  }

  async findByJob(jobId: string, query: ApplicationQueryDto = {}) {
    // Verify job exists
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    const { page = 1, limit = 20, status, minMatchScore, sortBy = 'matchScore', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ApplicationWhereInput = {
      jobId,
    };

    if (status) {
      where.status = status as any;
    }

    if (minMatchScore !== undefined) {
      where.matchScore = {
        gte: minMatchScore,
      };
    }

    // Build orderBy
    const orderBy: Prisma.ApplicationOrderByWithRelationInput = {};
    if (sortBy === 'matchScore') {
      orderBy.matchScore = sortOrder;
    } else if (sortBy === 'appliedAt') {
      orderBy.appliedAt = sortOrder;
    } else {
      orderBy.updatedAt = sortOrder;
    }

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          talent: {
            select: {
              id: true,
              name: true,
              telegramId: true,
              serviceCategory: true,
              skills: true,
              experienceLevel: true,
              yearsOfExperience: true,
              bio: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.application.count({ where }),
    ]);

    return {
      data: applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async findByTalent(talentId: string, query: ApplicationQueryDto = {}) {
    // Verify talent exists
    const talent = await this.prisma.talent.findUnique({
      where: { id: talentId },
    });

    if (!talent) {
      throw new NotFoundException(`Talent with ID ${talentId} not found`);
    }

    const { page = 1, limit = 20, status, sortBy = 'appliedAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ApplicationWhereInput = {
      talentId,
    };

    if (status) {
      where.status = status as any;
    }

    const orderBy: Prisma.ApplicationOrderByWithRelationInput = {};
    if (sortBy === 'matchScore') {
      orderBy.matchScore = sortOrder;
    } else if (sortBy === 'appliedAt') {
      orderBy.appliedAt = sortOrder;
    } else {
      orderBy.updatedAt = sortOrder;
    }

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              description: true,
              serviceCategory: true,
              requiredSkills: true,
              experienceLevel: true,
              engagementType: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.application.count({ where }),
    ]);

    return {
      data: applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            description: true,
            serviceCategory: true,
            requiredSkills: true,
            experienceLevel: true,
            engagementType: true,
            status: true,
            createdAt: true,
          },
        },
        talent: {
          select: {
            id: true,
            name: true,
            telegramId: true,
            serviceCategory: true,
            skills: true,
            experienceLevel: true,
            yearsOfExperience: true,
            bio: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    return application;
  }

  async shortlist(applicationId: string, adminId?: string, dto?: ApplicationActionDto) {
    const application = await this.findOne(applicationId);

    if (application.status === 'SHORTLISTED') {
      throw new ConflictException('Application is already shortlisted');
    }

    if (application.status === 'HIRED') {
      throw new ConflictException('Cannot shortlist a hired application');
    }

    if (application.status === 'REJECTED') {
      throw new ConflictException('Cannot shortlist a rejected application');
    }

    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        status: 'SHORTLISTED',
        shortlistedAt: new Date(),
        notes: dto?.notes,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
          },
        },
        talent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Create audit log if adminId provided
    if (adminId) {
      await this.prisma.auditLog.create({
        data: {
          adminId,
          action: 'SHORTLIST_APPLICATION',
          resourceType: 'APPLICATION',
          resourceId: applicationId,
          metadata: {
            jobId: application.jobId,
            talentId: application.talentId,
            notes: dto?.notes,
          },
        },
      });
    }

    return updated;
  }

  async hire(applicationId: string, adminId?: string, dto?: ApplicationActionDto) {
    const application = await this.findOne(applicationId);

    if (application.status === 'HIRED') {
      throw new ConflictException('Application is already marked as hired');
    }

    if (application.status === 'REJECTED') {
      throw new ConflictException('Cannot hire a rejected application');
    }

    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        status: 'HIRED',
        hiredAt: new Date(),
        notes: dto?.notes,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
          },
        },
        talent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Update talent status to HIRED
    await this.prisma.talent.update({
      where: { id: application.talentId },
      data: { status: 'HIRED' },
    });

    // Create audit log if adminId provided
    if (adminId) {
      await this.prisma.auditLog.create({
        data: {
          adminId,
          action: 'HIRE_APPLICATION',
          resourceType: 'APPLICATION',
          resourceId: applicationId,
          metadata: {
            jobId: application.jobId,
            talentId: application.talentId,
            notes: dto?.notes,
          },
        },
      });
    }

    return updated;
  }

  async reject(applicationId: string, adminId?: string, dto?: ApplicationActionDto) {
    const application = await this.findOne(applicationId);

    if (application.status === 'REJECTED') {
      throw new ConflictException('Application is already rejected');
    }

    if (application.status === 'HIRED') {
      throw new ConflictException('Cannot reject a hired application');
    }

    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        notes: dto?.reason || dto?.notes,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
          },
        },
        talent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Create audit log if adminId provided
    if (adminId) {
      await this.prisma.auditLog.create({
        data: {
          adminId,
          action: 'REJECT_APPLICATION',
          resourceType: 'APPLICATION',
          resourceId: applicationId,
          metadata: {
            jobId: application.jobId,
            talentId: application.talentId,
            reason: dto?.reason || dto?.notes,
          },
        },
      });
    }

    return updated;
  }

  async updateMatchScore(applicationId: string, matchScore: number, matchBreakdown?: any) {
    if (matchScore < 0 || matchScore > 100) {
      throw new BadRequestException('Match score must be between 0 and 100');
    }

    await this.findOne(applicationId); // Verify application exists

    return this.prisma.application.update({
      where: { id: applicationId },
      data: {
        matchScore,
        matchBreakdown,
      },
    });
  }
}


