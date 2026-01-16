import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AdminService', () => {
  let service: AdminService;
  let prisma: PrismaService;

  const mockPrismaService = {
    talent: {
      count: jest.fn(),
    },
    job: {
      count: jest.fn(),
    },
    application: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    prisma = module.get<PrismaService>(PrismaService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStatistics', () => {
    it('should return accurate statistics', async () => {
      mockPrismaService.talent.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(20) // pending
        .mockResolvedValueOnce(70); // approved
      mockPrismaService.job.count
        .mockResolvedValueOnce(50) // total
        .mockResolvedValueOnce(10) // pending
        .mockResolvedValueOnce(30); // published
      mockPrismaService.application.count.mockResolvedValueOnce(200); // total

      const result = await service.getStatistics();

      expect(result).toEqual({
        talents: {
          total: 100,
          pending: 20,
          approved: 70,
        },
        jobs: {
          total: 50,
          pending: 10,
          published: 30,
        },
        applications: {
          total: 200,
        },
      });

      expect(mockPrismaService.talent.count).toHaveBeenCalledTimes(3);
      expect(mockPrismaService.job.count).toHaveBeenCalledTimes(3);
      expect(mockPrismaService.application.count).toHaveBeenCalledTimes(1);
    });

    it('should handle zero counts correctly', async () => {
      mockPrismaService.talent.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      mockPrismaService.job.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      mockPrismaService.application.count.mockResolvedValueOnce(0);

      const result = await service.getStatistics();

      expect(result).toEqual({
        talents: {
          total: 0,
          pending: 0,
          approved: 0,
        },
        jobs: {
          total: 0,
          pending: 0,
          published: 0,
        },
        applications: {
          total: 0,
        },
      });
    });
  });

  describe('getAnalytics', () => {
    it('should calculate conversion rates correctly', async () => {
      mockPrismaService.talent.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(70); // approved
      mockPrismaService.job.count
        .mockResolvedValueOnce(50) // total
        .mockResolvedValueOnce(30); // published
      mockPrismaService.application.count
        .mockResolvedValueOnce(200) // total
        .mockResolvedValueOnce(40); // hired

      const result = await service.getAnalytics();

      expect(result.conversionRates).toEqual({
        talentApprovalRate: 70, // 70/100 * 100 = 70
        jobPublishRate: 60, // 30/50 * 100 = 60
        applicationHireRate: 20, // 40/200 * 100 = 20
      });
    });

    it('should handle zero totals correctly (avoid division by zero)', async () => {
      mockPrismaService.talent.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      mockPrismaService.job.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      mockPrismaService.application.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      const result = await service.getAnalytics();

      expect(result.conversionRates).toEqual({
        talentApprovalRate: 0,
        jobPublishRate: 0,
        applicationHireRate: 0,
      });
    });

    it('should round conversion rates to 2 decimal places', async () => {
      mockPrismaService.talent.count
        .mockResolvedValueOnce(3) // total
        .mockResolvedValueOnce(1); // approved = 33.333...
      mockPrismaService.job.count
        .mockResolvedValueOnce(3) // total
        .mockResolvedValueOnce(1); // published = 33.333...
      mockPrismaService.application.count
        .mockResolvedValueOnce(3) // total
        .mockResolvedValueOnce(1); // hired = 33.333...

      const result = await service.getAnalytics();

      expect(result.conversionRates.talentApprovalRate).toBe(33.33);
      expect(result.conversionRates.jobPublishRate).toBe(33.33);
      expect(result.conversionRates.applicationHireRate).toBe(33.33);
    });
  });

  describe('getKeyMetrics', () => {
    it('should return recent activity metrics for last 7 days', async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      mockPrismaService.talent.count.mockResolvedValueOnce(15);
      mockPrismaService.job.count.mockResolvedValueOnce(8);
      mockPrismaService.application.count.mockResolvedValueOnce(25);

      const result = await service.getKeyMetrics();

      expect(result).toEqual({
        recentActivity: {
          newTalents: 15,
          newJobs: 8,
          newApplications: 25,
        },
      });

      // Verify the date filter is applied correctly
      expect(mockPrismaService.talent.count).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: expect.any(Date),
          },
        },
      });
      expect(mockPrismaService.job.count).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: expect.any(Date),
          },
        },
      });
      expect(mockPrismaService.application.count).toHaveBeenCalledWith({
        where: {
          appliedAt: {
            gte: expect.any(Date),
          },
        },
      });
    });

    it('should handle zero recent activity correctly', async () => {
      mockPrismaService.talent.count.mockResolvedValueOnce(0);
      mockPrismaService.job.count.mockResolvedValueOnce(0);
      mockPrismaService.application.count.mockResolvedValueOnce(0);

      const result = await service.getKeyMetrics();

      expect(result).toEqual({
        recentActivity: {
          newTalents: 0,
          newJobs: 0,
          newApplications: 0,
        },
      });
    });
  });
});



