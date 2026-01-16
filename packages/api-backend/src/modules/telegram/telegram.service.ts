import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
  private readonly botToken: string;
  private readonly telegramApiUrl = 'https://api.telegram.org/bot';

  constructor(private configService: ConfigService) {
    this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN', '');
    if (!this.botToken) {
      this.logger.warn('TELEGRAM_BOT_TOKEN not configured. Channel publishing will not work.');
    }
  }

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

  /**
   * Send message to Telegram channel
   * @param channelId - Telegram channel ID (e.g., -1002985721031)
   * @param message - Message text to send
   * @param parseMode - Optional parse mode (Markdown, HTML)
   * @returns Message ID if successful, null if failed
   */
  async sendMessageToChannel(
    channelId: string,
    message: string,
    parseMode?: 'Markdown' | 'MarkdownV2' | 'HTML',
  ): Promise<number | null> {
    if (!this.botToken) {
      this.logger.error('Cannot send message: TELEGRAM_BOT_TOKEN not configured');
      return null;
    }

    try {
      const url = `${this.telegramApiUrl}${this.botToken}/sendMessage`;
      const payload: any = {
        chat_id: channelId,
        text: message,
      };

      if (parseMode) {
        payload.parse_mode = parseMode;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json() as { ok: boolean; description?: string; result?: { message_id: number } };

      if (!response.ok || !data.ok) {
        this.logger.error(
          `Failed to send message to channel ${channelId}: ${data.description || response.statusText}`,
        );
        return null;
      }

      this.logger.log(`Successfully sent message to channel ${channelId}. Message ID: ${data.result?.message_id}`);
      return data.result?.message_id || null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error sending message to channel ${channelId}:`, errorMessage);
      return null;
    }
  }

  /**
   * Send message to Jobs channel
   * @param message - Message text to send
   * @returns Message ID if successful, null if failed
   */
  async sendMessageToJobsChannel(message: string): Promise<number | null> {
    const channelId =
      this.configService.get<string>('TELEGRAM_CHANNEL_ID_JOBS', '-1002985721031');
    return this.sendMessageToChannel(channelId, message, 'Markdown');
  }

  /**
   * Send message to Talents channel
   * @param message - Message text to send
   * @returns Message ID if successful, null if failed
   */
  async sendMessageToTalentsChannel(message: string): Promise<number | null> {
    const channelId =
      this.configService.get<string>('TELEGRAM_CHANNEL_ID_TALENTS', '-1003451753461');
    return this.sendMessageToChannel(channelId, message, 'Markdown');
  }
}



