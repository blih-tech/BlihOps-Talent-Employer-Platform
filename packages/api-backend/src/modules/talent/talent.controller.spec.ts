import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TalentController } from './talent.controller';
import { TalentService } from './talent.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTalentDto } from './dto/create-talent.dto';

describe('TalentController (e2e)', () => {
  let app: INestApplication;
  let talentService: TalentService;
  let prismaService: PrismaService;

  const mockTalent = {
    id: 'talent-id-1',
    telegramId: '123456789',
    name: 'John Doe',
    serviceCategory: 'ITO',
    skills: ['JavaScript', 'TypeScript'],
    experienceLevel: 'INTERMEDIATE',
    yearsOfExperience: 3,
    bio: 'Full-stack developer',
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    talent: {
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
      controllers: [TalentController],
      providers: [
        TalentService,
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

    talentService = moduleFixture.get<TalentService>(TalentService);
    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset all mock implementations to ensure test isolation
    mockPrismaService.talent.findUnique.mockReset();
    mockPrismaService.talent.findMany.mockReset();
    mockPrismaService.talent.count.mockReset();
    mockPrismaService.talent.create.mockReset();
    mockPrismaService.talent.update.mockReset();
    mockPrismaService.auditLog.create.mockReset();
  });

  describe('GET /api/v1/talents', () => {
    it('should return paginated list of talents', async () => {
      const mockTalents = [mockTalent];
      mockPrismaService.talent.findMany.mockResolvedValue(mockTalents);
      mockPrismaService.talent.count.mockResolvedValue(1);

      const response = await request(app.getHttpServer())
        .get('/api/v1/talents')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination.total).toBe(1);
    });

    it('should filter by status', async () => {
      mockPrismaService.talent.findMany.mockResolvedValue([]);
      mockPrismaService.talent.count.mockResolvedValue(0);

      await request(app.getHttpServer())
        .get('/api/v1/talents')
        .query({ status: 'APPROVED' })
        .expect(200);

      expect(mockPrismaService.talent.findMany).toHaveBeenCalled();
    });

    it('should validate status enum value', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/talents')
        .query({ status: 'INVALID_STATUS' })
        .expect(400);
    });

    it('should filter by category', async () => {
      mockPrismaService.talent.findMany.mockResolvedValue([]);
      mockPrismaService.talent.count.mockResolvedValue(0);

      // Note: Category enum validation might fail, so we skip this test or use a valid enum value
      // The actual filtering logic is tested in unit tests
      await request(app.getHttpServer())
        .get('/api/v1/talents')
        .query({ category: 'ITO' }) // Use a valid ServiceCategory enum value
        .expect(200);

      expect(mockPrismaService.talent.findMany).toHaveBeenCalled();
    });

    it('should handle pagination parameters', async () => {
      mockPrismaService.talent.findMany.mockResolvedValue([]);
      mockPrismaService.talent.count.mockResolvedValue(0);

      await request(app.getHttpServer())
        .get('/api/v1/talents')
        .query({ page: 2, limit: 10 })
        .expect(200);

      expect(mockPrismaService.talent.findMany).toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/talents', () => {
    const createDto: CreateTalentDto = {
      telegramId: 123456789,
      name: 'Jane Smith',
      serviceCategory: 'ITO' as any, // Use valid enum value
      skills: ['React', 'Node.js'],
      experienceLevel: 'SENIOR' as any,
      availability: 'AVAILABLE' as any,
      engagementPreference: 'FULL_TIME' as any,
    };

    it('should create a new talent', async () => {
      const createdTalent = { ...mockTalent, ...createDto, telegramId: '123456789' };
      mockPrismaService.talent.findUnique.mockResolvedValue(null);
      mockPrismaService.talent.create.mockResolvedValue(createdTalent);

      const response = await request(app.getHttpServer())
        .post('/api/v1/talents')
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createDto.name);
      expect(mockPrismaService.talent.create).toHaveBeenCalled();
    });

    it('should return 409 if talent with telegramId already exists', async () => {
      mockPrismaService.talent.findUnique.mockResolvedValue(mockTalent);

      await request(app.getHttpServer())
        .post('/api/v1/talents')
        .send(createDto)
        .expect(409);

      expect(mockPrismaService.talent.create).not.toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/talents')
        .send({})
        .expect(400);
    });

    it('should validate telegramId is a number', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/talents')
        .send({
          ...createDto,
          telegramId: 'not-a-number',
        })
        .expect(400);
    });

    it('should validate skills array is not empty', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/talents')
        .send({
          ...createDto,
          skills: [],
        })
        .expect(400);
    });

    it('should validate skills array has at least one item', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/talents')
        .send({
          ...createDto,
          skills: [],
        })
        .expect(400);
    });

    it('should validate skills array max size', async () => {
      const tooManySkills = Array(51).fill('Skill');
      await request(app.getHttpServer())
        .post('/api/v1/talents')
        .send({
          ...createDto,
          skills: tooManySkills,
        })
        .expect(400);
    });

    it('should validate name min length', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/talents')
        .send({
          ...createDto,
          name: 'A',
        })
        .expect(400);
    });

    it('should validate name max length', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/talents')
        .send({
          ...createDto,
          name: 'A'.repeat(101),
        })
        .expect(400);
    });
  });

  describe('GET /api/v1/talents/:id', () => {
    it('should return a talent by id', async () => {
      mockPrismaService.talent.findUnique.mockResolvedValue(mockTalent);

      const response = await request(app.getHttpServer())
        .get(`/api/v1/talents/${mockTalent.id}`)
        .expect(200);

      expect(response.body.id).toBe(mockTalent.id);
      expect(response.body.name).toBe(mockTalent.name);
    });

    it('should return 404 if talent not found', async () => {
      mockPrismaService.talent.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/api/v1/talents/non-existent-id')
        .expect(404);
    });
  });

  describe('PATCH /api/v1/talents/:id', () => {
    const updateDto = {
      name: 'Updated Name',
      skills: ['React', 'Vue', 'Angular'],
    };

    it('should update a talent', async () => {
      const updatedTalent = { ...mockTalent, ...updateDto };
      mockPrismaService.talent.findUnique
        .mockResolvedValueOnce(mockTalent) // for findOne check
        .mockResolvedValueOnce(mockTalent); // for metadata retrieval
      mockPrismaService.talent.update.mockResolvedValue(updatedTalent);

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/talents/${mockTalent.id}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.name).toBe(updateDto.name);
      expect(mockPrismaService.talent.update).toHaveBeenCalled();
    });

    it('should return 404 if talent not found', async () => {
      // The update method calls findOne which calls findUnique with include
      // We need to ensure findUnique returns null to trigger NotFoundException
      // Reset any previous mock implementations first
      mockPrismaService.talent.findUnique.mockReset();
      
      // Mock findUnique to always return null (talent not found)
      // This will cause findOne to throw NotFoundException
      mockPrismaService.talent.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .patch('/api/v1/talents/non-existent-id')
        .send(updateDto)
        .expect(404);

      // Verify findUnique was called (by findOne method)
      expect(mockPrismaService.talent.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'non-existent-id' },
        }),
      );
      // Verify update was NOT called since findOne throws NotFoundException
      expect(mockPrismaService.talent.update).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/v1/talents/:id', () => {
    it('should soft delete a talent', async () => {
      const deletedTalent = { ...mockTalent, status: 'INACTIVE' };
      mockPrismaService.talent.findUnique.mockResolvedValue(mockTalent);
      mockPrismaService.talent.update.mockResolvedValue(deletedTalent);

      // DELETE endpoint has @HttpCode(HttpStatus.NO_CONTENT) which returns 204
      await request(app.getHttpServer())
        .delete(`/api/v1/talents/${mockTalent.id}`)
        .expect(204);

      expect(mockPrismaService.talent.update).toHaveBeenCalledWith({
        where: { id: mockTalent.id },
        data: { status: 'INACTIVE' },
      });
    });

    it('should return 404 if talent not found', async () => {
      mockPrismaService.talent.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .delete('/api/v1/talents/non-existent-id')
        .expect(404);
    });
  });

  describe('POST /api/v1/talents/:id/approve', () => {
    it('should approve a talent', async () => {
      const approvedTalent = { ...mockTalent, status: 'APPROVED' };
      mockPrismaService.talent.findUnique.mockResolvedValue(mockTalent);
      mockPrismaService.talent.update.mockResolvedValue(approvedTalent);

      // POST endpoints return 201 by default in NestJS
      const response = await request(app.getHttpServer())
        .post(`/api/v1/talents/${mockTalent.id}/approve`)
        .expect(201);

      expect(response.body.status).toBe('APPROVED');
      expect(mockPrismaService.talent.update).toHaveBeenCalled();
    });

    it('should return 404 if talent not found', async () => {
      mockPrismaService.talent.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/api/v1/talents/non-existent-id/approve')
        .expect(404);
    });

    it('should return 409 if talent already approved', async () => {
      const approvedTalent = { ...mockTalent, status: 'APPROVED' };
      mockPrismaService.talent.findUnique.mockResolvedValue(approvedTalent);

      await request(app.getHttpServer())
        .post(`/api/v1/talents/${mockTalent.id}/approve`)
        .expect(409);
    });
  });

  describe('POST /api/v1/talents/:id/reject', () => {
    it('should reject a talent', async () => {
      const rejectedTalent = { ...mockTalent, status: 'REJECTED' };
      mockPrismaService.talent.findUnique.mockResolvedValue(mockTalent);
      mockPrismaService.talent.update.mockResolvedValue(rejectedTalent);

      const response = await request(app.getHttpServer())
        .post(`/api/v1/talents/${mockTalent.id}/reject`)
        .send({ reason: 'Insufficient experience' })
        .expect(201);

      expect(response.body.status).toBe('REJECTED');
      expect(mockPrismaService.talent.update).toHaveBeenCalled();
    });

    it('should return 404 if talent not found', async () => {
      mockPrismaService.talent.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/api/v1/talents/non-existent-id/reject')
        .expect(404);
    });

    it('should return 409 if talent already rejected', async () => {
      const rejectedTalent = { ...mockTalent, status: 'REJECTED' };
      mockPrismaService.talent.findUnique.mockResolvedValue(rejectedTalent);

      await request(app.getHttpServer())
        .post(`/api/v1/talents/${mockTalent.id}/reject`)
        .expect(409);
    });
  });
});

