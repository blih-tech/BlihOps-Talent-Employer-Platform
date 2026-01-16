# Telegram Channel Setup Guide

This guide explains how to configure Telegram channels for publishing jobs and talents.

## 📋 Prerequisites

1. ✅ Telegram Bot Token (from @BotFather)
2. ✅ Two Telegram Channels:
   - Jobs Channel ID: `-1002985721031`
   - Talents Channel ID: `-1003451753461`

## 🔧 Step 1: Configure Bot Token

1. Get your bot token from @BotFather on Telegram
2. Add it to your `.env` file:

```env
TELEGRAM_BOT_TOKEN=your-bot-token-from-botfather
```

## 🔧 Step 2: Add Bot as Administrator to Channels

The bot **MUST** be an administrator in both channels to send messages.

### For Jobs Channel (`-1002985721031`):

1. Open Telegram and navigate to your Jobs channel
2. Go to Channel Settings → Administrators
3. Click "Add Administrator"
4. Search for your bot (by username or bot token)
5. Grant the following permissions:
   - ✅ **Post Messages** (CRITICAL - required for publishing)
   - ✅ View Messages (optional, but recommended)
6. Save changes

### For Talents Channel (`-1003451753461`):

1. Open Telegram and navigate to your Talents channel
2. Go to Channel Settings → Administrators
3. Click "Add Administrator"
4. Search for your bot (by username or bot token)
5. Grant the following permissions:
   - ✅ **Post Messages** (CRITICAL - required for publishing)
   - ✅ View Messages (optional, but recommended)
6. Save changes

### Verify Bot Permissions

After adding the bot as admin, test that it can send messages:

```bash
# Test message to Jobs channel (replace BOT_TOKEN and CHANNEL_ID)
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": "-1002985721031",
    "text": "Test message from backend"
  }'

# Test message to Talents channel
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": "-1003451753461",
    "text": "Test message from backend"
  }'
```

If you get `{"ok":true,"result":{...}}`, the bot has permission! ✅

## 🔧 Step 3: Configure Channel IDs in .env

The channel IDs are already configured with your default values:

```env
# Jobs channel
TELEGRAM_CHANNEL_ID_JOBS=-1002985721031

# Talents channel
TELEGRAM_CHANNEL_ID_TALENTS=-1003451753461
```

These are the default values, so you don't need to change them unless you're using different channels.

## ✅ Verification

After configuration:

1. ✅ Bot token is set in `.env`
2. ✅ Bot is admin in Jobs channel (`-1002985721031`)
3. ✅ Bot is admin in Talents channel (`-1003451753461`)
4. ✅ Channel IDs are configured (or using defaults)

## 🧪 Testing

See [TELEGRAM_CHANNEL_TESTING.md](./TELEGRAM_CHANNEL_TESTING.md) for testing instructions.

## 🐛 Troubleshooting

### Error: "bot is not a member of the chat"

**Solution**: Add the bot as administrator to the channel (see Step 2)

### Error: "not enough rights to send text messages"

**Solution**: Ensure the bot has "Post Messages" permission in channel settings

### Error: "chat not found"

**Solution**: 
- Verify the channel ID is correct (must be negative number like `-1002985721031`)
- Ensure the bot is added to the channel as admin

### Error: "TELEGRAM_BOT_TOKEN not configured"

**Solution**: Add `TELEGRAM_BOT_TOKEN=your-token` to `.env` file

## 📚 Related Documentation

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [Channel Administration Guide](https://core.telegram.org/bots/api#chatmember)

