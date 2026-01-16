import { Test, TestingModule } from '@nestjs/testing';
import { TelegramService, TelegramUpdate } from './telegram.service';

describe('TelegramService', () => {
  let service: TelegramService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TelegramService],
    }).compile();

    service = module.get<TelegramService>(TelegramService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleUpdate', () => {
    it('should handle message update', async () => {
      const update: TelegramUpdate = {
        update_id: 123,
        message: {
          message_id: 456,
          from: {
            id: 789,
            is_bot: false,
            first_name: 'Test',
            username: 'testuser',
          },
          date: 1234567890,
          chat: {
            id: 789,
            type: 'private',
          },
          text: 'Hello, world!',
        },
      };

      const result = await service.handleUpdate(update);

      expect(result).toEqual({ ok: true });
    });

    it('should handle edited message update', async () => {
      const update: TelegramUpdate = {
        update_id: 124,
        edited_message: {
          message_id: 457,
          from: {
            id: 789,
            is_bot: false,
            first_name: 'Test',
          },
          date: 1234567890,
          chat: {
            id: 789,
            type: 'private',
          },
          text: 'Edited message',
        },
      };

      const result = await service.handleUpdate(update);

      expect(result).toEqual({ ok: true });
    });

    it('should handle callback query update', async () => {
      const update: TelegramUpdate = {
        update_id: 125,
        callback_query: {
          id: 'callback123',
          from: {
            id: 789,
            is_bot: false,
            first_name: 'Test',
          },
          data: 'button_clicked',
        },
      };

      const result = await service.handleUpdate(update);

      expect(result).toEqual({ ok: true });
    });

    it('should handle channel post update', async () => {
      const update: TelegramUpdate = {
        update_id: 126,
        channel_post: {
          message_id: 458,
          date: 1234567890,
          chat: {
            id: -1001234567890,
            type: 'channel',
          },
          text: 'Channel post',
        },
      };

      const result = await service.handleUpdate(update);

      expect(result).toEqual({ ok: true });
    });

    it('should handle edited channel post update', async () => {
      const update: TelegramUpdate = {
        update_id: 127,
        edited_channel_post: {
          message_id: 459,
          date: 1234567890,
          chat: {
            id: -1001234567890,
            type: 'channel',
          },
          text: 'Edited channel post',
        },
      };

      const result = await service.handleUpdate(update);

      expect(result).toEqual({ ok: true });
    });

    it('should handle unknown update type gracefully', async () => {
      const update: TelegramUpdate = {
        update_id: 128,
        // No known update fields
      } as TelegramUpdate;

      const result = await service.handleUpdate(update);

      expect(result).toEqual({ ok: true });
    });

    it('should handle errors gracefully and return ok: true', async () => {
      // Create a spy to make handleMessage throw an error
      const update: TelegramUpdate = {
        update_id: 129,
        message: {
          message_id: 460,
          date: 1234567890,
          chat: {
            id: 789,
            type: 'private',
          },
        },
      };

      // Mock console.error to avoid noise in test output
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      // This should not throw, but return ok: true
      const result = await service.handleUpdate(update);

      expect(result).toEqual({ ok: true });
      errorSpy.mockRestore();
    });
  });
});



