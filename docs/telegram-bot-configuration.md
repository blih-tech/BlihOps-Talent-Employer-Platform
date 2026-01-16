# Telegram Bot Configuration Guide

This guide explains how to obtain and configure the Telegram bot environment variables.

## Required Environment Variables

### 1. `BOT_TOKEN` ✅ (Already Configured)

**What it is**: Your Telegram bot token from BotFather

**How to get it**:
1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow the instructions to create a new bot
4. BotFather will provide you with a token like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`
5. Copy this token and set it as `BOT_TOKEN` in your `.env` file

**Your current value**: `8343277623:AAFd0lINUzDNZj6568_ndJEbsu5iXCS7d9s` ✅

---

### 2. `USE_WEBHOOKS` ✅ (Already Configured)

**What it is**: Whether to use webhooks (production) or polling (development)

**How to set it**:
- **Development**: Set to `false` to use long polling (simpler for local development)
- **Production**: Set to `true` when deploying with webhooks

**Your current value**: `false` ✅ (Correct for development)

---

### 3. `WEBHOOK_SECRET` ⚠️ (Optional for Development)

**What it is**: A secret string used to verify webhook requests are legitimate (security measure)

**How to generate it**:
- Generate a random secure string (minimum 16 characters)
- You can use:
  ```bash
  # Generate a random secret (32 characters)
  openssl rand -hex 16
  ```
- Or use any strong random string generator
- Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

**When to use**:
- **Development**: Can be left empty (`WEBHOOK_SECRET=`)
- **Production**: Should be set to a strong random secret when using webhooks

**Your current value**: Empty (Fine for development)

---

### 4. `TELEGRAM_CHANNEL_ID` ⚠️ (Optional)

**What it is**: Telegram channel ID where the bot can post job notifications

**How to get it** (if you want to use this feature):

**Method 1: Using @userinfobot**
1. Add `@userinfobot` to your channel
2. Make the bot an administrator (temporary)
3. Send a message in the channel
4. The bot will reply with the channel ID (looks like `-1001234567890`)
5. Remove the bot from admins if desired

**Method 2: Forward a message**
1. Forward any message from your channel to `@userinfobot`
2. It will show the channel ID

**Method 3: Using Telegram API**
1. Add `@getidsbot` to your channel
2. It will show you the channel ID

**When to use**:
- Leave empty (`TELEGRAM_CHANNEL_ID=`) if you don't need channel posting
- Set it if you want the bot to post job notifications to a Telegram channel

**Format**: Usually starts with `-100` followed by numbers (e.g., `-1001234567890`)

**Your current value**: Empty (Optional, fine if not using channel posting)

---

### 5. `ADMIN_TELEGRAM_IDS` ✅ (Already Configured)

**What it is**: Comma-separated list of Telegram user IDs that have admin access to the bot

**How to get your Telegram User ID**:
1. Open Telegram and search for `@userinfobot`
2. Start a conversation with the bot (just send `/start`)
3. The bot will immediately reply with your user ID (a number like `433629884`)
4. Copy this number

**How to add multiple admins**:
- Separate multiple user IDs with commas
- Example: `ADMIN_TELEGRAM_IDS=433629884,987654321,123456789`
- No spaces around commas (though spaces are automatically trimmed)

**Important**:
- Only users in this list can use admin commands like `/create_job`, `/my_jobs`, etc.
- Users not in this list will only have access to talent features (onboarding, profile management)
- You need to restart the bot after changing this value

**Your current value**: `433629884` ✅

---

## Summary of Your Current Configuration

Based on your `.env` file in `packages/telegram-bot/.env`:

```env
BOT_TOKEN=8343277623:AAFd0lINUzDNZj6568_ndJEbsu5iXCS7d9s ✅
USE_WEBHOOKS=false ✅ (Development mode)
WEBHOOK_SECRET= ⚠️ (Empty - OK for development)
TELEGRAM_CHANNEL_ID= ⚠️ (Empty - Optional)
ADMIN_TELEGRAM_IDS=433629884 ✅
```

## Quick Reference: How to Get Each Value

| Variable | Status | How to Get |
|----------|--------|------------|
| `BOT_TOKEN` | ✅ Set | From @BotFather when creating bot |
| `USE_WEBHOOKS` | ✅ Set | `false` for dev, `true` for production |
| `WEBHOOK_SECRET` | ⚠️ Optional | Generate random string (production only) |
| `TELEGRAM_CHANNEL_ID` | ⚠️ Optional | Get from @userinfobot or @getidsbot |
| `ADMIN_TELEGRAM_IDS` | ✅ Set | Get from @userinfobot |

## Additional Helpful Bots

- `@BotFather` - Create and manage bots
- `@userinfobot` - Get your Telegram user ID or channel ID
- `@getidsbot` - Alternative bot to get channel/user IDs

## Notes

1. **Development vs Production**:
   - For local development, you only need `BOT_TOKEN` and `ADMIN_TELEGRAM_IDS`
   - `WEBHOOK_SECRET` and `TELEGRAM_CHANNEL_ID` are optional
   - `USE_WEBHOOKS` should be `false` for development

2. **Security**:
   - Never commit your `BOT_TOKEN` to version control
   - Keep `WEBHOOK_SECRET` secure in production
   - Only add trusted user IDs to `ADMIN_TELEGRAM_IDS`

3. **After Changing Values**:
   - Restart the bot/service after changing environment variables
   - Docker Compose: Rebuild containers if needed


