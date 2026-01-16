import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MatchingService {
  constructor(private prisma: PrismaService) {}

  async findMatchingTalentsForJob(jobId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    // TODO: Implement matching algorithm
    return [];
  }

  async findMatchingJobsForTalent(talentId: string) {
    const talent = await this.prisma.talent.findUnique({
      where: { id: talentId },
    });

    if (!talent) {
      throw new NotFoundException(`Talent with ID ${talentId} not found`);
    }

    // TODO: Implement matching algorithm
    return [];
  }
}
