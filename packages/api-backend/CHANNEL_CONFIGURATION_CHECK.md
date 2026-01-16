# Channel Configuration Checklist

Quick checklist to verify Telegram channel publishing is configured correctly.

## ✅ Pre-Flight Checklist

Before testing, verify:

- [ ] **Bot Token Configured**
  ```bash
  # Check if TELEGRAM_BOT_TOKEN is set
  grep TELEGRAM_BOT_TOKEN .env
  # Should show: TELEGRAM_BOT_TOKEN=your-actual-token
  ```

- [ ] **Channel IDs Configured** (or using defaults)
  ```bash
  # Check channel IDs in .env (optional - defaults are already set)
  grep TELEGRAM_CHANNEL .env
  # Defaults:
  # TELEGRAM_CHANNEL_ID_JOBS=-1002985721031
  # TELEGRAM_CHANNEL_ID_TALENTS=-1003451753461
  ```

- [ ] **Bot is Admin in Jobs Channel** (`-1002985721031`)
  - Open Telegram → Jobs Channel
  - Channel Settings → Administrators
  - Verify bot is listed with "Post Messages" permission

- [ ] **Bot is Admin in Talents Channel** (`-1003451753461`)
  - Open Telegram → Talents Channel
  - Channel Settings → Administrators
  - Verify bot is listed with "Post Messages" permission

## 🧪 Quick Test

### Test Bot Can Send to Channels

```bash
# Set your bot token
export TELEGRAM_BOT_TOKEN=your-bot-token

# Test Jobs Channel
curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": "-1002985721031",
    "text": "✅ Test: Bot can send to Jobs Channel"
  }'

# Test Talents Channel
curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": "-1003451753461",
    "text": "✅ Test: Bot can send to Talents Channel"
  }'
```

**Expected Response**: `{"ok":true,"result":{...}}` ✅

**If Error**: Check bot permissions in channel settings.

## 🚀 Run Automated Test

```bash
cd packages/api-backend
export TELEGRAM_BOT_TOKEN=your-bot-token
./test-channel-publishing.sh
```

This script will:
1. ✅ Verify bot token is configured
2. ✅ Test bot can send to both channels
3. ✅ Create test talent and approve it
4. ✅ Verify message appears in Talents Channel

## 📋 Manual Testing

### Test 1: Approve Talent → Talents Channel

1. Create or find a pending talent
2. Approve the talent via API:
   ```bash
   curl -X POST http://localhost:3000/api/v1/talents/TALENT_ID/approve \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```
3. Check Talents Channel (`-1003451753461`) - should see message within seconds

### Test 2: Publish Job → Jobs Channel

1. Create or find a pending job
2. Publish the job via API:
   ```bash
   curl -X POST http://localhost:3000/api/v1/jobs/JOB_ID/publish \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```
3. Check Jobs Channel (`-1002985721031`) - should see message within seconds

## 🔍 Monitoring

### Check Queue Processing

Open BullMQ Board:
```
http://localhost:3000/admin/queues
```

View:
- `publish-talent` queue → Should show completed jobs after approval
- `publish-job` queue → Should show completed jobs after publishing

### Check Logs

```bash
# Watch backend logs for publishing messages
docker-compose logs -f api-backend | grep "Successfully published"
```

Should see:
```
[PublishTalentProcessor] Successfully published talent ... to Talents Channel (-1003451753461). Message ID: 123
[PublishJobProcessor] Successfully published job ... to Jobs Channel (-1002985721031). Message ID: 456
```

## 🐛 Common Issues

### Issue: "bot is not a member of the chat"
**Solution**: Add bot as administrator to the channel

### Issue: "not enough rights to send text messages"
**Solution**: Grant bot "Post Messages" permission in channel settings

### Issue: "TELEGRAM_BOT_TOKEN not configured"
**Solution**: Add `TELEGRAM_BOT_TOKEN=your-token` to `.env` file

### Issue: Messages not appearing
**Check**:
1. Queue workers are running (check logs)
2. Jobs are being processed (check BullMQ Board)
3. Bot permissions are correct (test with curl above)

## ✅ Success Indicators

When everything is working:
- ✅ Bot token is set in `.env`
- ✅ Bot is admin in both channels
- ✅ Approve talent → Message appears in Talents Channel
- ✅ Publish job → Message appears in Jobs Channel
- ✅ Queue jobs complete successfully
- ✅ No errors in logs

## 📚 Related Documentation

- [TELEGRAM_CHANNEL_SETUP.md](./TELEGRAM_CHANNEL_SETUP.md) - Detailed setup guide
- [TELEGRAM_CHANNEL_TESTING.md](./TELEGRAM_CHANNEL_TESTING.md) - Detailed testing guide

