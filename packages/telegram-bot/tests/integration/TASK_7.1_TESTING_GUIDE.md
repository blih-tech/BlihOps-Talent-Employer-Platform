# Task 7.1: Bot-API Integration Testing Guide

**Status**: ⏸️ Ready to Start  
**Duration**: 3-4 days  
**Priority**: CRITICAL

## 📋 Prerequisites

Before starting, ensure:
- [ ] All Docker containers are running (`docker-compose ps`)
- [ ] API backend is healthy (`curl http://localhost:3000/health`)
- [ ] Redis is accessible (`redis-cli ping`)
- [ ] PostgreSQL is accessible (`psql -h localhost -U blihops -d blihops_db -c "SELECT 1"`)
- [ ] Bot is running in development mode (`pnpm --filter telegram-bot dev`)
- [ ] Admin Telegram ID is configured in `.env` (`ADMIN_TELEGRAM_IDS=433629884`)

## 🧪 Subtask 7.1.1: Talent Onboarding Integration

### Test Case 1: Complete Onboarding Flow

**Steps**:
1. Open Telegram and find your bot
2. Send `/start` command
3. Complete all onboarding steps:
   - Consent to data collection
   - Enter full name
   - Select service category (1-4)
   - Enter role specialization (or /skip)
   - Enter skills (comma-separated)
   - Select experience level (1-5)
   - Select availability status (1-3)
   - Select engagement preference (1-5, or /skip)
   - Enter bio (or /skip)
   - Upload CV (or /skip)
   - Confirm submission (Yes/No)
4. Verify success message received

**Verification**:
```bash
# Check database for new talent record
psql -h localhost -U blihops -d blihops_db -c "
SELECT id, name, telegram_id, status, created_at 
FROM talents 
ORDER BY created_at DESC 
LIMIT 1;
"

# Expected: New talent record with status='PENDING'
```

**Checklist**:
- [ ] Bot responds to `/start`
- [ ] Onboarding conversation starts
- [ ] All steps collect data correctly
- [ ] Success message received
- [ ] Talent record created in database
- [ ] Status is `PENDING`
- [ ] `telegram_id` matches your Telegram user ID
- [ ] All fields are saved correctly

---

### Test Case 2: Approve Talent (Admin Action)

**Steps**:
1. Get the talent ID from previous test
2. Approve talent via API:
```bash
curl -X POST http://localhost:3000/api/v1/talents/{talentId}/approve \
  -H "Content-Type: application/json"
```

**Verification**:
```bash
# Check talent status changed
psql -h localhost -U blihops -d blihops_db -c "
SELECT id, name, status, updated_at 
FROM talents 
WHERE id = '{talentId}';
"

# Check Redis for queued job
redis-cli KEYS "bull:publish-talent:*"

# Check BullMQ Board (if running)
# Visit: http://localhost:3000/admin/queues
# Look for "publish-talent" queue with new job
```

**Checklist**:
- [ ] Talent status changes to `APPROVED`
- [ ] Job is enqueued in Redis (check keys)
- [ ] Worker processes the job (check logs)
- [ ] Telegram channel receives publish message (if configured)
- [ ] Audit log entry created

---

### Test Case 3: Error Scenarios

#### 3.1 Invalid Data
**Steps**:
1. Start onboarding
2. Try to submit empty name → Should show error
3. Try to submit invalid category number → Should show error
4. Try to submit empty skills → Should show error

**Checklist**:
- [ ] Empty name is rejected
- [ ] Invalid category is rejected
- [ ] Empty skills are rejected
- [ ] Error messages are clear
- [ ] No partial data saved to database

#### 3.2 API Down
**Steps**:
1. Stop API backend: `docker-compose stop api-backend`
2. Try to complete onboarding
3. Verify error message
4. Restart API: `docker-compose start api-backend`

**Checklist**:
- [ ] Bot shows clear error message
- [ ] No crash occurs
- [ ] Bot remains responsive

