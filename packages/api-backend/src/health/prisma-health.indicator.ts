import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Check if Prisma is connected by trying to execute a simple query
      // Use $executeRawUnsafe as it's more compatible with different Prisma setups
      await this.prisma.$executeRawUnsafe('SELECT 1');
      return this.getStatus(key, true);
    } catch (error) {
      // If that fails, try to check connection status
      try {
        // Try to connect if not already connected
        await this.prisma.$connect();
        return this.getStatus(key, true);
      } catch (connectError) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new HealthCheckError(
          'Prisma health check failed',
          this.getStatus(key, false, { message }),
        );
      }
    }
  }
}

