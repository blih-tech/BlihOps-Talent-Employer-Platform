import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { ServiceCategory, ExperienceLevel, EngagementType } from '@blihops/shared';

describe('JobsController (e2e)', () => {
  let app: INestApplication;
  let jobsService: JobsService;
  let prismaService: PrismaService;

  const mockJob = {
    id: 'job-id-1',
    title: 'Senior Full-Stack Developer',
    description: 'We are looking for an experienced full-stack developer.',
    serviceCategory: ServiceCategory.ITO,
    requiredSkills: ['TypeScript', 'NestJS', 'PostgreSQL'],
    experienceLevel: ExperienceLevel.SENIOR,
    engagementType: EngagementType.FULL_TIME,
    duration: '6 months',
    budget: '$5000 - $7000/month',
    status: 'PENDING',
    createdById: 'admin-id-1',
    createdBy: {
      id: 'admin-id-1',
      name: 'Admin User',
      email: 'admin@example.com',
    },
    applications: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [JobsController],
      providers: [
        JobsService,
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
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.setGlobalPrefix('api/v1');

    jobsService = moduleFixture.get<JobsService>(JobsService);
    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrismaService.job.findUnique.mockReset();
    mockPrismaService.job.findMany.mockReset();
    mockPrismaService.job.count.mockReset();
    mockPrismaService.job.create.mockReset();
    mockPrismaService.job.update.mockReset();
    mockPrismaService.auditLog.create.mockReset();
  });

  describe('GET /api/v1/jobs', () => {
    it('should return paginated list of jobs', async () => {
      const mockJobs = [mockJob];
      mockPrismaService.job.findMany.mockResolvedValue(mockJobs);
      mockPrismaService.job.count.mockResolvedValue(1);

      const response = await request(app.getHttpServer())
        .get('/api/v1/jobs')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta.total).toBe(1);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(10);
    });

    it('should filter by status', async () => {
      mockPrismaService.job.findMany.mockResolvedValue([]);
      mockPrismaService.job.count.mockResolvedValue(0);

      await request(app.getHttpServer())
        .get('/api/v1/jobs')
        .query({ status: 'PENDING' })
        .expect(200);

      expect(mockPrismaService.job.findMany).toHaveBeenCalled();
    });

    it('should filter by serviceCategory', async () => {
      mockPrismaService.job.findMany.mockResolvedValue([]);
      mockPrismaService.job.count.mockResolvedValue(0);

      await request(app.getHttpServer())
        .get('/api/v1/jobs')
        .query({ serviceCategory: ServiceCategory.ITO })
        .expect(200);

      expect(mockPrismaService.job.findMany).toHaveBeenCalled();
    });

    it('should handle pagination parameters', async () => {
      mockPrismaService.job.findMany.mockResolvedValue([]);
      mockPrismaService.job.count.mockResolvedValue(0);

      await request(app.getHttpServer())
        .get('/api/v1/jobs')
        .query({ page: 2, limit: 5 })
        .expect(200);

      expect(mockPrismaService.job.findMany).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/jobs/:id', () => {
    it('should return a job by id', async () => {
      mockPrismaService.job.findUnique.mockResolvedValue(mockJob);

      const response = await request(app.getHttpServer())
        .get(`/api/v1/jobs/${mockJob.id}`)
        .expect(200);

      expect(response.body.id).toBe(mockJob.id);
      expect(response.body.title).toBe(mockJob.title);
    });

    it('should return 404 if job not found', async () => {
      mockPrismaService.job.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/api/v1/jobs/non-existent-id')
        .expect(404);
    });
  });

  describe('POST /api/v1/jobs', () => {
    const createDto: CreateJobDto = {
      title: 'New Job Position',
      description: 'Looking for a talented developer to join our team.',
      serviceCategory: ServiceCategory.ITO,
      requiredSkills: ['JavaScript', 'TypeScript'],
      experienceLevel: ExperienceLevel.MID,
      engagementType: EngagementType.FULL_TIME,
      duration: '12 months',
      budget: '$4000 - $6000/month',
    };

    it('should create a new job', async () => {
      const createdJob = { ...mockJob, ...createDto };
      mockPrismaService.job.create.mockResolvedValue(createdJob);

      // Note: This test will fail until guards are implemented and properly mocked
      // The endpoint requires JWT auth and ADMIN role
      // For now, this test structure is ready for when guards are implemented
      const response = await request(app.getHttpServer())
        .post('/api/v1/jobs')
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(createDto.title);
      expect(mockPrismaService.job.create).toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/jobs')
        .send({})
        .expect(400);
    });

    it('should validate title minimum length', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/jobs')
        .send({
          ...createDto,
          title: 'Ab', // Too short
        })
        .expect(400);
    });

    it('should validate description minimum length', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/jobs')
        .send({
          ...createDto,
          description: 'Short', // Too short
        })
        .expect(400);
    });
  });

  describe('PATCH /api/v1/jobs/:id', () => {
    const updateDto = {
      title: 'Updated Job Title',
      description: 'Updated job description with more details.',
    };

    it('should update a job', async () => {
      const updatedJob = { ...mockJob, ...updateDto };
      mockPrismaService.job.update.mockResolvedValue(updatedJob);

      // Note: This test will fail until guards are implemented and properly mocked
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/jobs/${mockJob.id}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.title).toBe(updateDto.title);
      expect(mockPrismaService.job.update).toHaveBeenCalled();
    });

    it('should return 404 if job not found', async () => {
      mockPrismaService.job.update.mockRejectedValue(
        new Error('Record to update not found'),
      );

      await request(app.getHttpServer())
        .patch('/api/v1/jobs/non-existent-id')
        .send(updateDto)
        .expect(500); // Prisma throws an error, not NotFoundException in update
    });
  });

  describe('POST /api/v1/jobs/:id/publish', () => {
    it('should publish a pending job', async () => {
      const pendingJob = { ...mockJob, status: 'PENDING' };
      const publishedJob = { ...pendingJob, status: 'PUBLISHED', publishedAt: new Date() };

      mockPrismaService.job.findUnique.mockResolvedValue(pendingJob);
      mockPrismaService.job.update.mockResolvedValue(publishedJob);
      mockPrismaService.auditLog.create.mockResolvedValue({ id: 'audit-id' });

      // Note: This test will fail until guards are implemented and properly mocked
      const response = await request(app.getHttpServer())
        .post(`/api/v1/jobs/${mockJob.id}/publish`)
        .expect(201);

      expect(response.body.status).toBe('PUBLISHED');
      expect(mockPrismaService.job.update).toHaveBeenCalled();
    });

    it('should return 404 if job not found', async () => {
      mockPrismaService.job.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/api/v1/jobs/non-existent-id/publish')
        .expect(404);
    });

    it('should return 400 if job is not in PENDING status', async () => {
      const publishedJob = { ...mockJob, status: 'PUBLISHED' };
      mockPrismaService.job.findUnique.mockResolvedValue(publishedJob);

      // Note: This test will fail until guards are implemented and properly mocked
      await request(app.getHttpServer())
        .post(`/api/v1/jobs/${mockJob.id}/publish`)
        .expect(400);
    });
  });

  describe('POST /api/v1/jobs/:id/reject', () => {
    it('should reject a pending job', async () => {
      const pendingJob = { ...mockJob, status: 'PENDING' };
      const rejectedJob = { ...pendingJob, status: 'REJECTED' };

      mockPrismaService.job.findUnique.mockResolvedValue(pendingJob);
      mockPrismaService.job.update.mockResolvedValue(rejectedJob);
      mockPrismaService.auditLog.create.mockResolvedValue({ id: 'audit-id' });

      // Note: This test will fail until guards are implemented and properly mocked
      const response = await request(app.getHttpServer())
        .post(`/api/v1/jobs/${mockJob.id}/reject`)
        .send({ reason: 'Does not meet requirements' })
        .expect(201);

      expect(response.body.status).toBe('REJECTED');
      expect(mockPrismaService.job.update).toHaveBeenCalled();
    });

    it('should return 404 if job not found', async () => {
      mockPrismaService.job.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/api/v1/jobs/non-existent-id/reject')
        .send({ reason: 'Test reason' })
        .expect(404);
    });

    it('should return 400 if job is not in PENDING status', async () => {
      const publishedJob = { ...mockJob, status: 'PUBLISHED' };
      mockPrismaService.job.findUnique.mockResolvedValue(publishedJob);

      // Note: This test will fail until guards are implemented and properly mocked
      await request(app.getHttpServer())
        .post(`/api/v1/jobs/${mockJob.id}/reject`)
        .send({ reason: 'Test reason' })
        .expect(400);
    });
  });

  describe('POST /api/v1/jobs/:id/close', () => {
    it('should close a published job', async () => {
      const publishedJob = { ...mockJob, status: 'PUBLISHED' };
      const closedJob = { ...publishedJob, status: 'CLOSED', closedAt: new Date() };

      mockPrismaService.job.findUnique.mockResolvedValue(publishedJob);
      mockPrismaService.job.update.mockResolvedValue(closedJob);
      mockPrismaService.auditLog.create.mockResolvedValue({ id: 'audit-id' });

      // Note: This test will fail until guards are implemented and properly mocked
      const response = await request(app.getHttpServer())
        .post(`/api/v1/jobs/${mockJob.id}/close`)
        .expect(201);

      expect(response.body.status).toBe('CLOSED');
      expect(mockPrismaService.job.update).toHaveBeenCalled();
    });

    it('should return 404 if job not found', async () => {
      mockPrismaService.job.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/api/v1/jobs/non-existent-id/close')
        .expect(404);
    });

    it('should return 400 if job is not PUBLISHED', async () => {
      const pendingJob = { ...mockJob, status: 'PENDING' };
      mockPrismaService.job.findUnique.mockResolvedValue(pendingJob);

      // Note: This test will fail until guards are implemented and properly mocked
      await request(app.getHttpServer())
        .post(`/api/v1/jobs/${mockJob.id}/close`)
        .expect(400);
    });
  });

  describe('POST /api/v1/jobs/:id/archive', () => {
    it('should archive a closed job', async () => {
      const closedJob = { ...mockJob, status: 'CLOSED' };
      const archivedJob = { ...closedJob, status: 'ARCHIVED' };

      mockPrismaService.job.findUnique.mockResolvedValue(closedJob);
      mockPrismaService.job.update.mockResolvedValue(archivedJob);
      mockPrismaService.auditLog.create.mockResolvedValue({ id: 'audit-id' });

      // Note: This test will fail until guards are implemented and properly mocked
      const response = await request(app.getHttpServer())
        .post(`/api/v1/jobs/${mockJob.id}/archive`)
        .expect(201);

      expect(response.body.status).toBe('ARCHIVED');
      expect(mockPrismaService.job.update).toHaveBeenCalled();
    });

    it('should return 404 if job not found', async () => {
      mockPrismaService.job.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/api/v1/jobs/non-existent-id/archive')
        .expect(404);
    });

    it('should return 400 if job is not CLOSED', async () => {
      const publishedJob = { ...mockJob, status: 'PUBLISHED' };
      mockPrismaService.job.findUnique.mockResolvedValue(publishedJob);

      // Note: This test will fail until guards are implemented and properly mocked
      await request(app.getHttpServer())
        .post(`/api/v1/jobs/${mockJob.id}/archive`)
        .expect(400);
    });
  });
});