#### 3.3 Database Down
**Steps**:
1. Stop PostgreSQL: `docker-compose stop postgres`
2. Try to complete onboarding
3. Verify error message
4. Restart PostgreSQL: `docker-compose start postgres`

**Checklist**:
- [ ] Bot shows clear error message
- [ ] No crash occurs
- [ ] Bot remains responsive

---

## 🧪 Subtask 7.1.2: Job Creation Integration

### Test Case 1: Complete Job Creation Flow

**Steps**:
1. Login as admin (ensure your Telegram ID is in `ADMIN_TELEGRAM_IDS`)
2. Send `/create_job` command
3. Complete all steps:
   - Select service category (1-4)
   - Enter job title
   - Enter job description
   - Enter required skills (comma-separated)
   - Select experience level (1-5)
   - Select engagement type (1-5)
   - Enter duration/scope (or /skip)
   - Review and confirm (Yes/No)
4. Verify success message received

**Verification**:
```bash
# Check database for new job record
psql -h localhost -U blihops -d blihops_db -c "
SELECT id, title, service_category, status, created_by, created_at 
FROM jobs 
ORDER BY created_at DESC 
LIMIT 1;
"

# Expected: New job record with status='PENDING'
```

**Checklist**:
- [ ] Bot responds to `/create_job`
- [ ] Job creation conversation starts
- [ ] All steps collect data correctly
- [ ] Success message received
- [ ] Job record created in database
- [ ] Status is `PENDING`
- [ ] `created_by` matches admin Telegram ID
- [ ] All fields are saved correctly

---

### Test Case 2: Publish Job (Admin Action)

**Steps**:
1. Get the job ID from previous test
2. Publish job via API:
```bash
curl -X POST http://localhost:3000/api/v1/jobs/{jobId}/publish \
  -H "Content-Type: application/json"
```

**Verification**:
```bash
# Check job status changed
psql -h localhost -U blihops -d blihops_db -c "
SELECT id, title, status, updated_at 
FROM jobs 
WHERE id = '{jobId}';
"

# Check Redis for queued job
redis-cli KEYS "bull:publish-job:*"

# Check BullMQ Board
# Visit: http://localhost:3000/admin/queues
# Look for "publish-job" queue with new job
```

**Checklist**:
- [ ] Job status changes to `PUBLISHED`
- [ ] Job is enqueued in Redis
- [ ] Worker processes the job
- [ ] Telegram channel receives publish message (if configured)
- [ ] Matching service is triggered (check logs)

---

### Test Case 3: Matching Triggered

**Steps**:
1. Ensure you have approved talents in database
2. Publish a job (from Test Case 2)
3. Wait for matching to complete

**Verification**:
```bash
# Check for notification jobs in queue
redis-cli KEYS "bull:notify-talent:*"

# Check matching results (if available via API)
curl http://localhost:3000/api/v1/matching/jobs/{jobId}/talents
```

**Checklist**:
- [ ] Matching service calculates matches
- [ ] Notify jobs are enqueued for high-score matches (>70%)
- [ ] Talents receive DM notifications (if implemented)
- [ ] Match scores are calculated correctly

---

## 🧪 Subtask 7.1.3: Webhook Integration

### Test Case 1: Webhook Reception

**Prerequisites**:
- Set up ngrok or similar tunnel: `ngrok http 3000`
- Configure webhook URL in bot

**Steps**:
1. Configure bot to use webhook mode:
```bash
# Update .env
USE_WEBHOOKS=true
WEBHOOK_SECRET=your-secret-here
```

2. Set webhook URL:
```bash
curl -X POST "https://api.telegram.org/bot{BOT_TOKEN}/setWebhook" \
  -d "url=https://your-ngrok-url.ngrok.io/api/v1/telegram/webhook" \
  -d "secret_token=your-secret-here"
```

