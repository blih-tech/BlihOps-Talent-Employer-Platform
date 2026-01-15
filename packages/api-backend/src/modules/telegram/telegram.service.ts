import { Injectable, Logger } from '@nestjs/common';

/**
 * Telegram webhook update types
 * Based on Telegram Bot API: https://core.telegram.org/bots/api#update
 */
export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
  channel_post?: TelegramMessage;
  edited_channel_post?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
  // Add more update types as needed
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  date: number;
  chat: TelegramChat;
  text?: string;
  // Add more message fields as needed
}

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
}

export interface TelegramChat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
}

export interface TelegramCallbackQuery {
  id: string;
  from: TelegramUser;
  message?: TelegramMessage;
  data?: string;
}

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  /**
   * Handle incoming Telegram webhook update
   * Routes the update to appropriate handler based on update type
   */
  async handleUpdate(update: TelegramUpdate): Promise<{ ok: boolean }> {
    try {
      this.logger.debug(`Received update: ${update.update_id}`);

      // Route update to appropriate handler
      if (update.message) {
        return await this.handleMessage(update.message);
      }

      if (update.edited_message) {
        return await this.handleEditedMessage(update.edited_message);
      }

      if (update.callback_query) {
        return await this.handleCallbackQuery(update.callback_query);
      }

      if (update.channel_post) {
        return await this.handleChannelPost(update.channel_post);
      }

      if (update.edited_channel_post) {
        return await this.handleEditedChannelPost(update.edited_channel_post);
      }

      // Unknown update type - log but don't fail
      this.logger.warn(`Unknown update type for update_id: ${update.update_id}`);
      return { ok: true };
    } catch (error) {
      this.logger.error(`Error handling update ${update.update_id}:`, error);
      // Return ok: true to prevent Telegram from retrying
      // Actual error handling should be done via monitoring/alerting
      return { ok: true };
    }
  }

  /**
   * Handle incoming message
   * This will be expanded when bot is implemented
   */
  private async handleMessage(message: TelegramMessage): Promise<{ ok: boolean }> {
    this.logger.log(
      `Received message from user ${message.from?.id} in chat ${message.chat.id}: ${message.text || '(no text)'}`,
    );
    // TODO: Process message when bot is implemented
    return { ok: true };
  }

  /**
   * Handle edited message
   */
  private async handleEditedMessage(message: TelegramMessage): Promise<{ ok: boolean }> {
    this.logger.debug(`Received edited message: ${message.message_id}`);
    // TODO: Process edited message when bot is implemented
    return { ok: true };
  }

  /**
   * Handle callback query (button clicks)
   */
  private async handleCallbackQuery(callbackQuery: TelegramCallbackQuery): Promise<{ ok: boolean }> {
    this.logger.debug(`Received callback query: ${callbackQuery.id}`);
    // TODO: Process callback query when bot is implemented
    return { ok: true };
  }

  /**
   * Handle channel post
   */
  private async handleChannelPost(message: TelegramMessage): Promise<{ ok: boolean }> {
    this.logger.debug(`Received channel post: ${message.message_id}`);
    // TODO: Process channel post when bot is implemented
    return { ok: true };
  }

  /**
   * Handle edited channel post
   */
  private async handleEditedChannelPost(message: TelegramMessage): Promise<{ ok: boolean }> {
    this.logger.debug(`Received edited channel post: ${message.message_id}`);
    // TODO: Process edited channel post when bot is implemented
    return { ok: true };
  }
}


