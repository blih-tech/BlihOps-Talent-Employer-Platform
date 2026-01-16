# Verify and Test Channel Publishing

## ✅ Current Status

Your `.env` file has:
- ✅ `TELEGRAM_CHANNEL_ID_JOBS=-1002985721031`
- ✅ `TELEGRAM_CHANNEL_ID_TALENTS=-1003451753461`
- ⚠️  `TELEGRAM_BOT_TOKEN` - **MISSING** (needs to be added)

## 🔧 Step 1: Add Bot Token to .env

Edit your `.env` file and add:

```bash
TELEGRAM_BOT_TOKEN=your-actual-bot-token-from-botfather
```

Replace `your-actual-bot-token-from-botfather` with your actual bot token from @BotFather.

## 🧪 Step 2: Verify Channel Access

Run the verification script:

```bash
cd packages/api-backend
bash verify-channel-setup.sh
```

This will test:
1. ✅ Bot token is configured
2. ✅ Bot can send to Jobs Channel (`-1002985721031`)
3. ✅ Bot can send to Talents Channel (`-1003451753461`)

**Expected Output:**
```
✅ Bot token found
✅ Jobs Channel: Bot can send messages (Message ID: 123)
✅ Talents Channel: Bot can send messages (Message ID: 456)
✅ All channels configured correctly!
```

## 🚀 Step 3: Start Backend (if not running)

```bash
cd packages/api-backend
pnpm dev
```

## 📝 Step 4: Test Talent Publishing

### Option A: Using API (with JWT token)

```bash
# 1. Get a JWT token (login as admin)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "your-password"}'

# 2. Approve a talent (replace TALENT_ID and TOKEN)
curl -X POST http://localhost:3000/api/v1/talents/TALENT_ID/approve \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 3. Check Talents Channel (-1003451753461) - message should appear within seconds
```

### Option B: Using Admin Dashboard

1. Navigate to `/talents` page
2. Find a pending talent
3. Click "Approve"
4. Check Talents Channel (`-1003451753461`) for the message

## 📝 Step 5: Test Job Publishing

### Option A: Using API (with JWT token)

```bash
# 1. Publish a job (replace JOB_ID and TOKEN)
curl -X POST http://localhost:3000/api/v1/jobs/JOB_ID/publish \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 2. Check Jobs Channel (-1002985721031) - message should appear within seconds
```

### Option B: Using Admin Dashboard

1. Navigate to `/jobs` page
2. Find a draft/pending job
3. Click "Publish"
4. Check Jobs Channel (`-1002985721031`) for the message

## 🔍 Monitoring

### Check Queue Status

Visit BullMQ Board: `http://localhost:3000/admin/queues`

You should see:
- `publish-talent` queue processing jobs
- `publish-job` queue processing jobs

### Check Backend Logs

Look for log messages like:
```
[PublishTalentProcessor] Successfully published talent {talentId} to Talents Channel (-1003451753461). Message ID: 123
[PublishJobProcessor] Successfully published job {jobId} to Jobs Channel (-1002985721031). Message ID: 456
```

## ❌ Troubleshooting

### Bot cannot send to channel

**Error**: `Chat not found` or `Not enough rights to send messages`

**Solution**:
1. Make sure bot is added as administrator to both channels
2. Grant "Post Messages" permission
3. Verify channel IDs are correct (must start with `-` for private channels)

### Queue not processing

**Check**:
1. Redis is running: `redis-cli ping` (should return `PONG`)
2. BullMQ workers are running (check backend logs)
3. Queue jobs are created (check BullMQ Board)

### Messages not appearing

**Check**:
1. Bot token is correct
2. Channel IDs are correct
3. Backend logs for errors
4. BullMQ Board for failed jobs

## ✅ Success Criteria

- ✅ Bot can send test messages to both channels
- ✅ Approving a talent publishes to Talents Channel
- ✅ Publishing a job publishes to Jobs Channel
- ✅ Messages appear within 3-5 seconds after action
- ✅ Backend logs show success messages
- ✅ BullMQ Board shows completed jobs

## 📚 Related Documentation

- [QUICK_START_CHANNELS.md](./QUICK_START_CHANNELS.md) - Quick setup guide
- [TELEGRAM_CHANNEL_SETUP.md](./TELEGRAM_CHANNEL_SETUP.md) - Detailed setup instructions
- [TELEGRAM_CHANNEL_TESTING.md](./TELEGRAM_CHANNEL_TESTING.md) - Full testing guide

