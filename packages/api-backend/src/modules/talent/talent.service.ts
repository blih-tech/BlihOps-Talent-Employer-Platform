import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTalentDto } from './dto/create-talent.dto';
import { UpdateTalentDto } from './dto/update-talent.dto';
import { TalentQueryDto } from './dto/talent-query.dto';
import { Prisma } from '@prisma/client';
import { QUEUE_NAMES } from '../../queue/queue.config';
import { FilesService } from '../files/files.service';

@Injectable()
export class TalentService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue(QUEUE_NAMES.PUBLISH_TALENT) private publishTalentQueue: Queue,
    private filesService: FilesService,
  ) {}

  async create(dto: CreateTalentDto) {
    // Check if talent with this telegramId already exists
    const existing = await this.prisma.talent.findUnique({
      where: { telegramId: dto.telegramId.toString() },
    });

    if (existing) {
      throw new ConflictException(`Talent with Telegram ID ${dto.telegramId} already exists`);
    }

    // Map DTO to Prisma schema
    // Store additional fields in metadata
    const metadata: any = {};
    if (dto.roleSpecialization) metadata.roleSpecialization = dto.roleSpecialization;
    if (dto.availability) metadata.availability = dto.availability;
    if (dto.engagementPreference) metadata.engagementPreference = dto.engagementPreference;
    if (dto.cvFileId) metadata.cvFileId = dto.cvFileId;
    if (dto.consentForPublicVisibility !== undefined) {
      metadata.consentForPublicVisibility = dto.consentForPublicVisibility;
    }

    return this.prisma.talent.create({
      data: {
        telegramId: dto.telegramId.toString(),
        name: dto.name,
        serviceCategory: dto.serviceCategory as any, // Map from shared enum to Prisma enum
        skills: dto.skills,
        experienceLevel: dto.experienceLevel as any, // Map from shared enum to Prisma enum
        bio: dto.roleSpecialization, // Use roleSpecialization as bio if available
        status: 'PENDING',
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      },
    });
  }

  async findAll(query: TalentQueryDto) {
    const { page = 1, limit = 20, status, category, skills, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.TalentWhereInput = {};

    if (status) {
      // Status is now a TalentStatus enum from Prisma
      where.status = status;
    }

    if (category) {
      where.serviceCategory = category as any;
    }

    if (skills) {
      // Filter by skills (array contains any of the provided skills)
      const skillArray = skills.split(',').map(s => s.trim());
      where.skills = {
        hasSome: skillArray,
      };
    }

    if (search) {
      // Search in name and skills
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { skills: { hasSome: [search] } },
        { bio: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy
    const orderBy: Prisma.TalentOrderByWithRelationInput = {};
    if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else if (sortBy === 'experienceLevel') {
      orderBy.experienceLevel = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const [talents, total] = await Promise.all([
      this.prisma.talent.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          applications: {
            select: {
              id: true,
              status: true,
              matchScore: true,
            },
          },
        },
      }),
      this.prisma.talent.count({ where }),
    ]);

    return {
      data: talents,
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
    const talent = await this.prisma.talent.findUnique({
      where: { id },
      include: {
        applications: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!talent) {
      throw new NotFoundException(`Talent with ID ${id} not found`);
    }

    return talent;
  }

  async update(id: string, dto: UpdateTalentDto) {
    // Check if talent exists
    await this.findOne(id);

    // Build update data
    const updateData: Prisma.TalentUpdateInput = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.serviceCategory !== undefined) updateData.serviceCategory = dto.serviceCategory as any;
    if (dto.skills !== undefined) updateData.skills = dto.skills;
    if (dto.experienceLevel !== undefined) updateData.experienceLevel = dto.experienceLevel as any;
    // bio can be updated via roleSpecialization in metadata

    // Handle metadata updates
    if (dto.roleSpecialization !== undefined || 
        dto.availability !== undefined || 
        dto.engagementPreference !== undefined ||
        dto.cvFileId !== undefined ||
        dto.consentForPublicVisibility !== undefined) {
      // Get current talent to merge metadata
      const current = await this.prisma.talent.findUnique({
        where: { id },
        select: { metadata: true },
      });

      const currentMetadata = (current?.metadata as any) || {};
      const newMetadata = { ...currentMetadata };

      if (dto.roleSpecialization !== undefined) newMetadata.roleSpecialization = dto.roleSpecialization;
      if (dto.availability !== undefined) newMetadata.availability = dto.availability;
      if (dto.engagementPreference !== undefined) newMetadata.engagementPreference = dto.engagementPreference;
      if (dto.cvFileId !== undefined) newMetadata.cvFileId = dto.cvFileId;
      if (dto.consentForPublicVisibility !== undefined) {
        newMetadata.consentForPublicVisibility = dto.consentForPublicVisibility;
      }

      updateData.metadata = newMetadata;
    }

    return this.prisma.talent.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    // Soft delete by setting status to INACTIVE
    await this.findOne(id);
    
    return this.prisma.talent.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }

  async approve(id: string, adminId?: string) {
    const talent = await this.findOne(id);

    if (talent.status === 'APPROVED') {
      throw new ConflictException('Talent is already approved');
    }

    // Update talent status
    const updatedTalent = await this.prisma.talent.update({
      where: { id },
      data: { status: 'APPROVED' },
    });

    // Create audit log if adminId is provided
    if (adminId) {
      await this.prisma.auditLog.create({
        data: {
          adminId,
          action: 'APPROVE_TALENT',
          resourceType: 'TALENT',
          resourceId: id,
          metadata: {
            talentName: talent.name,
            telegramId: talent.telegramId,
          },
        },
      });
    }

    // Enqueue publish job to publish talent to Telegram channel
    await this.publishTalentQueue.add({ talentId: id });

    return updatedTalent;
  }

  async reject(id: string, reason?: string, adminId?: string) {
    const talent = await this.findOne(id);

    if (talent.status === 'REJECTED') {
      throw new ConflictException('Talent is already rejected');
    }

    const updatedTalent = await this.prisma.talent.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    // Create audit log if adminId is provided
    if (adminId) {
      await this.prisma.auditLog.create({
        data: {
          adminId,
          action: 'REJECT_TALENT',
          resourceType: 'TALENT',
          resourceId: id,
          metadata: {
            talentName: talent.name,
            telegramId: talent.telegramId,
            reason: reason || 'No reason provided',
          },
        },
      });
    }

    return updatedTalent;
  }

  async uploadCV(talentId: string, file: Express.Multer.File) {
    const talent = await this.findOne(talentId);

    // Delete old CV if exists
    if (talent.cvUrl) {
      await this.filesService.deleteCV(talent.cvUrl);
    }

    // Upload new CV
    const cvPath = await this.filesService.uploadCV(file, talentId);

    // Update talent record
    return this.prisma.talent.update({
      where: { id: talentId },
      data: { cvUrl: cvPath },
    });
  }
}
