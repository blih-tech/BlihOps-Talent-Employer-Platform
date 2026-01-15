import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AdminController (e2e)', () => {
  let app: INestApplication;
  let adminService: AdminService;
  let prismaService: PrismaService;

  const mockStatistics = {
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
  };

  const mockAnalytics = {
    conversionRates: {
      talentApprovalRate: 70,
      jobPublishRate: 60,
      applicationHireRate: 20,
    },
  };

  const mockKeyMetrics = {
    recentActivity: {
      newTalents: 15,
      newJobs: 8,
      newApplications: 25,
    },
  };

  const mockAdminService = {
    getStatistics: jest.fn(),
    getAnalytics: jest.fn(),
    getKeyMetrics: jest.fn(),
  };

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

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    adminService = moduleFixture.get<AdminService>(AdminService);
    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /admin/stats', () => {
    it('should return statistics successfully', async () => {
      mockAdminService.getStatistics.mockResolvedValue(mockStatistics);

      const response = await request(app.getHttpServer())
        .get('/admin/stats')
        .expect(200);

      expect(response.body).toEqual(mockStatistics);
      expect(mockAdminService.getStatistics).toHaveBeenCalledTimes(1);
    });

    it('should return correct statistics structure', async () => {
      mockAdminService.getStatistics.mockResolvedValue(mockStatistics);

      const response = await request(app.getHttpServer())
        .get('/admin/stats')
        .expect(200);

      expect(response.body).toHaveProperty('talents');
      expect(response.body).toHaveProperty('jobs');
      expect(response.body).toHaveProperty('applications');
      expect(response.body.talents).toHaveProperty('total');
      expect(response.body.talents).toHaveProperty('pending');
      expect(response.body.talents).toHaveProperty('approved');
      expect(response.body.jobs).toHaveProperty('total');
      expect(response.body.jobs).toHaveProperty('pending');
      expect(response.body.jobs).toHaveProperty('published');
      expect(response.body.applications).toHaveProperty('total');
    });
  });

  describe('GET /admin/analytics', () => {
    it('should return analytics successfully', async () => {
      mockAdminService.getAnalytics.mockResolvedValue(mockAnalytics);

      const response = await request(app.getHttpServer())
        .get('/admin/analytics')
        .expect(200);

      expect(response.body).toEqual(mockAnalytics);
      expect(mockAdminService.getAnalytics).toHaveBeenCalledTimes(1);
    });

    it('should return correct analytics structure', async () => {
      mockAdminService.getAnalytics.mockResolvedValue(mockAnalytics);

      const response = await request(app.getHttpServer())
        .get('/admin/analytics')
        .expect(200);

      expect(response.body).toHaveProperty('conversionRates');
      expect(response.body.conversionRates).toHaveProperty('talentApprovalRate');
      expect(response.body.conversionRates).toHaveProperty('jobPublishRate');
      expect(response.body.conversionRates).toHaveProperty('applicationHireRate');
    });
  });

  describe('GET /admin/metrics', () => {
    it('should return key metrics successfully', async () => {
      mockAdminService.getKeyMetrics.mockResolvedValue(mockKeyMetrics);

      const response = await request(app.getHttpServer())
        .get('/admin/metrics')
        .expect(200);

      expect(response.body).toEqual(mockKeyMetrics);
      expect(mockAdminService.getKeyMetrics).toHaveBeenCalledTimes(1);
    });

    it('should return correct metrics structure', async () => {
      mockAdminService.getKeyMetrics.mockResolvedValue(mockKeyMetrics);

      const response = await request(app.getHttpServer())
        .get('/admin/metrics')
        .expect(200);

      expect(response.body).toHaveProperty('recentActivity');
      expect(response.body.recentActivity).toHaveProperty('newTalents');
      expect(response.body.recentActivity).toHaveProperty('newJobs');
      expect(response.body.recentActivity).toHaveProperty('newApplications');
    });
  });
});


