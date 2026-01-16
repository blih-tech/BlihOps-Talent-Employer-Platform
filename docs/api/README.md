# API Documentation

Complete API documentation for the BlihOps Talent & Employer Platform.

## 📚 Documentation

- **[OpenAPI Specification](./openapi.yaml)** - Complete OpenAPI 3.1.0 specification
- **[API Quick Reference](#api-quick-reference)** - Quick reference guide below

## 🔗 Interactive Documentation

Once the API is deployed, you can access interactive Swagger UI at:
- **Production**: `https://api.blihops.com/api-docs`
- **Staging**: `https://staging-api.blihops.com/api-docs`
- **Local**: `http://localhost:3000/api-docs`

## 🔐 Authentication

All API endpoints (except `/auth/login`) require JWT Bearer token authentication.

### Getting an Access Token

```bash
curl -X POST https://api.blihops.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@blihops.com",
    "password": "your-password"
  }'
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "admin@blihops.com",
    "role": "admin"
  }
}
```

### Using the Access Token

Include the token in the `Authorization` header:

```bash
curl -X GET https://api.blihops.com/api/v1/talents \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 📋 API Quick Reference

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/login` | Admin login | No |
| POST | `/auth/refresh` | Refresh access token | Yes |
| POST | `/auth/logout` | Logout | Yes |

### Talent Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/talents` | List talents (paginated, filtered) | Yes |
| POST | `/talents` | Create talent profile | Yes |
| GET | `/talents/{id}` | Get talent by ID | Yes |
| PATCH | `/talents/{id}` | Update talent profile | Yes |
| DELETE | `/talents/{id}` | Delete talent profile | Yes |
| POST | `/talents/{id}/approve` | Approve talent | Yes |
| POST | `/talents/{id}/reject` | Reject talent | Yes |
| GET | `/talents/{id}/cv` | Download talent CV | Yes |

### Job Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/jobs` | List jobs (paginated, filtered) | Yes |
| POST | `/jobs` | Create job posting | Yes |
| GET | `/jobs/{id}` | Get job by ID | Yes |
| PATCH | `/jobs/{id}` | Update job posting | Yes |
| DELETE | `/jobs/{id}` | Delete job posting | Yes |
| POST | `/jobs/{id}/publish` | Publish job | Yes |
| POST | `/jobs/{id}/archive` | Archive job | Yes |

### Matching Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/matching/jobs/{jobId}/talents` | Get matched talents for job | Yes |
| GET | `/matching/talents/{talentId}/jobs` | Get matched jobs for talent | Yes |

### Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/admin/stats` | Get platform statistics | Yes (Admin) |
| GET | `/admin/analytics` | Get analytics data | Yes (Admin) |
| GET | `/admin/metrics` | Get key metrics | Yes (Admin) |
| POST | `/admin/bulk-approve` | Bulk approve talents | Yes (Admin) |

### File Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/files/upload` | Upload file (CV) | Yes |

### Telegram Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/telegram/webhook` | Telegram webhook | Secret Token |

## 🔄 Common Request/Response Patterns

### Pagination

All list endpoints support pagination:

```bash
GET /api/v1/talents?page=1&limit=20
```

Response includes pagination metadata:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Filtering

List endpoints support filtering:

```bash
GET /api/v1/talents?status=approved&category=ITO&skills=TypeScript,NestJS
```

### Sorting

List endpoints support sorting:

```bash
GET /api/v1/talents?sortBy=createdAt&sortOrder=desc
```

### Error Responses

All error responses follow this format:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {
    "field": "email",
    "reason": "Invalid email format"
  },
  "timestamp": "2025-01-15T10:30:00Z",
  "path": "/api/v1/talents"
}
```

## 🚦 Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Per-user limits**: 10 requests/minute for most endpoints
- **Per-endpoint limits**: 100 requests/minute for admin endpoints
- **Rate limit headers**: Included in all responses
  - `X-RateLimit-Limit`: Request limit per time window
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

When rate limit is exceeded, you'll receive a `429 Too Many Requests` response.

## 📝 Example Requests

### Create Talent Profile

```bash
curl -X POST https://api.blihops.com/api/v1/talents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "telegramId": 123456789,
    "name": "John Doe",
    "serviceCategory": "ITO",
    "roleSpecialization": "Senior Full-Stack Developer",
    "skills": ["TypeScript", "NestJS", "PostgreSQL", "React"],
    "experienceLevel": "SENIOR",
    "availability": "IMMEDIATE",
    "engagementPreference": "FULL_TIME",
    "consentForPublicVisibility": true
  }'
