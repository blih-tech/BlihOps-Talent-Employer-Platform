import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

/**
 * Express middleware to protect BullMQ Board routes
 * Requires JWT Bearer token in Authorization header
 * 
 * TODO: Replace with NestJS guards when JwtAuthGuard and RolesGuard are implemented
 * This middleware can be removed and replaced with:
 * app.use('/admin/queues', 
 *   (req, res, next) => {
 *     // Use NestJS guards via adapter
 *   },
 *   serverAdapter.getRouter()
 * );
 */
export function createBullBoardAuthMiddleware(configService: ConfigService) {
  return (req: Request, res: Response, next: NextFunction) => {
    const isDevelopment = configService.get('NODE_ENV') === 'development';
    const jwtSecret = configService.get<string>('JWT_SECRET');

    // In development without JWT_SECRET, allow access (for testing)
    // TODO: Remove this when auth is fully implemented
    if (isDevelopment && !jwtSecret) {
      console.warn('⚠️  BullMQ Board is accessible without authentication in development mode');
      console.warn('⚠️  Set JWT_SECRET to enable authentication');
      return next();
    }

    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        statusCode: 401,
        message: 'Unauthorized - Bearer token required',
        error: 'Authentication required to access BullMQ Board',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // If no JWT_SECRET is set, reject (except in dev mode which is handled above)
    if (!jwtSecret) {
      return res.status(500).json({
        statusCode: 500,
        message: 'Server configuration error - JWT_SECRET not set',
      });
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, jwtSecret) as any;

      // Check if user has admin role
      // TODO: Enhance this when proper role system is implemented
      if (decoded.role && decoded.role !== 'admin' && decoded.role !== 'ADMIN') {
        return res.status(403).json({
          statusCode: 403,
          message: 'Forbidden - Admin access required',
          error: 'Only administrators can access BullMQ Board',
        });
      }

      // Attach user info to request for potential future use
      (req as any).user = decoded;

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          statusCode: 401,
          message: 'Unauthorized - Invalid token',
          error: error.message,
        });
      }

      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          statusCode: 401,
          message: 'Unauthorized - Token expired',
          error: 'Token has expired. Please refresh your token.',
        });
      }

      return res.status(401).json({
        statusCode: 401,
        message: 'Unauthorized - Token verification failed',
        error: 'Failed to verify authentication token',
      });
    }
  };
}


