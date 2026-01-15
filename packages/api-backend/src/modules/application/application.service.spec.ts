import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateApplicationDto, ApplicationQueryDto, ApplicationActionDto } from './dto';

describe('ApplicationService', () => {
  let service: ApplicationService;
  let prisma: PrismaService;

  const mockPrismaService = {
    application: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    job: {
      findUnique: jest.fn(),
    },
    talent: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ApplicationService>(ApplicationService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateApplicationDto = {
      jobId: 'job-id',
      talentId: 'talent-id',
      matchScore: 85.5,
      matchBreakdown: { skills: 90, experience: 80 },
    };

    const mockJob = { id: 'job-id', title: 'Test Job' };
    const mockTalent = { id: 'talent-id', name: 'Test Talent' };

    it('should create an application successfully', async () => {
      mockPrismaService.job.findUnique.mockResolvedValue(mockJob);
      mockPrismaService.talent.findUnique.mockResolvedValue(mockTalent);
      mockPrismaService.application.findUnique.mockResolvedValue(null);
      mockPrismaService.application.create.mockResolvedValue({
        id: 'app-id',
        ...createDto,
        status: 'NEW',
      });

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.application.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if job not found', async () => {
      mockPrismaService.job.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.application.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if talent not found', async () => {
      mockPrismaService.job.findUnique.mockResolvedValue(mockJob);
      mockPrismaService.talent.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.application.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if application already exists', async () => {
      mockPrismaService.job.findUnique.mockResolvedValue(mockJob);
      mockPrismaService.talent.findUnique.mockResolvedValue(mockTalent);
      mockPrismaService.application.findUnique.mockResolvedValue({
        id: 'existing-app-id',
      });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(mockPrismaService.application.create).not.toHaveBeenCalled();
    });
  });

  describe('findByJob', () => {
    const jobId = 'job-id';
    const query: ApplicationQueryDto = { page: 1, limit: 10 };

    it('should return paginated applications for a job', async () => {
      const mockApplications = [
        { id: 'app-1', jobId, matchScore: 90 },
        { id: 'app-2', jobId, matchScore: 85 },
      ];

      mockPrismaService.job.findUnique.mockResolvedValue({ id: jobId });
      mockPrismaService.application.findMany.mockResolvedValue(mockApplications);
      mockPrismaService.application.count.mockResolvedValue(2);

      const result = await service.findByJob(jobId, query);

      expect(result.data).toEqual(mockApplications);
      expect(result.pagination.total).toBe(2);
      expect(mockPrismaService.application.findMany).toHaveBeenCalled();
    });

    it('should filter by status', async () => {
      const queryWithStatus: ApplicationQueryDto = { status: 'SHORTLISTED' as any };
      mockPrismaService.job.findUnique.mockResolvedValue({ id: jobId });
      mockPrismaService.application.findMany.mockResolvedValue([]);
      mockPrismaService.application.count.mockResolvedValue(0);

      await service.findByJob(jobId, queryWithStatus);

      expect(mockPrismaService.application.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'SHORTLISTED',
          }),
        }),
      );
    });

    it('should filter by minimum match score', async () => {
      const queryWithScore: ApplicationQueryDto = { minMatchScore: 70 };
      mockPrismaService.job.findUnique.mockResolvedValue({ id: jobId });
      mockPrismaService.application.findMany.mockResolvedValue([]);
      mockPrismaService.application.count.mockResolvedValue(0);

      await service.findByJob(jobId, queryWithScore);

      expect(mockPrismaService.application.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            matchScore: { gte: 70 },
          }),
        }),
      );
    });

    it('should throw NotFoundException if job not found', async () => {
      mockPrismaService.job.findUnique.mockResolvedValue(null);

      await expect(service.findByJob(jobId, query)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByTalent', () => {
    const talentId = 'talent-id';
    const query: ApplicationQueryDto = { page: 1, limit: 10 };

    it('should return paginated applications for a talent', async () => {
      const mockApplications = [
        { id: 'app-1', talentId },
        { id: 'app-2', talentId },
      ];

      mockPrismaService.talent.findUnique.mockResolvedValue({ id: talentId });
      mockPrismaService.application.findMany.mockResolvedValue(mockApplications);
      mockPrismaService.application.count.mockResolvedValue(2);

      const result = await service.findByTalent(talentId, query);

      expect(result.data).toEqual(mockApplications);
      expect(result.pagination.total).toBe(2);
    });

    it('should throw NotFoundException if talent not found', async () => {
      mockPrismaService.talent.findUnique.mockResolvedValue(null);

      await expect(service.findByTalent(talentId, query)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return an application by id', async () => {
      const mockApplication = {
        id: 'app-id',
        jobId: 'job-id',
        talentId: 'talent-id',
        status: 'NEW',
      };

      mockPrismaService.application.findUnique.mockResolvedValue(mockApplication);

      const result = await service.findOne('app-id');

      expect(result).toEqual(mockApplication);
      expect(mockPrismaService.application.findUnique).toHaveBeenCalledWith({
        where: { id: 'app-id' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if application not found', async () => {
      mockPrismaService.application.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('shortlist', () => {
    const applicationId = 'app-id';
    const adminId = 'admin-id';
    const dto: ApplicationActionDto = { notes: 'Good candidate' };

    it('should shortlist an application and create audit log', async () => {
      const mockApplication = {
        id: applicationId,
        jobId: 'job-id',
        talentId: 'talent-id',
        status: 'NEW',
      };

      const updatedApplication = {
        ...mockApplication,
        status: 'SHORTLISTED',
        shortlistedAt: new Date(),
        notes: dto.notes,
      };

      mockPrismaService.application.findUnique.mockResolvedValue(mockApplication);
      mockPrismaService.application.update.mockResolvedValue(updatedApplication);
      mockPrismaService.auditLog.create.mockResolvedValue({ id: 'audit-id' });

      const result = await service.shortlist(applicationId, adminId, dto);

      expect(result.status).toBe('SHORTLISTED');
      expect(mockPrismaService.application.update).toHaveBeenCalled();
      expect(mockPrismaService.auditLog.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if already shortlisted', async () => {
      const mockApplication = {
        id: applicationId,
        status: 'SHORTLISTED',
      };

      mockPrismaService.application.findUnique.mockResolvedValue(mockApplication);

      await expect(service.shortlist(applicationId, adminId)).rejects.toThrow(ConflictException);
      expect(mockPrismaService.application.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if already hired', async () => {
      const mockApplication = {
        id: applicationId,
        status: 'HIRED',
      };

      mockPrismaService.application.findUnique.mockResolvedValue(mockApplication);

      await expect(service.shortlist(applicationId, adminId)).rejects.toThrow(ConflictException);
    });

    it('should not create audit log if adminId not provided', async () => {
      const mockApplication = {
        id: applicationId,
        status: 'NEW',
      };

      mockPrismaService.application.findUnique.mockResolvedValue(mockApplication);
      mockPrismaService.application.update.mockResolvedValue({
        ...mockApplication,
        status: 'SHORTLISTED',
      });

      await service.shortlist(applicationId);

      expect(mockPrismaService.auditLog.create).not.toHaveBeenCalled();
    });
  });

  describe('hire', () => {
    const applicationId = 'app-id';
    const adminId = 'admin-id';
    const dto: ApplicationActionDto = { notes: 'Hired for the position' };

    it('should hire an application and update talent status', async () => {
      const mockApplication = {
        id: applicationId,
        jobId: 'job-id',
        talentId: 'talent-id',
        status: 'SHORTLISTED',
      };

      const updatedApplication = {
        ...mockApplication,
        status: 'HIRED',
        hiredAt: new Date(),
      };

      mockPrismaService.application.findUnique.mockResolvedValue(mockApplication);
      mockPrismaService.application.update.mockResolvedValue(updatedApplication);
      mockPrismaService.talent.update.mockResolvedValue({ id: 'talent-id', status: 'HIRED' });
      mockPrismaService.auditLog.create.mockResolvedValue({ id: 'audit-id' });

      const result = await service.hire(applicationId, adminId, dto);

      expect(result.status).toBe('HIRED');
      expect(mockPrismaService.talent.update).toHaveBeenCalledWith({
        where: { id: 'talent-id' },
        data: { status: 'HIRED' },
      });
      expect(mockPrismaService.auditLog.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if already hired', async () => {
      const mockApplication = {
        id: applicationId,
        status: 'HIRED',
      };

      mockPrismaService.application.findUnique.mockResolvedValue(mockApplication);

      await expect(service.hire(applicationId, adminId)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if already rejected', async () => {
      const mockApplication = {
        id: applicationId,
        status: 'REJECTED',
      };

      mockPrismaService.application.findUnique.mockResolvedValue(mockApplication);

      await expect(service.hire(applicationId, adminId)).rejects.toThrow(ConflictException);
    });
  });

  describe('reject', () => {
    const applicationId = 'app-id';
    const adminId = 'admin-id';
    const dto: ApplicationActionDto = { reason: 'Not a good fit' };

    it('should reject an application and create audit log', async () => {
      const mockApplication = {
        id: applicationId,
        jobId: 'job-id',
        talentId: 'talent-id',
        status: 'NEW',
      };

      const updatedApplication = {
        ...mockApplication,
        status: 'REJECTED',
        rejectedAt: new Date(),
        notes: dto.reason,
      };

      mockPrismaService.application.findUnique.mockResolvedValue(mockApplication);
      mockPrismaService.application.update.mockResolvedValue(updatedApplication);
      mockPrismaService.auditLog.create.mockResolvedValue({ id: 'audit-id' });

      const result = await service.reject(applicationId, adminId, dto);

      expect(result.status).toBe('REJECTED');
      expect(mockPrismaService.application.update).toHaveBeenCalled();
      expect(mockPrismaService.auditLog.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if already rejected', async () => {
      const mockApplication = {
        id: applicationId,
        status: 'REJECTED',
      };

      mockPrismaService.application.findUnique.mockResolvedValue(mockApplication);

      await expect(service.reject(applicationId, adminId)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if already hired', async () => {
      const mockApplication = {
        id: applicationId,
        status: 'HIRED',
      };

      mockPrismaService.application.findUnique.mockResolvedValue(mockApplication);

      await expect(service.reject(applicationId, adminId)).rejects.toThrow(ConflictException);
    });
  });

  describe('updateMatchScore', () => {
    it('should update match score successfully', async () => {
      const applicationId = 'app-id';
      const mockApplication = { id: applicationId };
      const matchScore = 92.5;
      const matchBreakdown = { skills: 95, experience: 90 };

      mockPrismaService.application.findUnique.mockResolvedValue(mockApplication);
      mockPrismaService.application.update.mockResolvedValue({
        ...mockApplication,
        matchScore,
        matchBreakdown,
      });

      const result = await service.updateMatchScore(applicationId, matchScore, matchBreakdown);

      expect(result.matchScore).toBe(matchScore);
      expect(mockPrismaService.application.update).toHaveBeenCalled();
    });

    it('should throw BadRequestException if match score out of range', async () => {
      await expect(service.updateMatchScore('app-id', 150)).rejects.toThrow(BadRequestException);
      await expect(service.updateMatchScore('app-id', -10)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if application not found', async () => {
      mockPrismaService.application.findUnique.mockResolvedValue(null);

      await expect(service.updateMatchScore('non-existent-id', 85)).rejects.toThrow(NotFoundException);
    });
  });
});


