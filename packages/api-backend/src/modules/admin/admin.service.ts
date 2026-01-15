import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStatistics() {
    const [
      totalTalents,
      pendingTalents,
      approvedTalents,
      totalJobs,
      pendingJobs,
      publishedJobs,
      totalApplications,
    ] = await Promise.all([
      this.prisma.talent.count(),
      this.prisma.talent.count({ where: { status: 'PENDING' } }),
      this.prisma.talent.count({ where: { status: 'APPROVED' } }),
      this.prisma.job.count(),
      this.prisma.job.count({ where: { status: 'PENDING' } }),
      this.prisma.job.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.application.count(),
    ]);

    return {
      talents: {
        total: totalTalents,
        pending: pendingTalents,
        approved: approvedTalents,
      },
      jobs: {
        total: totalJobs,
        pending: pendingJobs,
        published: publishedJobs,
      },
      applications: {
        total: totalApplications,
      },
    };
  }

  async getAnalytics() {
    // Conversion rates
    const totalTalents = await this.prisma.talent.count();
    const approvedTalents = await this.prisma.talent.count({ where: { status: 'APPROVED' } });
    const talentApprovalRate = totalTalents > 0 ? (approvedTalents / totalTalents) * 100 : 0;

    // Job analytics
    const totalJobs = await this.prisma.job.count();
    const publishedJobs = await this.prisma.job.count({ where: { status: 'PUBLISHED' } });
    const jobPublishRate = totalJobs > 0 ? (publishedJobs / totalJobs) * 100 : 0;

    // Application conversion rates
    const totalApplications = await this.prisma.application.count();
    const hiredApplications = await this.prisma.application.count({ where: { status: 'HIRED' } });
    const hireRate = totalApplications > 0 ? (hiredApplications / totalApplications) * 100 : 0;

    return {
      conversionRates: {
        talentApprovalRate: Math.round(talentApprovalRate * 100) / 100,
        jobPublishRate: Math.round(jobPublishRate * 100) / 100,
        applicationHireRate: Math.round(hireRate * 100) / 100,
      },
      // TODO: Add more analytics (time-to-hire, engagement metrics, etc.)
    };
  }

  async getKeyMetrics() {
    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      recentTalents,
      recentJobs,
      recentApplications,
    ] = await Promise.all([
      this.prisma.talent.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      this.prisma.job.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      this.prisma.application.count({ where: { appliedAt: { gte: sevenDaysAgo } } }),
    ]);

    return {
      recentActivity: {
        newTalents: recentTalents,
        newJobs: recentJobs,
        newApplications: recentApplications,
      },
    };
  }
}


