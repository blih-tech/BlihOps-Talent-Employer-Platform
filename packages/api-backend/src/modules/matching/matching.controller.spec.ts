import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MatchingController } from './matching.controller';
import { MatchingService } from './matching.service';

describe('MatchingController', () => {
  let controller: MatchingController;
  let service: jest.Mocked<MatchingService>;

  const mockMatchingService = {
    findMatchingTalentsForJob: jest.fn(),
    findMatchingJobsForTalent: jest.fn(),
    invalidateCache: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchingController],
      providers: [
        {
          provide: MatchingService,
          useValue: mockMatchingService,
        },
      ],
    }).compile();

    controller = module.get<MatchingController>(MatchingController);
    service = module.get(MatchingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findMatchingTalentsForJob', () => {
    it('should return matching talents for a job', async () => {
      const jobId = 'job-1';
      const mockMatches = [
        {
          talent: {
            id: 'talent-1',
            name: 'John Doe',
            skills: ['JavaScript', 'TypeScript'],
          },
          score: 90,
          breakdown: {
            serviceCategory: 30,
            skillOverlap: 40,
            experienceLevel: 20,
            availability: 10,
          },
        },
      ];

      service.findMatchingTalentsForJob.mockResolvedValue(mockMatches);

      const result = await controller.findMatchingTalentsForJob(jobId);

      expect(result).toEqual(mockMatches);
      expect(service.findMatchingTalentsForJob).toHaveBeenCalledWith(jobId);
    });

    it('should throw NotFoundException when job does not exist', async () => {
      const jobId = 'non-existent';
      service.findMatchingTalentsForJob.mockRejectedValue(
        new NotFoundException('Job not found'),
      );

      await expect(
        controller.findMatchingTalentsForJob(jobId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findMatchingJobsForTalent', () => {
    it('should return matching jobs for a talent', async () => {
      const talentId = 'talent-1';
      const mockMatches = [
        {
          job: {
            id: 'job-1',
            title: 'Senior Developer',
            requiredSkills: ['JavaScript', 'TypeScript'],
          },
          score: 85,
          breakdown: {
            serviceCategory: 30,
            skillOverlap: 35,
            experienceLevel: 20,
            availability: 10,
          },
        },
      ];

      service.findMatchingJobsForTalent.mockResolvedValue(mockMatches);

      const result = await controller.findMatchingJobsForTalent(talentId);

      expect(result).toEqual(mockMatches);
      expect(service.findMatchingJobsForTalent).toHaveBeenCalledWith(talentId);
    });

    it('should throw NotFoundException when talent does not exist', async () => {
      const talentId = 'non-existent';
      service.findMatchingJobsForTalent.mockRejectedValue(
        new NotFoundException('Talent not found'),
      );

      await expect(
        controller.findMatchingJobsForTalent(talentId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});



