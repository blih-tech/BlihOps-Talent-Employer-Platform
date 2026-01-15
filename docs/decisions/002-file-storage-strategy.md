# Decision 002: File Storage Strategy

**Date**: 2025-01-XX  
**Status**: ✅ Decided  
**Decision**: **Docker Volumes for All Environments**

## Context

We need to store files (primarily CVs) for talents. Files need to be:
- Accessible by the API backend
- Persistent across container restarts
- Backed up regularly
- Cleaned up when no longer needed

## Options Evaluated

### Option 1: Docker Volumes (All Environments)
**Pros:**
- Simple setup - no external dependencies
- Cost-effective - no additional storage costs
- Fast access - local filesystem
- Easy backup - just backup the volume
- Works for MVP and production
- Full control over storage

**Cons:**
- Not distributed (single server)
- Manual backup required
- Limited scalability (single server constraint)

### Option 2: S3-Compatible Storage (MinIO/AWS S3)
**Pros:**
- Distributed and scalable
- Built-in redundancy
- CDN integration possible
- Automatic backups

**Cons:**
- Additional infrastructure complexity
- Additional costs
- Network latency
- Overkill for MVP

### Option 3: Hybrid (Docker Volumes + S3 Backup)
**Pros:**
- Best of both worlds
- Local performance + cloud backup

**Cons:**
- More complex
- Additional costs
- Can add later if needed

## Decision

**Selected: Docker Volumes for All Environments (Development, Staging, Production)**

### Rationale

1. **Simplicity**: For MVP and initial production, Docker volumes are the simplest solution.

2. **Cost-Effective**: No additional storage costs, uses existing VPS storage.

3. **Performance**: Local filesystem access is faster than network storage.

4. **Adequate for Scale**: For the expected initial load (1000+ users), single-server storage is sufficient.

5. **Easy Migration**: Can migrate to S3-compatible storage later if needed without changing the API interface.

6. **Backup Strategy**: Can implement automated volume backups using standard Linux tools.

## Implementation Details

### File Storage Configuration

**Storage Location**: Docker volume `app_storage` mounted at `/app/storage`

**File Organization**:
```
/app/storage/
├── cvs/
│   ├── {talentId}/
│   │   └── {filename}.pdf
├── temp/
│   └── {uploadId}/
└── .gitkeep
```

### File Handling Rules

**CV Upload Limits**:
- **Max file size**: 10 MB
- **Allowed formats**: PDF, DOC, DOCX
- **Validation**: MIME type + file extension check
- **Virus scanning**: Optional (can add ClamAV later if needed)

**File Validation**:
- Size validation on upload
- Format validation (MIME type + extension)
- Filename sanitization
- Path traversal prevention

### TTL/Cleanup Strategy

**File Retention**:
- **Active CVs**: Keep indefinitely (linked to active talent profiles)
- **Orphaned files**: Clean up after 30 days
- **Temporary uploads**: Clean up after 24 hours

**Cleanup Job**:
- Scheduled job runs daily at 2 AM
- Removes orphaned files (not referenced in database)
- Removes temporary files older than 24 hours
- Logs cleanup actions

### Backup Strategy

**Backup Schedule**:
- **Full backup**: Daily at 2 AM (same as database backup)
- **Backup location**: `/backups/storage/`
- **Retention**: 30 days
- **Backup method**: `tar` archive of storage volume

**Backup Script**:
```bash
#!/bin/bash
# Backup storage volume
tar -czf /backups/storage/storage-$(date +%Y%m%d).tar.gz /app/storage
# Remove backups older than 30 days
find /backups/storage -name "storage-*.tar.gz" -mtime +30 -delete
```

### Docker Compose Configuration

```yaml
volumes:
  app_storage:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /var/lib/blihops/storage

services:
  api-backend:
    volumes:
      - app_storage:/app/storage:rw
```

## Future Migration Path

If we need to scale beyond single-server storage:
1. Implement storage adapter interface
2. Add S3-compatible storage adapter
3. Migrate existing files to S3
4. Update configuration to use S3 adapter
5. No API changes needed (adapter pattern)

## Status

✅ **Decision Made** - Docker volumes for all environments.