3. Send a message to the bot
4. Check API logs for webhook reception

**Verification**:
```bash
# Check API logs
docker-compose logs api-backend | grep webhook

# Check webhook endpoint is receiving requests
# Monitor: http://localhost:3000/api/v1/telegram/webhook
```

**Checklist**:
- [ ] Webhook URL is set correctly
- [ ] API receives webhook POST request
- [ ] Webhook handler processes correctly
- [ ] Bot responds to messages

---

### Test Case 2: Webhook Security

**Steps**:
1. Send webhook without secret token → Should fail
2. Send webhook with invalid secret → Should fail
3. Send webhook with valid secret → Should succeed

**Verification**:
```bash
# Test without secret
curl -X POST http://localhost:3000/api/v1/telegram/webhook \
  -H "Content-Type: application/json" \
  -d '{"message": {"text": "test"}}'
# Expected: 401 Unauthorized

# Test with invalid secret
curl -X POST http://localhost:3000/api/v1/telegram/webhook \
  -H "Content-Type: application/json" \
  -H "X-Telegram-Bot-Api-Secret-Token: wrong-secret" \
  -d '{"message": {"text": "test"}}'
# Expected: 401 Unauthorized

# Test with valid secret
curl -X POST http://localhost:3000/api/v1/telegram/webhook \
  -H "Content-Type: application/json" \
  -H "X-Telegram-Bot-Api-Secret-Token: your-secret-here" \
  -d '{"message": {"text": "test"}}'
# Expected: 200 OK
```

**Checklist**:
- [ ] Webhook without secret is rejected (401)
- [ ] Webhook with invalid secret is rejected (401)
- [ ] Webhook with valid secret is accepted (200)
- [ ] Error messages are clear

---

## 📊 Verification Scripts

### Check Database State
```bash
# Count talents by status
psql -h localhost -U blihops -d blihops_db -c "
SELECT status, COUNT(*) 
FROM talents 
GROUP BY status;
"

# Count jobs by status
psql -h localhost -U blihops -d blihops_db -c "
SELECT status, COUNT(*) 
FROM jobs 
GROUP BY status;
"

# Recent audit logs
psql -h localhost -U blihops -d blihops_db -c "
SELECT action, entity_type, entity_id, created_at 
FROM audit_logs 
ORDER BY created_at DESC 
LIMIT 10;
"
```

### Check Redis Queues
```bash
# List all queue keys
redis-cli KEYS "bull:*"

# Check queue length
redis-cli LLEN "bull:publish-talent:wait"
redis-cli LLEN "bull:publish-job:wait"
redis-cli LLEN "bull:notify-talent:wait"
```

### Check Worker Logs
```bash
# API backend logs
docker-compose logs api-backend | tail -50

# Bot logs
docker-compose logs telegram-bot | tail -50
```

---

## ✅ Acceptance Criteria Checklist

### Talent Onboarding
- [ ] Talent onboarding flow works end-to-end
- [ ] Database records are created correctly
- [ ] Queue jobs are enqueued and processed
- [ ] Error handling works
- [ ] All validation works

### Job Creation
- [ ] Job creation flow works end-to-end
- [ ] Publishing triggers workers correctly
- [ ] Matching and notifications work
- [ ] Admin-only access is enforced

### Webhook Integration
- [ ] Webhooks are received and processed
- [ ] Security validation works
- [ ] Error handling works

---

## 🐛 Bug Reporting Template

When reporting bugs, include:
1. **Test Case**: Which test case failed
2. **Steps to Reproduce**: Exact steps taken
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happened
5. **Error Messages**: Any error messages or logs
6. **Environment**: Docker version, OS, etc.
7. **Screenshots**: If applicable

---

## 📝 Notes

- Keep this document updated as you test
- Mark completed items with [x]
- Document any issues found
- Take screenshots of errors
- Save logs for bug reports

**Last Updated**: 2026-01-16


