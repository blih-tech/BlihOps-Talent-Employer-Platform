import { BaseException } from './base.exception';

/**
 * HTTP 400 Bad Request Exception
 */
export class BadRequestException extends BaseException {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'BAD_REQUEST', 400, context);
  }
}

/**
 * HTTP 401 Unauthorized Exception
 */
export class UnauthorizedException extends BaseException {
  constructor(message: string = 'Unauthorized', context?: Record<string, unknown>) {
    super(message, 'UNAUTHORIZED', 401, context);
  }
}

/**
 * HTTP 403 Forbidden Exception
 */
export class ForbiddenException extends BaseException {
  constructor(message: string = 'Forbidden', context?: Record<string, unknown>) {
    super(message, 'FORBIDDEN', 403, context);
  }
}

/**
 * HTTP 404 Not Found Exception
 */
export class NotFoundException extends BaseException {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'NOT_FOUND', 404, context);
  }
}

/**
 * HTTP 409 Conflict Exception
 */
export class ConflictException extends BaseException {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'CONFLICT', 409, context);
  }
}

/**
 * HTTP 422 Unprocessable Entity Exception
 */
export class UnprocessableEntityException extends BaseException {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'UNPROCESSABLE_ENTITY', 422, context);
  }
}

/**
 * HTTP 500 Internal Server Error Exception
 */
export class InternalServerErrorException extends BaseException {
  constructor(message: string = 'Internal Server Error', context?: Record<string, unknown>) {
    super(message, 'INTERNAL_SERVER_ERROR', 500, context);
  }
}

/**
 * HTTP 503 Service Unavailable Exception
 */
export class ServiceUnavailableException extends BaseException {
  constructor(message: string = 'Service Unavailable', context?: Record<string, unknown>) {
    super(message, 'SERVICE_UNAVAILABLE', 503, context);
  }
}

