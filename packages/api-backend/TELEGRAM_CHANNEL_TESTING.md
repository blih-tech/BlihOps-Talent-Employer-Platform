# Telegram Channel Publishing - Testing Guide

This guide explains how to test that jobs and talents are automatically published to Telegram channels.

## 🧪 Test Setup

Before testing, ensure:

1. ✅ Backend API is running
2. ✅ Redis is running (for queue system)
3. ✅ PostgreSQL is running
4. ✅ Bot token is configured in `.env`
5. ✅ Bot is admin in both channels (see TELEGRAM_CHANNEL_SETUP.md)
6. ✅ Channel IDs are configured (defaults: `-1002985721031` for jobs, `-1003451753461` for talents)

## 🧪 Test 1: Approve Talent → Publish to Talents Channel

### Steps:

1. **Create a talent** (if not already exists):
```bash
curl -X POST http://localhost:3000/api/v1/talents \
  -H "Content-Type: application/json" \
  -d '{
    "telegramId": "123456789",
    "name": "Test Talent",
    "serviceCategory": "WEB_DEVELOPMENT",
    "skills": ["JavaScript", "React", "Node.js"],
    "experienceLevel": "INTERMEDIATE",
    "yearsOfExperience": 3,
    "bio": "Test bio for testing channel publishing"
  }'
```

Save the `id` from the response (e.g., `"id": "abc-123-def-456"`)

2. **Approve the talent** (triggers publishing):
```bash
# Replace TALENT_ID with the ID from step 1
# Replace ADMIN_ID with an admin user ID (or use a valid JWT token)
curl -X POST http://localhost:3000/api/v1/talents/TALENT_ID/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

3. **Check the queue** (optional - verify job was enqueued):
   - Open BullMQ Board: `http://localhost:3000/admin/queues`
   - Check `publish-talent` queue for the job

4. **Verify message in Talents Channel**:
   - Open Telegram and go to your Talents Channel (`-1003451753461`)
   - You should see a message like:
   ```
   🎯 New Talent Available!
   
   Name: Test Talent
   Category: WEB_DEVELOPMENT
   Experience: INTERMEDIATE
   Skills: JavaScript, React, Node.js
   
   Test bio for testing channel publishing
   
   Contact via bot: /talent_abc-123-def-456
   ```

### Expected Result:
- ✅ Talent is approved (status changes to `APPROVED`)
- ✅ Job is enqueued in `publish-talent` queue
- ✅ Worker processes the job
- ✅ Message appears in Talents Channel (`-1003451753461`)
- ✅ Log shows: "Successfully published talent ... to Talents Channel"

---

## 🧪 Test 2: Publish Job → Publish to Jobs Channel

### Steps:

1. **Login as admin** (get JWT token):
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@blihops.com",
    "password": "admin123"
  }'
```

Save the `accessToken` from the response.

2. **Create a job**:
```bash
# Replace JWT_TOKEN with the token from step 1
curl -X POST http://localhost:3000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer JWT_TOKEN" \
  -d '{
    "title": "Test Job - React Developer",
    "description": "We are looking for an experienced React developer",
    "serviceCategory": "WEB_DEVELOPMENT",
    "requiredSkills": ["React", "TypeScript", "Node.js"],
    "experienceLevel": "INTERMEDIATE",
    "engagementType": "FULL_TIME",
    "duration": "Permanent",
    "budget": "$50,000 - $70,000"
  }'
```

Save the `id` from the response.

3. **Publish the job** (triggers publishing):
```bash
# Replace JOB_ID with the ID from step 2
# Replace JWT_TOKEN with your admin token
curl -X POST http://localhost:3000/api/v1/jobs/JOB_ID/publish \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer JWT_TOKEN"
```

4. **Check the queue** (optional):
   - Open BullMQ Board: `http://localhost:3000/admin/queues`
   - Check `publish-job` queue for the job

5. **Verify message in Jobs Channel**:
   - Open Telegram and go to your Jobs Channel (`-1002985721031`)
   - You should see a message like:
   ```
   📢 New Job Opportunity
   
   Title: Test Job - React Developer
   Category: WEB_DEVELOPMENT
   Experience: INTERMEDIATE
   Type: FULL_TIME
   Duration: Permanent
   
   Required Skills:
   • React
   • TypeScript
   • Node.js
   
   Description:
   We are looking for an experienced React developer
   
   Apply via bot: /apply_JOB_ID
   ```

### Expected Result:
- ✅ Job is published (status changes to `PUBLISHED`)
- ✅ Job is enqueued in `publish-job` queue
- ✅ Worker processes the job
- ✅ Message appears in Jobs Channel (`-1002985721031`)
- ✅ Log shows: "Successfully published job ... to Jobs Channel"

---

## 🔍 Monitoring

### Check Queue Status

Open BullMQ Board in browser:
```
http://localhost:3000/admin/queues
```

View:
- `publish-talent` queue - Should show completed jobs after talent approval
- `publish-job` queue - Should show completed jobs after job publishing

### Check Logs

Monitor backend logs for:
```
[PublishTalentProcessor] Successfully published talent ... to Talents Channel (-1003451753461). Message ID: 123
[PublishJobProcessor] Successfully published job ... to Jobs Channel (-1002985721031). Message ID: 456
```

### Check Telegram Channels

- Jobs Channel: `https://t.me/c/1002985721031` (or your channel link)
- Talents Channel: `https://t.me/c/1003451753461` (or your channel link)

---

## 🐛 Troubleshooting

### Messages not appearing in channels

1. **Check bot permissions**:
   - Verify bot is admin in both channels
   - Verify bot has "Post Messages" permission

2. **Check bot token**:
   - Verify `TELEGRAM_BOT_TOKEN` is set in `.env`
   - Verify token is valid (not expired)

3. **Check queue workers**:
   - Verify workers are running (check logs)
   - Verify jobs are being processed (check BullMQ Board)

4. **Check channel IDs**:
   - Verify channel IDs are correct (negative numbers)
   - Test with curl commands (see TELEGRAM_CHANNEL_SETUP.md)

### Queue jobs failing

1. **Check error logs**:
   - Look for error messages in backend logs
   - Check BullMQ Board for failed jobs

2. **Common errors**:
   - `TELEGRAM_BOT_TOKEN not configured` → Add token to `.env`
   - `Failed to publish ... to Telegram channel` → Check bot permissions
   - `chat not found` → Verify channel ID is correct

---

## ✅ Success Criteria

After running both tests:

- ✅ Talent approval → Message appears in Talents Channel
- ✅ Job publishing → Message appears in Jobs Channel
- ✅ Queue jobs complete successfully
- ✅ No errors in logs
- ✅ Messages are formatted correctly

## 📝 Notes

- Channel publishing happens automatically via queue workers
- Workers process jobs asynchronously (may take a few seconds)
- Messages use Markdown formatting
- Failed jobs will retry automatically (3 attempts)

