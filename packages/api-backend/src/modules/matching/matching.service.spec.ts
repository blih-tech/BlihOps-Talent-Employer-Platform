import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('MatchingService', () => {
  let service: MatchingService;
  let prismaService: jest.Mocked<PrismaService>;
  let redisClient: any;

  const mockRedisClient = {
    get: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
  };

  const mockPrismaService = {
    job: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    talent: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: 'IORedisModuleConnectionToken',
          useValue: mockRedisClient,
        },
      ],
    }).compile();

    service = module.get<MatchingService>(MatchingService);
    prismaService = module.get(PrismaService);
    redisClient = module.get('IORedisModuleConnectionToken');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findMatchingTalentsForJob', () => {
    const mockJob = {
      id: 'job-1',
      title: 'Senior Developer',
      serviceCategory: 'WEB_DEVELOPMENT',
      requiredSkills: ['JavaScript', 'TypeScript', 'React'],
      experienceLevel: 'SENIOR',
      status: 'PUBLISHED',
    };

    const mockTalents = [
      {
        id: 'talent-1',
        name: 'John Doe',
        serviceCategory: 'WEB_DEVELOPMENT',
        skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
        experienceLevel: 'SENIOR',
        status: 'APPROVED',
      },
      {
        id: 'talent-2',
        name: 'Jane Smith',
        serviceCategory: 'WEB_DEVELOPMENT',
        skills: ['JavaScript', 'Vue'],
        experienceLevel: 'INTERMEDIATE',
        status: 'APPROVED',
      },
      {
        id: 'talent-3',
        name: 'Bob Wilson',
        serviceCategory: 'MOBILE_DEVELOPMENT',
        skills: ['React Native', 'Swift'],
        experienceLevel: 'SENIOR',
        status: 'APPROVED',
      },
    ];

    it('should return cached results if available', async () => {
      const cachedResults = [
        {
          talent: mockTalents[0],
          score: 90,
          breakdown: {
            serviceCategory: 30,
            skillOverlap: 40,
            experienceLevel: 20,
            availability: 10,
          },
        },
      ];

      redisClient.get.mockResolvedValue(JSON.stringify(cachedResults));
      prismaService.job.findUnique.mockResolvedValue(mockJob);

      const result = await service.findMatchingTalentsForJob('job-1');

      expect(result).toEqual(cachedResults);
      expect(redisClient.get).toHaveBeenCalledWith('matches:job:job-1');
      expect(prismaService.job.findUnique).not.toHaveBeenCalled();
    });

    it('should calculate matches when cache is empty', async () => {
      redisClient.get.mockResolvedValue(null);
      prismaService.job.findUnique.mockResolvedValue(mockJob);
      prismaService.talent.findMany.mockResolvedValue(mockTalents);
      redisClient.setex.mockResolvedValue('OK');

      const result = await service.findMatchingTalentsForJob('job-1');

      expect(result).toHaveLength(2); // Only talents with score >= 50
      expect(result[0].score).toBeGreaterThanOrEqual(50);
      expect(result[0].talent.id).toBe('talent-1'); // Should be sorted by score
      expect(redisClient.setex).toHaveBeenCalledWith(
        'matches:job:job-1',
        300,
        expect.any(String),
      );
    });

    it('should throw NotFoundException if job does not exist', async () => {
      redisClient.get.mockResolvedValue(null);
      prismaService.job.findUnique.mockResolvedValue(null);

      await expect(
        service.findMatchingTalentsForJob('non-existent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should filter out matches with score < 50', async () => {
      redisClient.get.mockResolvedValue(null);
      prismaService.job.findUnique.mockResolvedValue(mockJob);
      prismaService.talent.findMany.mockResolvedValue(mockTalents);
      redisClient.setex.mockResolvedValue('OK');

      const result = await service.findMatchingTalentsForJob('job-1');

      result.forEach((match) => {
        expect(match.score).toBeGreaterThanOrEqual(50);
      });
    });
  });

  describe('findMatchingJobsForTalent', () => {
    const mockTalent = {
      id: 'talent-1',
      name: 'John Doe',
      serviceCategory: 'WEB_DEVELOPMENT',
      skills: ['JavaScript', 'TypeScript', 'React'],
      experienceLevel: 'SENIOR',
      status: 'APPROVED',
    };

    const mockJobs = [
      {
        id: 'job-1',
        title: 'Senior Developer',
        serviceCategory: 'WEB_DEVELOPMENT',
        requiredSkills: ['JavaScript', 'TypeScript', 'React'],
        experienceLevel: 'SENIOR',
        status: 'PUBLISHED',
      },
      {
        id: 'job-2',
        title: 'Junior Developer',
        serviceCategory: 'WEB_DEVELOPMENT',
        requiredSkills: ['JavaScript'],
        experienceLevel: 'ENTRY',
        status: 'PUBLISHED',
      },
    ];

    it('should return cached results if available', async () => {
      const cachedResults = [
        {
          job: mockJobs[0],
          score: 90,
          breakdown: {
            serviceCategory: 30,
            skillOverlap: 40,
            experienceLevel: 20,
            availability: 10,
          },
        },
      ];

      redisClient.get.mockResolvedValue(JSON.stringify(cachedResults));
      prismaService.talent.findUnique.mockResolvedValue(mockTalent);

      const result = await service.findMatchingJobsForTalent('talent-1');

      expect(result).toEqual(cachedResults);
      expect(redisClient.get).toHaveBeenCalledWith('matches:talent:talent-1');
      expect(prismaService.talent.findUnique).not.toHaveBeenCalled();
    });

    it('should calculate matches when cache is empty', async () => {
      redisClient.get.mockResolvedValue(null);
      prismaService.talent.findUnique.mockResolvedValue(mockTalent);
      prismaService.job.findMany.mockResolvedValue(mockJobs);
      redisClient.setex.mockResolvedValue('OK');

      const result = await service.findMatchingJobsForTalent('talent-1');

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].score).toBeGreaterThanOrEqual(50);
      expect(redisClient.setex).toHaveBeenCalledWith(
        'matches:talent:talent-1',
        300,
        expect.any(String),
      );
    });

    it('should throw NotFoundException if talent does not exist', async () => {
      redisClient.get.mockResolvedValue(null);
      prismaService.talent.findUnique.mockResolvedValue(null);

      await expect(
        service.findMatchingJobsForTalent('non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('calculateMatchScore', () => {
    it('should calculate correct score for perfect match', () => {
      const job = {
        serviceCategory: 'WEB_DEVELOPMENT',
        requiredSkills: ['JavaScript', 'TypeScript'],
        experienceLevel: 'SENIOR',
      };

      const talent = {
        serviceCategory: 'WEB_DEVELOPMENT',
        skills: ['JavaScript', 'TypeScript', 'React'],
        experienceLevel: 'SENIOR',
      };

      const score = (service as any).calculateMatchScore(job, talent);

      // Service Category: 30, Skill Overlap: 40, Experience: 20, Availability: 10
      expect(score).toBe(100);
    });

    it('should calculate correct score for partial match', () => {
      const job = {
        serviceCategory: 'WEB_DEVELOPMENT',
        requiredSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
        experienceLevel: 'SENIOR',
      };

      const talent = {
        serviceCategory: 'WEB_DEVELOPMENT',
        skills: ['JavaScript', 'TypeScript'],
        experienceLevel: 'INTERMEDIATE',
      };

      const score = (service as any).calculateMatchScore(job, talent);

      // Service Category: 30, Skill Overlap: 20 (50% of 40), Experience: 10, Availability: 10
      expect(score).toBeGreaterThanOrEqual(50);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('invalidateCache', () => {
    it('should delete job cache', async () => {
      redisClient.del.mockResolvedValue(1);

      await service.invalidateCache('job', 'job-1');

      expect(redisClient.del).toHaveBeenCalledWith('matches:job:job-1');
    });

    it('should delete talent cache', async () => {
      redisClient.del.mockResolvedValue(1);

      await service.invalidateCache('talent', 'talent-1');

      expect(redisClient.del).toHaveBeenCalledWith('matches:talent:talent-1');
    });
  });
});

