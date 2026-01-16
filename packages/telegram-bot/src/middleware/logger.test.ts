import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Context } from 'grammy';
import { loggerMiddleware } from './logger';

describe('loggerMiddleware', () => {
  let mockContext: Partial<Context>;
  let mockNext: ReturnType<typeof vi.fn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    mockContext = {
      from: {
        id: 123456789,
        username: 'testuser',
        is_bot: false,
        first_name: 'Test',
      },
      chat: {
        id: 123456789,
        type: 'private',
      },
      message: {
        message_id: 1,
        date: Date.now(),
        text: '/start',
        entities: [
          {
            type: 'bot_command',
            offset: 0,
            length: 6,
          },
        ],
      },
    };

    mockNext = vi.fn().mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
    consoleLogSpy.mockRestore();
  });

  it('should log text messages', async () => {
    const middleware = loggerMiddleware();
    await middleware(mockContext as Context, mockNext);

    expect(consoleLogSpy).toHaveBeenCalled();
    expect(consoleLogSpy.mock.calls[0][0]).toContain('[BOT] TEXT');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should log document messages', async () => {
    const documentContext = {
      ...mockContext,
      message: {
        ...mockContext.message!,
        text: undefined,
        document: {
          file_id: 'doc-123',
          file_name: 'cv.pdf',
          mime_type: 'application/pdf',
        },
      },
    };

    const middleware = loggerMiddleware();
    await middleware(documentContext as Context, mockNext);

    expect(consoleLogSpy).toHaveBeenCalled();
    expect(consoleLogSpy.mock.calls[0][0]).toContain('[BOT] DOCUMENT');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should log photo messages', async () => {
    const photoContext = {
      ...mockContext,
      message: {
        ...mockContext.message!,
        text: undefined,
        photo: [
          {
            file_id: 'photo-123',
            width: 100,
            height: 100,
          },
        ],
      },
    };

    const middleware = loggerMiddleware();
    await middleware(photoContext as Context, mockNext);

    expect(consoleLogSpy).toHaveBeenCalled();
    expect(consoleLogSpy.mock.calls[0][0]).toContain('[BOT] PHOTO');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should log other message types', async () => {
    const otherContext = {
      ...mockContext,
      message: {
        ...mockContext.message!,
        text: undefined,
        video: {
          file_id: 'video-123',
        },
      },
    };

    const middleware = loggerMiddleware();
    await middleware(otherContext as Context, mockNext);

    expect(consoleLogSpy).toHaveBeenCalled();
    expect(consoleLogSpy.mock.calls[0][0]).toContain('[BOT] OTHER');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should log callback queries', async () => {
    const callbackContext = {
      ...mockContext,
      message: undefined,
      callbackQuery: {
        id: 'callback-123',
        from: mockContext.from,
        data: 'button_clicked',
        chat_instance: 'chat-123',
      },
    };

    const middleware = loggerMiddleware();
    await middleware(callbackContext as Context, mockNext);

    expect(consoleLogSpy).toHaveBeenCalled();
    expect(consoleLogSpy.mock.calls[0][0]).toContain('[BOT] CALLBACK_QUERY');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should truncate long messages', async () => {
    const longTextContext = {
      ...mockContext,
      message: {
        ...mockContext.message!,
        text: 'a'.repeat(200), // 200 characters
      },
    };

    const middleware = loggerMiddleware();
    await middleware(longTextContext as Context, mockNext);

    const logCall = consoleLogSpy.mock.calls[0];
    const logData = logCall[1];
    expect(logData.text).toHaveLength(100); // Truncated to 100
    expect(mockNext).toHaveBeenCalled();
  });

  it('should include user information in logs', async () => {
    const middleware = loggerMiddleware();
    await middleware(mockContext as Context, mockNext);

    const logCall = consoleLogSpy.mock.calls[0];
    const logData = logCall[1];
    expect(logData.userId).toBe(123456789);
    expect(logData.username).toBe('testuser');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle missing username', async () => {
    const contextWithoutUsername = {
      ...mockContext,
      from: {
        ...mockContext.from!,
        username: undefined,
      },
    };

    const middleware = loggerMiddleware();
    await middleware(contextWithoutUsername as Context, mockNext);

    const logCall = consoleLogSpy.mock.calls[0];
    const logData = logCall[1];
    expect(logData.username).toBe('unknown');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should include timestamp in logs', async () => {
    const middleware = loggerMiddleware();
    await middleware(mockContext as Context, mockNext);

    const logCall = consoleLogSpy.mock.calls[0];
    const logData = logCall[1];
    expect(logData.timestamp).toBeDefined();
    expect(new Date(logData.timestamp).getTime()).toBeGreaterThan(0);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should always call next', async () => {
    const middleware = loggerMiddleware();
    await middleware(mockContext as Context, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle contexts without messages or callbacks', async () => {
    const emptyContext = {
      ...mockContext,
      message: undefined,
      callbackQuery: undefined,
    };

    const middleware = loggerMiddleware();
    await middleware(emptyContext as Context, mockNext);

    // Should still call next even if nothing to log
    expect(mockNext).toHaveBeenCalled();
  });
});


