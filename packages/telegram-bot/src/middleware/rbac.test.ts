import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Context } from 'grammy';
import { adminOnly, detectRole } from './rbac';
import { MyContext } from './session';

// Mock config
vi.mock('../config', () => ({
  config: {
    ADMIN_TELEGRAM_IDS: ['123456789', '987654321'],
  },
}));

describe('RBAC Middleware', () => {
  let mockContext: Partial<MyContext>;
  let mockNext: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockContext = {
      from: {
        id: 123456789,
        username: 'admin',
        is_bot: false,
        first_name: 'Admin',
      },
      session: {},
      reply: vi.fn(),
    };

    mockNext = vi.fn().mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('adminOnly', () => {
    it('should allow admin users', async () => {
      const middleware = adminOnly();
      await middleware(mockContext as MyContext, mockNext);

      expect(mockContext.session!.role).toBe('admin');
      expect(mockNext).toHaveBeenCalled();
      expect(mockContext.reply).not.toHaveBeenCalled();
    });

    it('should deny non-admin users', async () => {
      const nonAdminContext = {
        ...mockContext,
        from: {
          ...mockContext.from!,
          id: 999999999, // Not in admin list
        },
      };

      const middleware = adminOnly();
      await middleware(nonAdminContext as MyContext, mockNext);

      expect(mockContext.session!.role).toBeUndefined();
      expect(mockNext).not.toHaveBeenCalled();
      expect(nonAdminContext.reply).toHaveBeenCalledWith(
        '❌ This command is only available to admins.'
      );
    });

    it('should deny when user ID is missing', async () => {
      const contextWithoutUser = {
        ...mockContext,
        from: undefined,
      };

      const middleware = adminOnly();
      await middleware(contextWithoutUser as MyContext, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(contextWithoutUser.reply).toHaveBeenCalledWith(
        '❌ This command is only available to admins.'
      );
    });

    it('should handle string user IDs', async () => {
      const contextWithStringId = {
        ...mockContext,
        from: {
          ...mockContext.from!,
          id: 123456789, // Will be converted to string
        },
      };

      const middleware = adminOnly();
      await middleware(contextWithStringId as MyContext, mockNext);

      expect(mockContext.session!.role).toBe('admin');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should work with multiple admin IDs', async () => {
      const admin1Context = {
        ...mockContext,
        from: {
          ...mockContext.from!,
          id: 123456789,
        },
      };

      const admin2Context = {
        ...mockContext,
        from: {
          ...mockContext.from!,
          id: 987654321,
        },
      };

      const middleware = adminOnly();

      await middleware(admin1Context as MyContext, mockNext);
      expect(admin1Context.session!.role).toBe('admin');
      expect(mockNext).toHaveBeenCalledTimes(1);

      mockNext.mockClear();
      await middleware(admin2Context as MyContext, mockNext);
      expect(admin2Context.session!.role).toBe('admin');
      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('detectRole', () => {
    it('should set admin role for admin users', async () => {
      const middleware = detectRole();
      await middleware(mockContext as MyContext, mockNext);

      expect(mockContext.session!.role).toBe('admin');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should set talent role for non-admin users', async () => {
      const nonAdminContext = {
        ...mockContext,
        from: {
          ...mockContext.from!,
          id: 999999999,
        },
        session: {},
      };

      const middleware = detectRole();
      await middleware(nonAdminContext as MyContext, mockNext);

      expect(nonAdminContext.session!.role).toBe('talent');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should set talent role when user ID is missing', async () => {
      const contextWithoutUser = {
        ...mockContext,
        from: undefined,
        session: {},
      };

      const middleware = detectRole();
      await middleware(contextWithoutUser as MyContext, mockNext);

      expect(contextWithoutUser.session!.role).toBe('talent');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should always call next', async () => {
      const middleware = detectRole();
      await middleware(mockContext as MyContext, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle empty admin IDs list', async () => {
      // Test with a context that has a different user ID
      const contextWithDifferentId = {
        ...mockContext,
        from: {
          ...mockContext.from!,
          id: 999999999, // Not in admin list
        },
        session: {},
      };

      const middleware = detectRole();
      await middleware(contextWithDifferentId as MyContext, mockNext);

      expect(contextWithDifferentId.session!.role).toBe('talent');
      expect(mockNext).toHaveBeenCalled();
    });
  });
});

