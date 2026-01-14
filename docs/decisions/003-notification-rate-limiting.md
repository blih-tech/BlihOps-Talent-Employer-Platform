# Decision 003: Notification & Rate Limiting Strategy

**Date**: 2025-01-XX  
**Status**: ✅ Decided

## Context

We need to:
1. Define notification channels and templates
2. Implement rate limiting to prevent abuse and respect Telegram API limits
3. Ensure system stability under load

## Decision 1: Notification Channels

### Primary Channel: Telegram
- **Primary notification channel** for all user-facing notifications
- Real-time delivery
- No additional infrastructure needed
- Users already in Telegram ecosystem

### Fallback Channel: Email (Future)
- **Not implemented in MVP**
- Can be added in Phase 2 if needed
- For critical notifications if Telegram fails

### Future Consideration: SMS
- **Not implemented in MVP**
- Consider for Phase 2+ if needed for critical alerts

## Decision 2: Notification Templates

### Template 1: Talent Approval Notification
**Trigger**: When admin approves a talent profile  
**Channel**: Telegram (DM to talent)  
**Template**:
```
✅ Your profile has been approved!

Your talent profile is now live and visible to employers. You'll receive notifications when matching jobs are available.

View your profile: /profile
```

### Template 2: Job Match Notification
**Trigger**: When a new job matches a talent's skills  
**Channel**: Telegram (DM to talent)  
**Template**:
```
🎯 New Job Match Found!

A new job opportunity matches your profile:
• Title: {jobTitle}
• Category: {serviceCategory}
• Match Score: {matchScore}%

View details: /job_{jobId}
```

### Template 3: Job Published Notification
**Trigger**: When admin publishes a job to Telegram channel  
**Channel**: Telegram (Public channel post)  
**Template**:
```
📢 New Job Opportunity

{jobTitle}
Category: {serviceCategory}
Engagement: {engagementType}

Required Skills: {requiredSkills}

Apply via bot: /apply_{jobId}
```

## Decision 3: Rate Limiting Strategy

### Rate Limiting Implementation

**Storage**: Redis (distributed rate limiting)

**Libraries**:
- **NestJS API**: `@nestjs/throttler` with Redis store
- **Telegram Bot**: `@grammyjs/ratelimit` plugin with Redis

### Rate Limit Values

#### 1. Per-User Telegram Bot Limits
**Purpose**: Prevent spam, respect Telegram API limits, ensure fair usage

| Action | Limit | Window | Rationale |
|--------|-------|--------|-----------|
| Messages to bot | 15 messages | 1 hour | Prevents spam, allows complete onboarding flow |
| Command executions | 30 commands | 1 hour | Allows multiple commands during active session |
| File uploads | 5 uploads | 1 hour | Prevents abuse of file storage |
| Scene transitions | 50 transitions | 1 hour | Allows complex flows without blocking |

**Implementation**: Redis-based sliding window rate limiter

#### 2. Per-Endpoint API Limits
**Purpose**: Protect API from abuse, ensure fair resource usage

| Endpoint Type | Limit | Window | Per |
|---------------|-------|--------|-----|
| Authentication endpoints | 5 requests | 15 minutes | IP |
| Talent CRUD | 100 requests | 1 minute | User (JWT) |
| Job CRUD | 100 requests | 1 minute | User (JWT) |
| Matching endpoints | 50 requests | 1 minute | User (JWT) |
| File upload | 10 requests | 1 minute | User (JWT) |
| Admin endpoints | 200 requests | 1 minute | User (JWT) |

**Implementation**: `@nestjs/throttler` with Redis store

#### 3. Per-IP Limits
**Purpose**: Prevent DDoS, protect against brute force attacks

| Action | Limit | Window | Rationale |
|--------|-------|--------|-----------|
| General API requests | 200 requests | 1 minute | Prevents abuse from single IP |
| Authentication attempts | 10 attempts | 15 minutes | Prevents brute force attacks |
| Webhook endpoints | 100 requests | 1 minute | Protects webhook endpoints |

**Implementation**: IP-based rate limiting in NestJS middleware

### Rate Limit Response

**HTTP 429 Too Many Requests**:
```json
{
  "statusCode": 429,
  "message": "Too Many Requests",
  "retryAfter": 60,
  "limit": 100,
  "remaining": 0
}
```

**Telegram Bot Response**:
```
⏳ Rate limit exceeded. Please wait {retryAfter} seconds before trying again.
```

### Rate Limit Headers

API responses include rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640995200
Retry-After: 60
```

### Monitoring

**Metrics to Track**:
- Rate limit hits per endpoint
- Top rate-limited IPs
- Rate limit effectiveness
- False positives (legitimate users hitting limits)

**Alerts**:
- Alert if >10% of requests are rate-limited
- Alert if single IP hits rate limit >100 times/hour

## Implementation Plan

1. **Install Dependencies**:
   ```bash
   pnpm add @nestjs/throttler @grammyjs/ratelimit
   ```

2. **Configure Redis Rate Limiting**:
   - Set up Redis store for `@nestjs/throttler`
   - Configure rate limit values per endpoint

3. **Telegram Bot Rate Limiting**:
   - Add `@grammyjs/ratelimit` plugin
   - Configure per-user limits
   - Add rate limit error handling

4. **Monitoring**:
   - Add rate limit metrics to logging
   - Set up alerts for excessive rate limiting

## Status

✅ **Decision Made** - Notification channels, templates, and rate limiting strategy defined.


