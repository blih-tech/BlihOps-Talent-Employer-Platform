import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobQueryDto } from './dto/job-query.dto';
import { ServiceCategory, ExperienceLevel, EngagementType } from '@blihops/shared';

describe('JobsService', () => {
  let service: JobsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    job: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    prisma = module.get<PrismaService>(PrismaService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateJobDto = {
      title: 'Senior Full-Stack Developer',
      description: 'We are looking for an experienced full-stack developer with strong TypeScript and React skills.',
      serviceCategory: ServiceCategory.ITO,
      requiredSkills: ['TypeScript', 'NestJS', 'PostgreSQL', 'React'],
      experienceLevel: ExperienceLevel.SENIOR,
      engagementType: EngagementType.FULL_TIME,
      duration: '6 months',
      budget: '$5000 - $7000/month',
    };

    const adminId = 'admin-id-1';

    it('should create a job successfully', async () => {
      const expectedJob = {
        id: 'job-id-1',
        ...createDto,
        status: 'PENDING',
        createdById: adminId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.job.create.mockResolvedValue(expectedJob);

      const result = await service.create(createDto, adminId);

      expect(result).toEqual(expectedJob);
      expect(mockPrismaService.job.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          status: 'PENDING',
          createdById: adminId,
        },
      });
    });

    it('should create a job with minimal required fields', async () => {
      const minimalDto: CreateJobDto = {
        title: 'Developer',
        description: 'Looking for a developer',
        serviceCategory: ServiceCategory.ITO,
        requiredSkills: ['JavaScript'],
        experienceLevel: ExperienceLevel.JUNIOR,
        engagementType: EngagementType.FULL_TIME,
      };

      const expectedJob = {
        id: 'job-id-2',
        ...minimalDto,
        status: 'PENDING',
        createdById: adminId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.job.create.mockResolvedValue(expectedJob);

      const result = await service.create(minimalDto, adminId);

      expect(result).toEqual(expectedJob);
      expect(mockPrismaService.job.create).toHaveBeenCalledWith({
        data: {
          ...minimalDto,
          status: 'PENDING',
          createdById: adminId,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated jobs', async () => {
      const query: JobQueryDto = { page: 1, limit: 10 };
      const mockJobs = [
        { id: 'job-1', title: 'Job 1', createdBy: { id: 'admin-1', name: 'Admin 1' } },
        { id: 'job-2', title: 'Job 2', createdBy: { id: 'admin-1', name: 'Admin 1' } },
      ];

      mockPrismaService.job.findMany.mockResolvedValue(mockJobs);
      mockPrismaService.job.count.mockResolvedValue(2);

      const result = await service.findAll(query);

      expect(result.data).toEqual(mockJobs);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.totalPages).toBe(1);
      expect(mockPrismaService.job.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        include: { createdBy: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by status', async () => {
      const query: JobQueryDto = { status: 'PENDING' as any };
      mockPrismaService.job.findMany.mockResolvedValue([]);
      mockPrismaService.job.count.mockResolvedValue(0);

      await service.findAll(query);

      expect(mockPrismaService.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'PENDING',
          }),
        }),
      );
    });

    it('should filter by serviceCategory', async () => {
      const query: JobQueryDto = { serviceCategory: ServiceCategory.ITO };
      mockPrismaService.job.findMany.mockResolvedValue([]);
      mockPrismaService.job.count.mockResolvedValue(0);

      await service.findAll(query);

      expect(mockPrismaService.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            serviceCategory: ServiceCategory.ITO,
          }),
        }),
      );
    });

    it('should handle pagination correctly', async () => {
      const query: JobQueryDto = { page: 2, limit: 5 };
      mockPrismaService.job.findMany.mockResolvedValue([]);
      mockPrismaService.job.count.mockResolvedValue(10);

      const result = await service.findAll(query);

      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(5);
      expect(result.meta.totalPages).toBe(2);
      expect(mockPrismaService.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a job by id', async () => {
      const mockJob = {
        id: 'job-id',
        title: 'Test Job',
        createdBy: { id: 'admin-1', name: 'Admin' },
        applications: [],
      };

      mockPrismaService.job.findUnique.mockResolvedValue(mockJob);

      const result = await service.findOne('job-id');

      expect(result).toEqual(mockJob);
      expect(mockPrismaService.job.findUnique).toHaveBeenCalledWith({
        where: { id: 'job-id' },
        include: {
          createdBy: true,
          applications: {
            include: { talent: true },
            orderBy: { matchScore: 'desc' },
          },
        },
      });
    });

    it('should throw NotFoundException if job not found', async () => {
      mockPrismaService.job.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('non-existent-id')).rejects.toThrow('Job with ID non-existent-id not found');
    });
  });

  describe('update', () => {
    it('should update a job successfully', async () => {
      const updateDto: UpdateJobDto = {
        title: 'Updated Job Title',
        description: 'Updated description',
      };

      const existingJob = { id: 'job-id', title: 'Original Title' };
      const updatedJob = { ...existingJob, ...updateDto };

      mockPrismaService.job.update.mockResolvedValue(updatedJob);

      const result = await service.update('job-id', updateDto);

      expect(result).toEqual(updatedJob);
      expect(mockPrismaService.job.update).toHaveBeenCalledWith({
        where: { id: 'job-id' },
        data: updateDto,
      });
    });
  });

  describe('publish', () => {
    const adminId = 'admin-id-1';

    it('should publish a pending job and create audit log', async () => {
      const job = {
        id: 'job-id',
        title: 'Test Job',
        status: 'PENDING',
        createdBy: { id: 'admin-1' },
        applications: [],
      };

      const publishedJob = {
        ...job,
        status: 'PUBLISHED',
        publishedAt: new Date(),
      };

      mockPrismaService.job.findUnique.mockResolvedValue(job);
      mockPrismaService.job.update.mockResolvedValue(publishedJob);
      mockPrismaService.auditLog.create.mockResolvedValue({ id: 'audit-id' });

      const result = await service.publish('job-id', adminId);

      expect(result.status).toBe('PUBLISHED');
      expect(result.publishedAt).toBeDefined();
      expect(mockPrismaService.job.update).toHaveBeenCalledWith({
        where: { id: 'job-id' },
        data: {
          status: 'PUBLISHED',
          publishedAt: expect.any(Date),
        },
      });
      expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith({
        data: {
          adminId,
          action: 'PUBLISH_JOB',
          resourceType: 'JOB',
          resourceId: 'job-id',
          metadata: { jobTitle: job.title },
        },
      });
    });

    it('should throw BadRequestException if job is not in PENDING status', async () => {
      const job = {
        id: 'job-id',
        title: 'Test Job',
        status: 'PUBLISHED',
        createdBy: { id: 'admin-1' },
        applications: [],
      };

      mockPrismaService.job.findUnique.mockResolvedValue(job);

      await expect(service.publish('job-id', adminId)).rejects.toThrow(BadRequestException);
      await expect(service.publish('job-id', adminId)).rejects.toThrow('Job must be in PENDING status to publish');
      expect(mockPrismaService.job.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if job not found', async () => {
      mockPrismaService.job.findUnique.mockResolvedValue(null);

      await expect(service.publish('non-existent-id', adminId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('reject', () => {
    const adminId = 'admin-id-1';

    it('should reject a pending job and create audit log', async () => {
      const job = {
        id: 'job-id',
        title: 'Test Job',
        status: 'PENDING',
        createdBy: { id: 'admin-1' },
        applications: [],
      };

      const rejectedJob = {
        ...job,
        status: 'REJECTED',
      };

      const reason = 'Does not meet requirements';

      mockPrismaService.job.findUnique.mockResolvedValue(job);
      mockPrismaService.job.update.mockResolvedValue(rejectedJob);
      mockPrismaService.auditLog.create.mockResolvedValue({ id: 'audit-id' });

      const result = await service.reject('job-id', adminId, reason);

      expect(result.status).toBe('REJECTED');
      expect(mockPrismaService.job.update).toHaveBeenCalledWith({
        where: { id: 'job-id' },
        data: { status: 'REJECTED' },
      });
      expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith({
        data: {
          adminId,
          action: 'REJECT_JOB',
          resourceType: 'JOB',
          resourceId: 'job-id',
          metadata: { jobTitle: job.title, reason },
        },
      });
    });

    it('should reject a job without reason', async () => {
      const job = {
        id: 'job-id',
        title: 'Test Job',
        status: 'PENDING',
        createdBy: { id: 'admin-1' },
        applications: [],
      };

      mockPrismaService.job.findUnique.mockResolvedValue(job);
      mockPrismaService.job.update.mockResolvedValue({ ...job, status: 'REJECTED' });
      mockPrismaService.auditLog.create.mockResolvedValue({ id: 'audit-id' });

      await service.reject('job-id', adminId);

      expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          metadata: expect.objectContaining({
            jobTitle: job.title,
            reason: undefined,
          }),
        }),
      });
    });

    it('should throw BadRequestException if job is not in PENDING status', async () => {
      const job = {
        id: 'job-id',
        title: 'Test Job',
        status: 'PUBLISHED',
        createdBy: { id: 'admin-1' },
        applications: [],
      };

      mockPrismaService.job.findUnique.mockResolvedValue(job);

      await expect(service.reject('job-id', adminId)).rejects.toThrow(BadRequestException);
      await expect(service.reject('job-id', adminId)).rejects.toThrow('Job must be in PENDING status to reject');
      expect(mockPrismaService.job.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if job not found', async () => {
      mockPrismaService.job.findUnique.mockResolvedValue(null);

      await expect(service.reject('non-existent-id', adminId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('close', () => {
    const adminId = 'admin-id-1';

    it('should close a published job and create audit log', async () => {
      const job = {
        id: 'job-id',
        title: 'Test Job',
        status: 'PUBLISHED',
        createdBy: { id: 'admin-1' },
        applications: [],
      };

      const closedJob = {
        ...job,
        status: 'CLOSED',
        closedAt: new Date(),
      };

      mockPrismaService.job.findUnique.mockResolvedValue(job);
      mockPrismaService.job.update.mockResolvedValue(closedJob);
      mockPrismaService.auditLog.create.mockResolvedValue({ id: 'audit-id' });

      const result = await service.close('job-id', adminId);

      expect(result.status).toBe('CLOSED');
      expect(result.closedAt).toBeDefined();
      expect(mockPrismaService.job.update).toHaveBeenCalledWith({
        where: { id: 'job-id' },
        data: {
          status: 'CLOSED',
          closedAt: expect.any(Date),
        },
      });
      expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith({
        data: {
          adminId,
          action: 'CLOSE_JOB',
          resourceType: 'JOB',
          resourceId: 'job-id',
          metadata: { jobTitle: job.title },
        },
      });
    });

    it('should throw BadRequestException if job is not PUBLISHED', async () => {
      const job = {
        id: 'job-id',
        title: 'Test Job',
        status: 'PENDING',
        createdBy: { id: 'admin-1' },
        applications: [],
      };

      mockPrismaService.job.findUnique.mockResolvedValue(job);

      await expect(service.close('job-id', adminId)).rejects.toThrow(BadRequestException);
      await expect(service.close('job-id', adminId)).rejects.toThrow('Only published jobs can be closed');
      expect(mockPrismaService.job.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if job not found', async () => {
      mockPrismaService.job.findUnique.mockResolvedValue(null);

      await expect(service.close('non-existent-id', adminId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('archive', () => {
    const adminId = 'admin-id-1';

    it('should archive a closed job and create audit log', async () => {
      const job = {
        id: 'job-id',
        title: 'Test Job',
        status: 'CLOSED',
        createdBy: { id: 'admin-1' },
        applications: [],
      };

      const archivedJob = {
        ...job,
        status: 'ARCHIVED',
      };

      mockPrismaService.job.findUnique.mockResolvedValue(job);
      mockPrismaService.job.update.mockResolvedValue(archivedJob);
      mockPrismaService.auditLog.create.mockResolvedValue({ id: 'audit-id' });

      const result = await service.archive('job-id', adminId);

      expect(result.status).toBe('ARCHIVED');
      expect(mockPrismaService.job.update).toHaveBeenCalledWith({
        where: { id: 'job-id' },
        data: { status: 'ARCHIVED' },
      });
      expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith({
        data: {
          adminId,
          action: 'ARCHIVE_JOB',
          resourceType: 'JOB',
          resourceId: 'job-id',
          metadata: { jobTitle: job.title },
        },
      });
    });

    it('should throw BadRequestException if job is not CLOSED', async () => {
      const job = {
        id: 'job-id',
        title: 'Test Job',
        status: 'PUBLISHED',
        createdBy: { id: 'admin-1' },
        applications: [],
      };

      mockPrismaService.job.findUnique.mockResolvedValue(job);

      await expect(service.archive('job-id', adminId)).rejects.toThrow(BadRequestException);
      await expect(service.archive('job-id', adminId)).rejects.toThrow('Only closed jobs can be archived');
      expect(mockPrismaService.job.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if job not found', async () => {
      mockPrismaService.job.findUnique.mockResolvedValue(null);

      await expect(service.archive('non-existent-id', adminId)).rejects.toThrow(NotFoundException);
    });
  });
});


