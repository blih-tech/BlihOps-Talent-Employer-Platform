import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Bot } from 'grammy';
import { Redis } from 'ioredis';
import { setupSession, SessionData } from './session';

// Mock ioredis
vi.mock('ioredis');

// Mock grammy session
vi.mock('grammy', async () => {
  const actual = await vi.importActual('grammy');
  return {
    ...actual,
    session: vi.fn(),
  };
});

describe('Session Middleware', () => {
  let mockBot: Partial<Bot>;
  let mockRedis: any;
  let sessionConfig: any;
  let mockSession: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    mockRedis = {
      get: vi.fn(),
      setex: vi.fn(),
      del: vi.fn(),
    };

    mockBot = {
      use: vi.fn(),
    };

    // Get the mocked session function
    const grammy = await import('grammy');
    mockSession = grammy.session as any;

    // Capture the session config when it's called
    mockSession.mockImplementation((config: any) => {
      sessionConfig = config;
      return vi.fn();
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    sessionConfig = undefined;
  });

  it('should setup session middleware', async () => {
    setupSession(mockBot as Bot, mockRedis as Redis);

    expect(mockBot.use).toHaveBeenCalled();
    expect(mockSession).toHaveBeenCalled();
  });

  it('should configure session storage with Redis', async () => {
    setupSession(mockBot as Bot, mockRedis as Redis);

    expect(sessionConfig).toBeDefined();
    expect(sessionConfig.storage).toBeDefined();
    expect(sessionConfig.initial).toBeDefined();
  });

  it('should read session from Redis', async () => {
    setupSession(mockBot as Bot, mockRedis as Redis);

    const sessionData: SessionData = {
      role: 'admin',
      state: 'creating_job',
      data: { step: 1 },
    };

    mockRedis.get.mockResolvedValue(JSON.stringify(sessionData));

    const result = await sessionConfig.storage.read('test-key');

    expect(mockRedis.get).toHaveBeenCalledWith('session:test-key');
    expect(result).toEqual(sessionData);
  });

  it('should return undefined when session not found', async () => {
    setupSession(mockBot as Bot, mockRedis as Redis);
    mockRedis.get.mockResolvedValue(null);

    const result = await sessionConfig.storage.read('non-existent-key');

    expect(result).toBeUndefined();
  });

  it('should handle Redis read errors gracefully', async () => {
    setupSession(mockBot as Bot, mockRedis as Redis);
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockRedis.get.mockRejectedValue(new Error('Redis error'));

    const result = await sessionConfig.storage.read('test-key');

    expect(result).toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to read session test-key:',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  it('should write session to Redis with TTL', async () => {
    setupSession(mockBot as Bot, mockRedis as Redis);
    const sessionData: SessionData = {
      role: 'talent',
      state: 'onboarding',
    };

    mockRedis.setex.mockResolvedValue('OK');

    await sessionConfig.storage.write('test-key', sessionData);

    expect(mockRedis.setex).toHaveBeenCalledWith(
      'session:test-key',
      7200, // 2 hours
      JSON.stringify(sessionData)
    );
  });

  it('should handle Redis write errors gracefully', async () => {
    setupSession(mockBot as Bot, mockRedis as Redis);
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockRedis.setex.mockRejectedValue(new Error('Redis write error'));

    await sessionConfig.storage.write('test-key', { role: 'admin' });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to write session test-key:',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  it('should delete session from Redis', async () => {
    setupSession(mockBot as Bot, mockRedis as Redis);
    mockRedis.del.mockResolvedValue(1);

    await sessionConfig.storage.delete('test-key');

    expect(mockRedis.del).toHaveBeenCalledWith('session:test-key');
  });

  it('should handle Redis delete errors gracefully', async () => {
    setupSession(mockBot as Bot, mockRedis as Redis);
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockRedis.del.mockRejectedValue(new Error('Redis delete error'));

    await sessionConfig.storage.delete('test-key');

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to delete session test-key:',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  it('should initialize empty session', async () => {
    setupSession(mockBot as Bot, mockRedis as Redis);

    const initial = sessionConfig.initial();

    expect(initial).toEqual({});
  });

  it('should use correct session key format', async () => {
    setupSession(mockBot as Bot, mockRedis as Redis);

    await sessionConfig.storage.read('user-123');

    expect(mockRedis.get).toHaveBeenCalledWith('session:user-123');
  });
});
