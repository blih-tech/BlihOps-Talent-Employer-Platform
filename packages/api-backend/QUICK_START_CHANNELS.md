# Quick Start: Telegram Channel Publishing

**Your Channels**:
- **Jobs Channel**: `-1002985721031`
- **Talents Channel**: `-1003451753461`

## 🚀 Setup (3 Steps)

### Step 1: Add Bot Token to .env

```bash
cd packages/api-backend
# Add this line to your .env file:
TELEGRAM_BOT_TOKEN=your-bot-token-from-botfather
```

### Step 2: Add Bot as Admin to Channels

1. **Jobs Channel** (`-1002985721031`):
   - Open channel in Telegram
   - Settings → Administrators → Add Administrator
   - Select your bot
   - ✅ Grant "Post Messages" permission

2. **Talents Channel** (`-1003451753461`):
   - Open channel in Telegram
   - Settings → Administrators → Add Administrator
   - Select your bot
   - ✅ Grant "Post Messages" permission

### Step 3: Verify Configuration

```bash
# Test bot can send to Jobs Channel
export TELEGRAM_BOT_TOKEN=your-token
curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{"chat_id": "-1002985721031", "text": "Test"}'

# Test bot can send to Talents Channel
curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{"chat_id": "-1003451753461", "text": "Test"}'
```

**Expected**: `{"ok":true,...}` ✅

## 🧪 Test It Works

### Test Talent Publishing

1. Approve a talent (via API or admin dashboard)
2. Check Talents Channel (`-1003451753461`) - message should appear within seconds

### Test Job Publishing

1. Publish a job (via API or admin dashboard)
2. Check Jobs Channel (`-1002985721031`) - message should appear within seconds

## ✅ Done!

- ✅ Bot token configured → Messages can be sent
- ✅ Bot is admin in channels → Messages will be published
- ✅ Channel IDs configured → Correct channels used (defaults: `-1002985721031` and `-1003451753461`)

## 📚 Detailed Guides

- [CHANNEL_CONFIGURATION_CHECK.md](./CHANNEL_CONFIGURATION_CHECK.md) - Full checklist
- [TELEGRAM_CHANNEL_SETUP.md](./TELEGRAM_CHANNEL_SETUP.md) - Detailed setup guide
- [TELEGRAM_CHANNEL_TESTING.md](./TELEGRAM_CHANNEL_TESTING.md) - Testing guide

## 🐛 Troubleshooting

**Messages not appearing?**
- Check bot token is set: `echo $TELEGRAM_BOT_TOKEN`
- Verify bot is admin in both channels
- Check backend logs for errors
- Check BullMQ Board: `http://localhost:3000/admin/queues`

