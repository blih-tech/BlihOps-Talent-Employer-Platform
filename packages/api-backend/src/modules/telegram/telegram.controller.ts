import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiExcludeEndpoint, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { TelegramService, TelegramUpdate } from './telegram.service';
import { TelegramWebhookDto } from './dto/telegram-webhook.dto';

@ApiTags('telegram')
@Controller('telegram')
@UseGuards(ThrottlerGuard)
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint() // Hide from Swagger (internal endpoint)
  @ApiOperation({
    summary: 'Telegram webhook endpoint',
    description: 'Receives updates from Telegram Bot API. This endpoint is protected by secret token verification and rate limiting.',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid webhook secret token',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests - rate limit exceeded',
  })
  @Throttle({ default: { limit: 100, ttl: 60000 } }) // 100 requests per minute
  async handleWebhook(
    @Body() update: TelegramWebhookDto,
    @Headers('x-telegram-bot-api-secret-token') secretToken: string,
  ): Promise<{ ok: boolean }> {
    // Verify webhook secret
    const expectedToken = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (!expectedToken) {
      throw new UnauthorizedException('Webhook secret not configured');
    }

    if (secretToken !== expectedToken) {
      throw new UnauthorizedException('Invalid webhook secret');
    }

    // Process webhook update
    // Note: Update structure validation is handled by DTO validation pipe
    return this.telegramService.handleUpdate(update as TelegramUpdate);
  }
}

