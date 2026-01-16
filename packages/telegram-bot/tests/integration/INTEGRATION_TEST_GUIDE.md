# Bot-API Integration Testing Guide
## TASK 7.1: Bot-API Integration Testing

**Status**: ✅ READY FOR TESTING  
**Date**: 2025-01-16  
**Dependencies**: Stream 5 (Bot), Stream 2 & 3 (API), Stream 4 (Queue)

---

## 📋 Prerequisites

Before starting integration testing, ensure:

1. ✅ **Backend API is running** (`packages/api-backend`)
   ```bash
   cd packages/api-backend
   pnpm dev
   # API should be running on http://localhost:3000
   ```

2. ✅ **PostgreSQL database is running and migrated**
   ```bash
   # Check database connection
   psql $DATABASE_URL -c "SELECT version();"
   
   # Verify migrations are applied
   # Check for talents, jobs, applications tables
   ```

3. ✅ **Redis is running** (for sessions and queues)
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

4. ✅ **BullMQ workers are running** (for queue processing)
   ```bash
   cd packages/api-backend
   pnpm dev:worker
   ```

5. ✅ **Telegram Bot Token is configured**
   ```bash
   # Set in .env file
   BOT_TOKEN=your_bot_token_here
   ```

6. ✅ **Admin Telegram IDs are configured**
   ```bash
   # Set in .env file
   ADMIN_TELEGRAM_IDS=123456789,987654321
   ```

---

## 🧪 Test Execution

### Option 1: Manual Testing (Recommended for First Run)

Follow the test cases step-by-step using the provided scripts and checklists.

### Option 2: Automated Testing

Run the integration test scripts:
```bash
cd packages/telegram-bot
pnpm test:integration
```

---

## 📝 Subtask 7.1.1: Talent Onboarding Integration

### Test Setup

1. **Start the bot in development mode**:
   ```bash
   cd packages/telegram-bot
   pnpm dev
   ```

2. **Verify bot is running**:
   - Check console for: `✅ Bot is running!`
   - Check Redis connection: `✅ Redis connection established`

### Test Case 1: Complete Onboarding Flow

**Steps**:
1. Open Telegram and find your bot
2. Send `/start` command
3. Click "Create Talent Account" or send `/create_account`
4. Complete all onboarding steps:
   - Consent: `Yes`
   - Name: `Test Talent User`
   - Service Category: `1` (Web Development)
   - Role Specialization: `Full Stack Developer`
   - Skills: `JavaScript, TypeScript, React, Node.js`
   - Experience Level: `3` (Mid-level)
   - Availability: `1` (Available)
   - Engagement Preference: `1` (Full-time)
   - Bio: `Experienced full stack developer`
   - CV Upload: Skip (optional)
   - Review and confirm: `Yes`

**Verification**:
```bash
# Run verification script
./tests/integration/verify-talent-onboarding.sh
```

**Expected Results**:
- ✅ Bot responds with confirmation message
- ✅ Talent record created in database
- ✅ Status is `PENDING`
- ✅ All fields are correctly stored
- ✅ Telegram ID is linked

**Database Verification**:
```sql
-- Check talent record
SELECT 
  id, 
  name, 
  "telegramId", 
  status, 
  "serviceCategory",
  "createdAt"
FROM talents 
WHERE "telegramId" = 'YOUR_TELEGRAM_ID'
ORDER BY "createdAt" DESC 
LIMIT 1;
```

**API Verification**:
```bash
# Verify via API
curl -X GET "http://localhost:3000/api/v1/talents/telegram/YOUR_TELEGRAM_ID" \
  -H "Content-Type: application/json"
```

### Test Case 2: Approve Talent (Admin Action)

**Steps**:
1. As admin, approve the talent via Admin Dashboard or API:
   ```bash
   curl -X POST "http://localhost:3000/api/v1/talents/{talentId}/approve" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer {admin_token}"
   ```

2. **Verify status change**:
   ```sql
   SELECT status, "approvedAt" 
   FROM talents 
   WHERE id = '{talentId}';
   -- Should show: status = 'APPROVED', approvedAt is set
   ```

