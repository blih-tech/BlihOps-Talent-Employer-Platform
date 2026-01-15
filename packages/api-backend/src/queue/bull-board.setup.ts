import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bull';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createBullBoardAuthMiddleware } from './bull-board-auth.middleware';

/**
 * Sets up BullMQ Board for queue monitoring
 * @param app - NestJS application instance
 * @param queues - Array of Bull queues to monitor
 * @param configService - ConfigService instance for accessing environment variables
 * 
 * The board is protected with JWT authentication middleware (admin only).
 * In development mode without JWT_SECRET, access is allowed with a warning.
 */
export function setupBullBoard(
  app: INestApplication,
  queues: Queue[],
  configService: ConfigService,
) {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  createBullBoard({
    queues: queues.map((queue) => new BullAdapter(queue)),
    serverAdapter,
  });

  // Create authentication middleware
  const authMiddleware = createBullBoardAuthMiddleware(configService);

  // Mount the Bull Board router with authentication
  app.use('/admin/queues', authMiddleware, serverAdapter.getRouter());
}
