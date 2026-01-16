# Integration Testing

This directory contains integration testing guides and scripts for Task 7.1: Bot-API Integration Testing.

## 📁 Files

- `TASK_7.1_TESTING_GUIDE.md` - Comprehensive manual testing guide
- `verify-integration.sh` - Script to verify system state after tests

## 🚀 Quick Start

1. **Start all services**:
   ```bash
   docker-compose up -d
   ```

2. **Run verification script**:
   ```bash
   ./tests/integration/verify-integration.sh
   ```

3. **Follow the testing guide**:
   - Open `TASK_7.1_TESTING_GUIDE.md`
   - Follow test cases step by step
   - Check off items as you complete them

## 📋 Test Checklist

### Subtask 7.1.1: Talent Onboarding
- [ ] Complete onboarding flow
- [ ] Verify database record
- [ ] Test approval workflow
- [ ] Test error scenarios

### Subtask 7.1.2: Job Creation
- [ ] Complete job creation flow
- [ ] Verify database record
- [ ] Test publishing workflow
- [ ] Test matching triggered

### Subtask 7.1.3: Webhook Integration
- [ ] Set up webhook
- [ ] Test webhook reception
- [ ] Test webhook security

## 🔧 Prerequisites

Before running tests, ensure:
- Docker containers are running
- API backend is healthy
- Redis is accessible
- PostgreSQL is accessible
- Bot is running in dev mode
- Admin Telegram ID is configured

## 📊 Verification

After each test, run:
```bash
./tests/integration/verify-integration.sh
```

This will show:
- Service status
- Database statistics
- Queue status
- Recent records
- Audit logs

## 🐛 Reporting Issues

When you find issues:
1. Document in the testing guide
2. Take screenshots
3. Save logs
4. Create a bug report with:
   - Test case that failed
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages
   - Environment details