3. **Verify queue job is enqueued**:
   ```bash
   # Check Redis for publish job
   redis-cli
   > KEYS bull:publish-talent:*
   > LRANGE bull:publish-talent:waiting 0 -1
   ```

4. **Verify worker processes job**:
   - Check BullMQ Board: http://localhost:3001/admin/queues
   - Job should move from `waiting` → `active` → `completed`

5. **Verify Telegram channel receives message**:
   - Check Telegram channel configured in `TELEGRAM_CHANNEL_ID`
   - Should see talent profile published

**Verification Script**:
```bash
./tests/integration/verify-talent-approval.sh {talentId}
```

### Test Case 3: Error Scenarios

#### 3.1 Invalid Data (Empty Name)
- Send `/start` → Create account
- When prompted for name, send empty message or just spaces
- **Expected**: Bot should show error and exit gracefully

#### 3.2 Invalid Skills
- Send invalid skills format (not comma-separated)
- **Expected**: Bot should show error and allow retry

#### 3.3 API Down (Simulate)
- Stop the API backend: `Ctrl+C` in API terminal
- Try to complete onboarding
- **Expected**: Bot should show network error message

#### 3.4 Database Down (Simulate)
- Stop PostgreSQL: `sudo systemctl stop postgresql`
- Try to complete onboarding
- **Expected**: Bot should show error message (API will return 500)

**Verification**:
```bash
./tests/integration/verify-error-handling.sh
```

---

## 📝 Subtask 7.1.2: Job Creation Integration

### Test Case 1: Complete Job Creation Flow

**Steps**:
1. As admin, send `/create_job` to bot
2. Complete all steps:
   - Service Category: `1` (Web Development)
   - Title: `Senior Full Stack Developer`
   - Description: `We are looking for an experienced full stack developer...`
   - Required Skills: `JavaScript, TypeScript, React, Node.js, PostgreSQL`
   - Experience Level: `3` (Mid-level)
   - Engagement Type: `1` (Full-time)
   - Duration: `6 months`
   - Review and confirm: `Yes`

**Verification**:
```bash
./tests/integration/verify-job-creation.sh
```

**Expected Results**:
- ✅ Bot responds with confirmation and job ID
- ✅ Job record created in database
- ✅ Status is `PENDING`
- ✅ Created by admin's Telegram ID

**Database Verification**:
```sql
-- Check job record
SELECT 
  id, 
  title, 
  "createdBy", 
  status, 
  "serviceCategory",
  "createdAt"
FROM jobs 
WHERE "createdBy" = 'YOUR_ADMIN_TELEGRAM_ID'
ORDER BY "createdAt" DESC 
LIMIT 1;
```

### Test Case 2: Publish Job (Admin Action)

**Steps**:
1. Publish job via Admin Dashboard or API:
   ```bash
   curl -X POST "http://localhost:3000/api/v1/jobs/{jobId}/publish" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer {admin_token}"
   ```

2. **Verify status change**:
   ```sql
   SELECT status, "publishedAt" 
   FROM jobs 
   WHERE id = '{jobId}';
   -- Should show: status = 'PUBLISHED', publishedAt is set
   ```

3. **Verify queue job is enqueued**:
   ```bash
   redis-cli
   > KEYS bull:publish-job:*
   > LRANGE bull:publish-job:waiting 0 -1
   ```

4. **Verify worker processes job**:
   - Check BullMQ Board
   - Job should be processed

5. **Verify Telegram channel receives message**:
   - Check Telegram channel
   - Should see job posting

**Verification Script**:
```bash
./tests/integration/verify-job-publish.sh {jobId}
```

### Test Case 3: Matching Triggered

**Steps**:
1. After job is published, verify matching is triggered:
   ```bash
   # Check matching queue
   redis-cli
   > KEYS bull:matching:*
   > LRANGE bull:matching:waiting 0 -1
   ```

2. **Verify matching service calculates matches**:
   ```sql
   -- Check if matching was calculated
   SELECT * FROM applications 
   WHERE "jobId" = '{jobId}' 
   ORDER BY "matchScore" DESC;
   ```

3. **Verify notify jobs are enqueued**:
   ```bash
   redis-cli
   > KEYS bull:notify-talent:*
   > LRANGE bull:notify-talent:waiting 0 -1
   ```

