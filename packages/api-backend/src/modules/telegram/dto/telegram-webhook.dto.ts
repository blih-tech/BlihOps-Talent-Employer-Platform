import { IsNumber, ValidateNested, IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Telegram User DTO
 */
export class TelegramUserDto {
  @ApiProperty({ description: 'Unique identifier for this user' })
  @Type(() => Number)
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'True, if this user is a bot' })
  @IsBoolean()
  is_bot: boolean;

  @ApiProperty({ description: "User's first name" })
  @IsString()
  first_name: string;

  @ApiPropertyOptional({ description: "User's last name" })
  @IsOptional()
  last_name?: string;

  @ApiPropertyOptional({ description: "User's username" })
  @IsOptional()
  username?: string;
}

/**
 * Telegram Chat DTO
 */
export class TelegramChatDto {
  @ApiProperty({ description: 'Unique identifier for this chat' })
  @Type(() => Number)
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Type of chat',
    enum: ['private', 'group', 'supergroup', 'channel'],
  })
  @IsEnum(['private', 'group', 'supergroup', 'channel'])
  type: 'private' | 'group' | 'supergroup' | 'channel';
}

/**
 * Telegram Message DTO
 */
export class TelegramMessageDto {
  @ApiProperty({ description: 'Unique message identifier' })
  @Type(() => Number)
  @IsNumber()
  message_id: number;

  @ApiPropertyOptional({ description: 'Sender of the message' })
  @IsOptional()
  @ValidateNested()
  @Type(() => TelegramUserDto)
  from?: TelegramUserDto;

  @ApiProperty({ description: 'Date the message was sent in Unix time' })
  @Type(() => Number)
  @IsNumber()
  date: number;

  @ApiProperty({ description: 'Conversation the message belongs to' })
  @ValidateNested()
  @Type(() => TelegramChatDto)
  chat: TelegramChatDto;

  @ApiPropertyOptional({ description: 'Text content of the message' })
  @IsOptional()
  @IsString()
  text?: string;
}

/**
 * Telegram Callback Query DTO
 */
export class TelegramCallbackQueryDto {
  @ApiProperty({ description: 'Unique identifier for this query' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Sender of the query' })
  @ValidateNested()
  @Type(() => TelegramUserDto)
  from: TelegramUserDto;

  @ApiPropertyOptional({ description: 'Message with the callback button' })
  @IsOptional()
  @ValidateNested()
  @Type(() => TelegramMessageDto)
  message?: TelegramMessageDto;

  @ApiPropertyOptional({ description: 'Data associated with the callback button' })
  @IsOptional()
  @IsString()
  data?: string;
}

/**
 * Telegram Webhook Update DTO
 * Based on Telegram Bot API Update object
 */
export class TelegramWebhookDto {
  @ApiProperty({ description: 'The update unique identifier' })
  @Type(() => Number)
  @IsNumber()
  update_id: number;

  @ApiPropertyOptional({ description: 'New incoming message' })
  @IsOptional()
  @ValidateNested()
  @Type(() => TelegramMessageDto)
  message?: TelegramMessageDto;

  @ApiPropertyOptional({ description: 'New version of a message' })
  @IsOptional()
  @ValidateNested()
  @Type(() => TelegramMessageDto)
  edited_message?: TelegramMessageDto;

  @ApiPropertyOptional({ description: 'New incoming channel post' })
  @IsOptional()
  @ValidateNested()
  @Type(() => TelegramMessageDto)
  channel_post?: TelegramMessageDto;

  @ApiPropertyOptional({ description: 'New version of a channel post' })
  @IsOptional()
  @ValidateNested()
  @Type(() => TelegramMessageDto)
  edited_channel_post?: TelegramMessageDto;

  @ApiPropertyOptional({ description: 'New incoming callback query' })
  @IsOptional()
  @ValidateNested()
  @Type(() => TelegramCallbackQueryDto)
  callback_query?: TelegramCallbackQueryDto;
}