```

### Get Matched Talents for Job

```bash
curl -X GET "https://api.blihops.com/api/v1/matching/jobs/123e4567-e89b-12d3-a456-426614174000/talents?limit=20&minScore=70" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Upload CV File

```bash
curl -X POST https://api.blihops.com/api/v1/files/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/cv.pdf" \
  -F "talentId=123e4567-e89b-12d3-a456-426614174000"
```

## 🔍 Data Models

### Talent

```typescript
{
  id: string (UUID)
  telegramId: number
  name: string
  serviceCategory: "ITO" | "AI_SOLUTIONS" | "AUTOMATION" | "DATA_ANALYTICS"
  roleSpecialization: string
  skills: string[]
  experienceLevel: "JUNIOR" | "MID" | "SENIOR" | "LEAD" | "PRINCIPAL"
  availability: "IMMEDIATE" | "ONE_WEEK" | "TWO_WEEKS" | "ONE_MONTH" | "CUSTOM"
  engagementPreference: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "FREELANCE" | "INTERNSHIP"
  cvFileId: string (UUID) | null
  status: "pending" | "approved" | "rejected"
  consentForPublicVisibility: boolean
  metadata: object (JSONB)
  createdAt: string (ISO 8601)
  updatedAt: string (ISO 8601)
  approvedAt: string (ISO 8601) | null
}
```

### Job

```typescript
{
  id: string (UUID)
  createdBy: string (UUID)
  title: string
  description: string
  serviceCategory: "ITO" | "AI_SOLUTIONS" | "AUTOMATION" | "DATA_ANALYTICS"
  requiredSkills: string[]
  preferredExperienceLevel: "JUNIOR" | "MID" | "SENIOR" | "LEAD" | "PRINCIPAL"
  engagementType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "FREELANCE" | "INTERNSHIP"
  duration: string | null
  status: "draft" | "pending" | "published" | "archived"
  metadata: object (JSONB)
  createdAt: string (ISO 8601)
  updatedAt: string (ISO 8601)
  publishedAt: string (ISO 8601) | null
  archivedAt: string (ISO 8601) | null
}
```

### Match Result

```typescript
{
  talent: Talent | Job
  score: number (0-100)
  breakdown: {
    serviceCategory: number (0-100)
    skillOverlap: number (0-100)
    experienceLevel: number (0-100)
    availability: number (0-100)
    total: number (0-100)
  }
}
```

## 🛠️ SDKs and Client Libraries

### TypeScript/JavaScript

```typescript
import { BlihOpsClient } from '@blihops/api-client';

const client = new BlihOpsClient({
  baseURL: 'https://api.blihops.com/api/v1',
  accessToken: 'your-token'
});

// List talents
const talents = await client.talents.list({
  status: 'approved',
  page: 1,
  limit: 20
});

// Create talent
const talent = await client.talents.create({
  telegramId: 123456789,
  name: 'John Doe',
  // ... other fields
});
```

## 📊 API Versioning

The API uses URL versioning: `/api/v1/`

- Current version: `v1`
- Breaking changes will increment version: `v2`, `v3`, etc.
- Deprecated endpoints will be marked in documentation
- Minimum 6 months notice before removing deprecated endpoints

## 🐛 Troubleshooting

### Common Issues

**401 Unauthorized**
- Check that your access token is valid and not expired
- Ensure token is included in `Authorization` header with `Bearer ` prefix

**403 Forbidden**
- Verify your user has the required role (admin endpoints require admin role)
- Check that you're using the correct endpoint for your role

**404 Not Found**
- Verify the resource ID (UUID) is correct
- Check that the resource exists and you have access to it

**429 Rate Limit Exceeded**
- Wait for the rate limit window to reset (check `X-RateLimit-Reset` header)
- Implement exponential backoff in your client
- Consider caching responses to reduce API calls

**500 Internal Server Error**
- This is a server-side issue
- Check API status page
- Contact support with request details

## 📞 Support

- **Email**: api-support@blihops.com
- **Documentation**: [Full OpenAPI Spec](./openapi.yaml)
- **Status Page**: https://status.blihops.com

---

**Last Updated**: 2025-01-XX  
**API Version**: 1.0.0






