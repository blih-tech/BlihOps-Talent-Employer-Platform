import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bull';
import { TalentService } from './talent.service';
import { PrismaService } from '../../prisma/prisma.service';
import { FilesService } from '../files/files.service';
import { CreateTalentDto } from './dto/create-talent.dto';
import { UpdateTalentDto } from './dto/update-talent.dto';
import { TalentQueryDto } from './dto/talent-query.dto';
import { QUEUE_NAMES } from '../../queue/queue.config';

describe('TalentService', () => {
  let service: TalentService;
  let prisma: PrismaService;

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

  const mockFilesService = {
    uploadCV: jest.fn(),
    deleteCV: jest.fn(),
  };

  const mockQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TalentService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: FilesService,
          useValue: mockFilesService,
        },
        {
          provide: getQueueToken(QUEUE_NAMES.PUBLISH_TALENT),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<TalentService>(TalentService);
    prisma = module.get<PrismaService>(PrismaService);

    // Clear all mocks before each test
    jest.clearAllMocks();
    mockFilesService.uploadCV.mockReset();
    mockFilesService.deleteCV.mockReset();
    mockQueue.add.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateTalentDto = {
      telegramId: 123456789,
      name: 'John Doe',
      serviceCategory: 'ITO' as any,
      skills: ['JavaScript', 'TypeScript'],
      experienceLevel: 'INTERMEDIATE' as any,
      availability: 'AVAILABLE' as any,
      engagementPreference: 'FULL_TIME' as any,
    };

    it('should create a talent successfully', async () => {
      const expectedTalent = {
        id: 'talent-id',
        telegramId: '123456789',
        name: 'John Doe',
        serviceCategory: 'ITO',
        skills: ['JavaScript', 'TypeScript'],
        experienceLevel: 'INTERMEDIATE',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.talent.findUnique.mockResolvedValue(null);
      mockPrismaService.talent.create.mockResolvedValue(expectedTalent);

      const result = await service.create(createDto);

      expect(result).toEqual(expectedTalent);
      expect(mockPrismaService.talent.findUnique).toHaveBeenCalledWith({
        where: { telegramId: '123456789' },
      });
      expect(mockPrismaService.talent.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if talent with telegramId exists', async () => {
      mockPrismaService.talent.findUnique.mockResolvedValue({
        id: 'existing-id',
        telegramId: '123456789',
      });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(mockPrismaService.talent.create).not.toHaveBeenCalled();
    });

    it('should store additional fields in metadata', async () => {
      const dtoWithMetadata = {
        ...createDto,
        roleSpecialization: 'Senior Developer',
        cvFileId: 'cv-uuid',
        consentForPublicVisibility: true,
      };

      mockPrismaService.talent.findUnique.mockResolvedValue(null);
      mockPrismaService.talent.create.mockResolvedValue({ id: 'talent-id' });

      await service.create(dtoWithMetadata);

      expect(mockPrismaService.talent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          metadata: expect.objectContaining({
            roleSpecialization: 'Senior Developer',
            cvFileId: 'cv-uuid',
            consentForPublicVisibility: true,
          }),
        }),
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated talents', async () => {
      const query: TalentQueryDto = { page: 1, limit: 10 };
      const mockTalents = [
        { id: '1', name: 'Talent 1' },
        { id: '2', name: 'Talent 2' },
      ];

      mockPrismaService.talent.findMany.mockResolvedValue(mockTalents);
      mockPrismaService.talent.count.mockResolvedValue(2);

      const result = await service.findAll(query);

      expect(result.data).toEqual(mockTalents);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.hasNext).toBe(false);
      expect(result.pagination.hasPrev).toBe(false);
    });

    it('should filter by status', async () => {
      const query: TalentQueryDto = { status: 'APPROVED' as any };
      mockPrismaService.talent.findMany.mockResolvedValue([]);
      mockPrismaService.talent.count.mockResolvedValue(0);

      await service.findAll(query);

      expect(mockPrismaService.talent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'APPROVED',
          }),
        }),
      );
    });

    it('should filter by category', async () => {
      const query: TalentQueryDto = { category: 'ITO' as any };
      mockPrismaService.talent.findMany.mockResolvedValue([]);
      mockPrismaService.talent.count.mockResolvedValue(0);

      await service.findAll(query);

      expect(mockPrismaService.talent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            serviceCategory: 'ITO',
          }),
        }),
      );
    });

    it('should filter by skills', async () => {
      const query: TalentQueryDto = { skills: 'JavaScript,TypeScript' };
      mockPrismaService.talent.findMany.mockResolvedValue([]);
      mockPrismaService.talent.count.mockResolvedValue(0);

      await service.findAll(query);

      expect(mockPrismaService.talent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            skills: {
              hasSome: ['JavaScript', 'TypeScript'],
            },
          }),
        }),
      );
    });

    it('should search in name and skills', async () => {
      const query: TalentQueryDto = { search: 'developer' };
      mockPrismaService.talent.findMany.mockResolvedValue([]);
      mockPrismaService.talent.count.mockResolvedValue(0);

      await service.findAll(query);

      expect(mockPrismaService.talent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { name: { contains: 'developer', mode: 'insensitive' } },
              { skills: { hasSome: ['developer'] } },
              { bio: { contains: 'developer', mode: 'insensitive' } },
            ]),
          }),
        }),
      );
    });

    it('should sort by name', async () => {
      const query: TalentQueryDto = { sortBy: 'name', sortOrder: 'asc' };
      mockPrismaService.talent.findMany.mockResolvedValue([]);
      mockPrismaService.talent.count.mockResolvedValue(0);

      await service.findAll(query);

      expect(mockPrismaService.talent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { name: 'asc' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a talent by id', async () => {
      const mockTalent = {
        id: 'talent-id',
        name: 'John Doe',
        applications: [],
      };

      mockPrismaService.talent.findUnique.mockResolvedValue(mockTalent);

      const result = await service.findOne('talent-id');

      expect(result).toEqual(mockTalent);
      expect(mockPrismaService.talent.findUnique).toHaveBeenCalledWith({
        where: { id: 'talent-id' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if talent not found', async () => {
      mockPrismaService.talent.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a talent successfully', async () => {
      const updateDto: UpdateTalentDto = {
        name: 'Jane Doe',
        skills: ['React', 'Vue'],
      };

      const existingTalent = { id: 'talent-id', name: 'John Doe' };
      const updatedTalent = { ...existingTalent, ...updateDto };

      mockPrismaService.talent.findUnique.mockResolvedValue(existingTalent);
      mockPrismaService.talent.update.mockResolvedValue(updatedTalent);

      const result = await service.update('talent-id', updateDto);

      expect(result).toEqual(updatedTalent);
      expect(mockPrismaService.talent.update).toHaveBeenCalledWith({
        where: { id: 'talent-id' },
        data: expect.objectContaining(updateDto),
      });
    });

    it('should throw NotFoundException if talent not found', async () => {
      mockPrismaService.talent.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent-id', {})).rejects.toThrow(NotFoundException);
    });

    it('should merge metadata when updating', async () => {
      const existingTalent = {
        id: 'talent-id',
        metadata: { existingField: 'value' },
      };

      const updateDto: UpdateTalentDto = {
        roleSpecialization: 'Senior Developer',
      };

      mockPrismaService.talent.findUnique
        .mockResolvedValueOnce(existingTalent) // for findOne check
        .mockResolvedValueOnce(existingTalent); // for metadata retrieval

      mockPrismaService.talent.update.mockResolvedValue({ id: 'talent-id' });

      await service.update('talent-id', updateDto);

      expect(mockPrismaService.talent.update).toHaveBeenCalledWith({
        where: { id: 'talent-id' },
        data: expect.objectContaining({
          metadata: expect.objectContaining({
            existingField: 'value',
            roleSpecialization: 'Senior Developer',
          }),
        }),
      });
    });
  });

  describe('remove', () => {
    it('should soft delete a talent (set status to INACTIVE)', async () => {
      const existingTalent = { id: 'talent-id', status: 'APPROVED' };
      const updatedTalent = { ...existingTalent, status: 'INACTIVE' };

      mockPrismaService.talent.findUnique.mockResolvedValue(existingTalent);
      mockPrismaService.talent.update.mockResolvedValue(updatedTalent);

      const result = await service.remove('talent-id');

      expect(result.status).toBe('INACTIVE');
      expect(mockPrismaService.talent.update).toHaveBeenCalledWith({
        where: { id: 'talent-id' },
        data: { status: 'INACTIVE' },
      });
    });

    it('should throw NotFoundException if talent not found', async () => {
      mockPrismaService.talent.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('approve', () => {
    it('should approve a talent and create audit log', async () => {
      const talent = {
        id: 'talent-id',
        name: 'John Doe',
        telegramId: '123456789',
        status: 'PENDING',
      };

      const approvedTalent = { ...talent, status: 'APPROVED' };
      const adminId = 'admin-id';

      mockPrismaService.talent.findUnique.mockResolvedValue(talent);
      mockPrismaService.talent.update.mockResolvedValue(approvedTalent);
      mockPrismaService.auditLog.create.mockResolvedValue({ id: 'audit-id' });

      const result = await service.approve('talent-id', adminId);

      expect(result.status).toBe('APPROVED');
      expect(mockPrismaService.talent.update).toHaveBeenCalledWith({
        where: { id: 'talent-id' },
        data: { status: 'APPROVED' },
      });
      expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          adminId,
          action: 'APPROVE_TALENT',
          resourceType: 'TALENT',
          resourceId: 'talent-id',
        }),
      });
    });

    it('should throw ConflictException if talent already approved', async () => {
      const talent = {
        id: 'talent-id',
        name: 'John Doe',
        status: 'APPROVED',
      };

      mockPrismaService.talent.findUnique.mockResolvedValue(talent);

      await expect(service.approve('talent-id')).rejects.toThrow(ConflictException);
      expect(mockPrismaService.talent.update).not.toHaveBeenCalled();
    });

    it('should not create audit log if adminId not provided', async () => {
      const talent = {
        id: 'talent-id',
        name: 'John Doe',
        status: 'PENDING',
      };

      mockPrismaService.talent.findUnique.mockResolvedValue(talent);
      mockPrismaService.talent.update.mockResolvedValue({ ...talent, status: 'APPROVED' });

      await service.approve('talent-id');

      expect(mockPrismaService.auditLog.create).not.toHaveBeenCalled();
    });
  });

  describe('reject', () => {
    it('should reject a talent and create audit log', async () => {
      const talent = {
        id: 'talent-id',
        name: 'John Doe',
        telegramId: '123456789',
        status: 'PENDING',
      };

      const rejectedTalent = { ...talent, status: 'REJECTED' };
      const adminId = 'admin-id';
      const reason = 'Insufficient experience';

      mockPrismaService.talent.findUnique.mockResolvedValue(talent);
      mockPrismaService.talent.update.mockResolvedValue(rejectedTalent);
      mockPrismaService.auditLog.create.mockResolvedValue({ id: 'audit-id' });

      const result = await service.reject('talent-id', reason, adminId);

      expect(result.status).toBe('REJECTED');
      expect(mockPrismaService.talent.update).toHaveBeenCalledWith({
        where: { id: 'talent-id' },
        data: { status: 'REJECTED' },
      });
      expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          adminId,
          action: 'REJECT_TALENT',
          resourceType: 'TALENT',
          resourceId: 'talent-id',
          metadata: expect.objectContaining({
            reason: 'Insufficient experience',
          }),
        }),
      });
    });

    it('should throw ConflictException if talent already rejected', async () => {
      const talent = {
        id: 'talent-id',
        name: 'John Doe',
        status: 'REJECTED',
      };

      mockPrismaService.talent.findUnique.mockResolvedValue(talent);

      await expect(service.reject('talent-id')).rejects.toThrow(ConflictException);
      expect(mockPrismaService.talent.update).not.toHaveBeenCalled();
    });

    it('should use default reason if not provided', async () => {
      const talent = {
        id: 'talent-id',
        name: 'John Doe',
        status: 'PENDING',
      };

      mockPrismaService.talent.findUnique.mockResolvedValue(talent);
      mockPrismaService.talent.update.mockResolvedValue({ ...talent, status: 'REJECTED' });
      mockPrismaService.auditLog.create.mockResolvedValue({ id: 'audit-id' });

      await service.reject('talent-id', undefined, 'admin-id');

      expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          metadata: expect.objectContaining({
            reason: 'No reason provided',
          }),
        }),
      });
    });
  });

  describe('uploadCV', () => {
    const mockFile = {
      originalname: 'cv.pdf',
      mimetype: 'application/pdf',
      buffer: Buffer.from('test file content'),
    } as Express.Multer.File;

    it('should upload CV for a talent', async () => {
      const talent = {
        id: 'talent-id',
        name: 'John Doe',
        cvUrl: null,
      };

      const cvPath = '/uploads/cv/talent-id-cv.pdf';
      const updatedTalent = { ...talent, cvUrl: cvPath };

      mockPrismaService.talent.findUnique.mockResolvedValue(talent);
      mockFilesService.uploadCV.mockResolvedValue(cvPath);
      mockPrismaService.talent.update.mockResolvedValue(updatedTalent);

      const result = await service.uploadCV('talent-id', mockFile);

      expect(result.cvUrl).toBe(cvPath);
      expect(mockFilesService.uploadCV).toHaveBeenCalledWith(mockFile, 'talent-id');
      expect(mockPrismaService.talent.update).toHaveBeenCalledWith({
        where: { id: 'talent-id' },
        data: { cvUrl: cvPath },
      });
    });

    it('should delete old CV before uploading new one', async () => {
      const talent = {
        id: 'talent-id',
        name: 'John Doe',
        cvUrl: '/uploads/cv/old-cv.pdf',
      };

      const cvPath = '/uploads/cv/talent-id-cv.pdf';
      const updatedTalent = { ...talent, cvUrl: cvPath };

      mockPrismaService.talent.findUnique.mockResolvedValue(talent);
      mockFilesService.uploadCV.mockResolvedValue(cvPath);
      mockPrismaService.talent.update.mockResolvedValue(updatedTalent);

      await service.uploadCV('talent-id', mockFile);

      expect(mockFilesService.deleteCV).toHaveBeenCalledWith('/uploads/cv/old-cv.pdf');
      expect(mockFilesService.uploadCV).toHaveBeenCalledWith(mockFile, 'talent-id');
    });

    it('should throw NotFoundException if talent not found', async () => {
      mockPrismaService.talent.findUnique.mockResolvedValue(null);

      await expect(service.uploadCV('non-existent-id', mockFile)).rejects.toThrow(NotFoundException);
      expect(mockFilesService.uploadCV).not.toHaveBeenCalled();
    });
  });

  describe('findAll - edge cases', () => {
    it('should handle empty results', async () => {
      const query: TalentQueryDto = { page: 1, limit: 10 };
      mockPrismaService.talent.findMany.mockResolvedValue([]);
      mockPrismaService.talent.count.mockResolvedValue(0);

      const result = await service.findAll(query);

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
      expect(result.pagination.hasNext).toBe(false);
      expect(result.pagination.hasPrev).toBe(false);
    });

    it('should handle pagination with hasNext and hasPrev', async () => {
      const query: TalentQueryDto = { page: 2, limit: 10 };
      const mockTalents = Array(10).fill({ id: 'talent', name: 'Test' });
      mockPrismaService.talent.findMany.mockResolvedValue(mockTalents);
      mockPrismaService.talent.count.mockResolvedValue(25);

      const result = await service.findAll(query);

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.total).toBe(25);
      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrev).toBe(true);
    });

    it('should handle multiple filters combined', async () => {
      const query: TalentQueryDto = {
        status: 'APPROVED' as any,
        category: 'ITO' as any,
        skills: 'JavaScript,TypeScript',
        search: 'developer',
      };
      mockPrismaService.talent.findMany.mockResolvedValue([]);
      mockPrismaService.talent.count.mockResolvedValue(0);

      await service.findAll(query);

      expect(mockPrismaService.talent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'APPROVED',
            serviceCategory: 'ITO',
            skills: { hasSome: ['JavaScript', 'TypeScript'] },
            OR: expect.any(Array),
          }),
        }),
      );
    });

    it('should sort by experienceLevel', async () => {
      const query: TalentQueryDto = { sortBy: 'experienceLevel', sortOrder: 'asc' };
      mockPrismaService.talent.findMany.mockResolvedValue([]);
      mockPrismaService.talent.count.mockResolvedValue(0);

      await service.findAll(query);

      expect(mockPrismaService.talent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { experienceLevel: 'asc' },
        }),
      );
    });
  });
});

