import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Context } from 'grammy';
import { Redis } from 'ioredis';
import { rateLimitMiddleware } from './rate-limit';

// Mock ioredis
vi.mock('ioredis');

describe('rateLimitMiddleware', () => {
  let mockRedis: any;
  let mockContext: Partial<Context>;
  let mockNext: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockRedis = {
      incr: vi.fn(),
      expire: vi.fn(),
    };

    mockContext = {
      from: {
        id: 123456789,
        username: 'testuser',
        is_bot: false,
        first_name: 'Test',
      },
      reply: vi.fn(),
    };

    mockNext = vi.fn().mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should allow request when under rate limit', async () => {
    mockRedis.incr.mockResolvedValue(5); // Under limit of 15
    mockRedis.expire.mockResolvedValue(1);

    const middleware = rateLimitMiddleware(mockRedis as Redis);
    await middleware(mockContext as Context, mockNext);

    expect(mockRedis.incr).toHaveBeenCalledWith('ratelimit:123456789');
    // expire is only called when current === 1, so with 5 it shouldn't be called
    expect(mockNext).toHaveBeenCalled();
    expect(mockContext.reply).not.toHaveBeenCalled();
  });

  it('should set expiration on first message', async () => {
    mockRedis.incr.mockResolvedValue(1); // First message
    mockRedis.expire.mockResolvedValue(1);

    const middleware = rateLimitMiddleware(mockRedis as Redis);
    await middleware(mockContext as Context, mockNext);

    expect(mockRedis.incr).toHaveBeenCalledWith('ratelimit:123456789');
    expect(mockRedis.expire).toHaveBeenCalledWith('ratelimit:123456789', 3600);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should not set expiration on subsequent messages', async () => {
    mockRedis.incr.mockResolvedValue(2); // Second message
    mockRedis.expire.mockResolvedValue(1);

    const middleware = rateLimitMiddleware(mockRedis as Redis);
    await middleware(mockContext as Context, mockNext);

    expect(mockRedis.incr).toHaveBeenCalledWith('ratelimit:123456789');
    expect(mockRedis.expire).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });

  it('should block request when rate limit exceeded', async () => {
    mockRedis.incr.mockResolvedValue(16); // Over limit of 15

    const middleware = rateLimitMiddleware(mockRedis as Redis);
    await middleware(mockContext as Context, mockNext);

    expect(mockRedis.incr).toHaveBeenCalledWith('ratelimit:123456789');
    expect(mockContext.reply).toHaveBeenCalledWith(
      expect.stringContaining('Rate limit exceeded')
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should allow request when exactly at rate limit', async () => {
    mockRedis.incr.mockResolvedValue(15); // Exactly at limit

    const middleware = rateLimitMiddleware(mockRedis as Redis);
    await middleware(mockContext as Context, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockContext.reply).not.toHaveBeenCalled();
  });

  it('should skip rate limiting if no user ID', async () => {
    const contextWithoutUser = {
      ...mockContext,
      from: undefined,
    };

    const middleware = rateLimitMiddleware(mockRedis as Redis);
    await middleware(contextWithoutUser as Context, mockNext);

    expect(mockRedis.incr).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });

  it('should allow request if Redis fails', async () => {
    mockRedis.incr.mockRejectedValue(new Error('Redis connection failed'));

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const middleware = rateLimitMiddleware(mockRedis as Redis);
    await middleware(mockContext as Context, mockNext);

    expect(mockNext).toHaveBeenCalled(); // Should still allow request
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Rate limiting error:',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  it('should use correct rate limit key format', async () => {
    mockRedis.incr.mockResolvedValue(1);
    mockRedis.expire.mockResolvedValue(1);

    const middleware = rateLimitMiddleware(mockRedis as Redis);
    await middleware(mockContext as Context, mockNext);

    expect(mockRedis.incr).toHaveBeenCalledWith('ratelimit:123456789');
  });

  it('should handle different user IDs correctly', async () => {
    mockRedis.incr.mockResolvedValue(1);
    mockRedis.expire.mockResolvedValue(1);

    const context1 = {
      ...mockContext,
      from: { ...mockContext.from!, id: 111111111 },
    };
    const context2 = {
      ...mockContext,
      from: { ...mockContext.from!, id: 222222222 },
    };

    const middleware = rateLimitMiddleware(mockRedis as Redis);
    await middleware(context1 as Context, mockNext);
    await middleware(context2 as Context, mockNext);

    expect(mockRedis.incr).toHaveBeenCalledWith('ratelimit:111111111');
    expect(mockRedis.incr).toHaveBeenCalledWith('ratelimit:222222222');
  });
});