4. **Verify talents receive DM notifications**:
   - Check Telegram DMs for approved talents
   - Should receive notification about new matching job

**Verification Script**:
```bash
./tests/integration/verify-matching.sh {jobId}
```

---

## 📝 Subtask 7.1.3: Webhook Integration

### Test Setup

1. **Configure bot for webhook mode**:
   ```bash
   # In .env file
   USE_WEBHOOKS=true
   WEBHOOK_SECRET=your_webhook_secret_here
   ```

2. **Set up webhook URL** (requires public URL or ngrok):
   ```bash
   # Using ngrok for local testing
   ngrok http 3000
   # Use the ngrok URL as webhook endpoint
   ```

### Test Case 1: Webhook Reception

**Steps**:
1. Configure webhook in bot code (if not already):
   ```typescript
   // In src/index.ts, add webhook setup
   if (config.USE_WEBHOOKS) {
     await bot.api.setWebhook(`https://your-domain.com/webhook`, {
       secret_token: config.WEBHOOK_SECRET,
     });
   }
   ```

2. Send message to bot via Telegram

3. **Verify API receives webhook**:
   - Check API logs for webhook POST request
   - Verify webhook handler processes correctly

**Verification**:
```bash
./tests/integration/verify-webhook.sh
```

### Test Case 2: Webhook Security

#### 2.1 Without Secret Token
- Send webhook without `X-Telegram-Bot-Api-Secret-Token` header
- **Expected**: Should fail with 401/403

#### 2.2 Invalid Secret
- Send webhook with wrong secret token
- **Expected**: Should fail with 401/403

#### 2.3 Valid Secret
- Send webhook with correct secret token
- **Expected**: Should succeed and process

**Verification Script**:
```bash
./tests/integration/verify-webhook-security.sh
```

---

## 🔍 Verification Scripts

All verification scripts are located in `tests/integration/`:

- `verify-talent-onboarding.sh` - Verify talent onboarding
- `verify-talent-approval.sh` - Verify talent approval flow
- `verify-job-creation.sh` - Verify job creation
- `verify-job-publish.sh` - Verify job publishing
- `verify-matching.sh` - Verify matching flow
- `verify-webhook.sh` - Verify webhook reception
- `verify-webhook-security.sh` - Verify webhook security
- `verify-error-handling.sh` - Verify error scenarios
- `verify-integration.sh` - Run all verification scripts

---

## 📊 Test Results Template

Use this template to document test results:

```markdown
## Test Results - [Test Case Name]

**Date**: YYYY-MM-DD
**Tester**: [Name]
**Environment**: Development/Staging

### Test Steps
1. [Step 1]
2. [Step 2]
...

### Results
- ✅ Pass / ❌ Fail
- [Details]

### Issues Found
- [Issue 1]
- [Issue 2]

### Screenshots/Logs
[Attach if applicable]
```

---

## ✅ Acceptance Criteria Checklist

### Subtask 7.1.1: Talent Onboarding Integration
- [ ] Talent onboarding flow works end-to-end
- [ ] Database records are created correctly
- [ ] Queue jobs are enqueued and processed
- [ ] Error handling works
- [ ] Audit logs are created

### Subtask 7.1.2: Job Creation Integration
- [ ] Job creation flow works end-to-end
- [ ] Publishing triggers workers correctly
- [ ] Matching and notifications work
- [ ] Database records are correct

### Subtask 7.1.3: Webhook Integration
- [ ] Webhooks are received and processed
- [ ] Security validation works
- [ ] Error handling works

---

## 🐛 Troubleshooting

### Bot Not Responding
- Check bot token is correct
- Verify Redis connection
- Check bot logs for errors

### API Errors
- Verify API is running
- Check API logs
- Verify database connection

### Queue Jobs Not Processing
- Verify BullMQ workers are running
- Check Redis connection
- Verify queue configuration

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL is correct
- Verify migrations are applied

---

## 📚 Additional Resources

- [Bot Documentation](../README.md)
- [API Documentation](../../api-backend/README.md)
- [Queue System Documentation](../../api-backend/docs/queues.md)
- [Database Schema](../../api-backend/docs/schema.md)

---

**Last Updated**: 2025-01-16

