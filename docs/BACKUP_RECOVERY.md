# Backup & Recovery Guide

This guide covers backup and recovery procedures for the BlihOps Talent & Employer Platform.

## 📋 Table of Contents

- [Overview](#overview)
- [Backup Strategy](#backup-strategy)
- [Database Backups](#database-backups)
- [Storage Backups](#storage-backups)
- [Automated Backups](#automated-backups)
- [Manual Backups](#manual-backups)
- [Recovery Procedures](#recovery-procedures)
- [Testing Backups](#testing-backups)
- [Monitoring & Alerts](#monitoring--alerts)
- [Troubleshooting](#troubleshooting)

---

## Overview

The BlihOps platform uses automated backups to protect against data loss. This document describes:

- **Database Backups**: PostgreSQL database backups (full backups)
- **Storage Backups**: Application files, CVs, and uploaded documents
- **Backup Retention**: 30 days by default
- **Backup Location**: `/backups/postgresql` and `/backups/storage` on the VPS

---

## Backup Strategy

### Backup Types

1. **Database Backups**:
   - **Full backups** using `pg_dump` (PostgreSQL custom format)
   - Daily backup at 2:00 AM
   - Additional backups every 6 hours (for better recovery point objectives)
   - Compressed and stored with timestamp

2. **Storage Backups**:
   - **Full backups** of storage directory
   - Daily backup at 2:00 AM (same time as database backup)
   - Compressed tar.gz archives
   - One backup per day (multiple backups on same day are skipped)

### Backup Retention

- **Default Retention**: 30 days
- **Automatic Cleanup**: Old backups are automatically deleted
- **Backup Location**: 
  - Database: `/backups/postgresql/`
  - Storage: `/backups/storage/`

### Backup Scheduling

Recommended cron schedule:

```bash
# Database backups
0 2 * * * /opt/blihops/scripts/backup-database.sh        # Daily at 2 AM
0 */6 * * * /opt/blihops/scripts/backup-database.sh      # Every 6 hours

# Storage backups
0 2 * * * /opt/blihops/scripts/backup-storage.sh         # Daily at 2 AM
```

---

## Database Backups

### Backup Script

**Location**: `scripts/backup-database.sh`

**Features**:
- Full database backup using PostgreSQL custom format (`pg_dump -F c`)
- Compressed backups (gzip)
- Automatic cleanup of old backups (30 days retention)
- Error handling and logging
- Backup verification

### Configuration

The script uses environment variables (with sensible defaults):

```bash
BACKUP_DIR="/backups/postgresql"              # Backup directory
POSTGRES_CONTAINER="blihops-postgres"         # Container name
POSTGRES_USER="blihops"                       # Database user
POSTGRES_DB="blihops_db"                      # Database name
RETENTION_DAYS="30"                           # Retention period
```

### Manual Database Backup

```bash
# Run backup script manually
cd /opt/blihops
./scripts/backup-database.sh

# With custom configuration
BACKUP_DIR="/custom/backup/path" ./scripts/backup-database.sh
```

### Backup File Format

Backups are stored as:
- **Filename**: `backup_YYYYMMDD_HHMMSS.dump.gz`
- **Format**: PostgreSQL custom format (compressed)
- **Location**: `/backups/postgresql/`

### Listing Available Backups

```bash
# List all database backups
ls -lh /backups/postgresql/

# List backups sorted by date
ls -lht /backups/postgresql/

# Show backup sizes
du -sh /backups/postgresql/*
```

---

## Storage Backups

### Backup Script

**Location**: `scripts/backup-storage.sh`

**Features**:
- Full directory backup (tar.gz archive)
- Compressed backups
- Automatic cleanup of old backups (30 days retention)
- Error handling and logging
- Prevents duplicate backups on same day

### Configuration

The script uses environment variables (with sensible defaults):

```bash
BACKUP_DIR="/backups/storage"                 # Backup directory
STORAGE_DIR="./storage"                       # Source directory
RETENTION_DAYS="30"                           # Retention period
```

### Manual Storage Backup

```bash
# Run backup script manually
cd /opt/blihops
./scripts/backup-storage.sh

# With custom configuration
STORAGE_DIR="/path/to/storage" BACKUP_DIR="/custom/backup/path" ./scripts/backup-storage.sh
```

### Backup File Format

Backups are stored as:
- **Filename**: `storage-YYYYMMDD.tar.gz`
- **Format**: Compressed tar archive
- **Location**: `/backups/storage/`

### Listing Available Backups

```bash
# List all storage backups
ls -lh /backups/storage/

# List backups sorted by date
ls -lht /backups/storage/

# Show backup sizes
du -sh /backups/storage/*
```

---

## Automated Backups

### Setting Up Cron Jobs

1. **Edit crontab**:
   ```bash
   crontab -e
   ```

2. **Add backup jobs**:
   ```bash
   # Database backups
   0 2 * * * /opt/blihops/scripts/backup-database.sh >> /var/log/blihops-backup-db.log 2>&1
   0 */6 * * * /opt/blihops/scripts/backup-database.sh >> /var/log/blihops-backup-db.log 2>&1
   
   # Storage backups
   0 2 * * * /opt/blihops/scripts/backup-storage.sh >> /var/log/blihops-backup-storage.log 2>&1
   ```

3. **Verify cron jobs**:
   ```bash
   crontab -l
   ```

### Log Files

Backup scripts log to stderr (which can be redirected to log files):
- Database backups: `/var/log/blihops-backup-db.log`
- Storage backups: `/var/log/blihops-backup-storage.log`

### Backup Directory Setup

Create backup directories on the VPS:

```bash
# Create backup directories
sudo mkdir -p /backups/postgresql
sudo mkdir -p /backups/storage

# Set permissions (adjust user as needed)
sudo chown -R $USER:$USER /backups
chmod 755 /backups
chmod 755 /backups/postgresql
chmod 755 /backups/storage
```

---

## Manual Backups

### Before Important Operations

It's recommended to create manual backups before:
- Database migrations
- Major system updates
- Configuration changes
- Before testing recovery procedures

### Creating Manual Backups

```bash
# Database backup
cd /opt/blihops
./scripts/backup-database.sh

# Storage backup
cd /opt/blihops
./scripts/backup-storage.sh
```

### Backup Verification

After creating a backup, verify it was successful:

```bash
# Check backup file exists and has content
ls -lh /backups/postgresql/backup_*.dump.gz | tail -1
ls -lh /backups/storage/storage-*.tar.gz | tail -1

# Verify backup integrity (database)
zcat /backups/postgresql/backup_YYYYMMDD_HHMMSS.dump.gz | head -20

# Verify backup integrity (storage)
tar -tzf /backups/storage/storage-YYYYMMDD.tar.gz | head -20
```

---

## Recovery Procedures

### Database Recovery

**⚠️ WARNING**: Database restoration will replace the existing database. Always backup the current database before restoring.

#### Prerequisites

- Backup file (`.dump.gz` format)
- PostgreSQL container running
- Sufficient disk space

#### Recovery Steps

1. **Stop application services** (if needed):
   ```bash
   docker-compose stop api-backend admin-web telegram-bot
   ```

2. **List available backups**:
   ```bash
   ls -lht /backups/postgresql/
   ```

3. **Run restore script**:
   ```bash
   cd /opt/blihops
   ./scripts/restore-database.sh /backups/postgresql/backup_20260114_020000.dump.gz
   ```

4. **Verify restoration**:
   ```bash
   # Check database
   docker exec blihops-postgres psql -U blihops -d blihops_db -c "\dt"
   
   # Check record counts (adjust tables as needed)
   docker exec blihops-postgres psql -U blihops -d blihops_db -c "SELECT COUNT(*) FROM talents;"
   ```

5. **Restart application services**:
   ```bash
   docker-compose start api-backend admin-web telegram-bot
   ```

#### Restore to Different Database

To restore to a different database name:

```bash
RESTORE_DB_NAME="blihops_db_restored" \
  ./scripts/restore-database.sh /backups/postgresql/backup_YYYYMMDD_HHMMSS.dump.gz
```

### Storage Recovery

**⚠️ WARNING**: Storage restoration will overwrite existing files in the target directory.

#### Recovery Steps

1. **Stop application services** (if needed):
   ```bash
   docker-compose stop api-backend admin-web
   ```

2. **List available backups**:
   ```bash
   ls -lht /backups/storage/
   ```

3. **Run restore script**:
   ```bash
   cd /opt/blihops
   ./scripts/restore-storage.sh /backups/storage/storage-20260114.tar.gz
   ```

4. **Verify restoration**:
   ```bash
   # Check restored files
   ls -lh storage/
   
   # Check file counts
   find storage/ -type f | wc -l
   ```

5. **Restart application services**:
   ```bash
   docker-compose start api-backend admin-web
   ```

#### Restore to Different Directory

To restore to a different directory:

```bash
./scripts/restore-storage.sh /backups/storage/storage-YYYYMMDD.tar.gz /path/to/restore/location
```

---

## Testing Backups

### Regular Backup Testing

It's essential to regularly test backup restoration to ensure backups are valid and recovery procedures work.

#### Testing Schedule

- **Monthly**: Test database backup restoration in a test environment
- **Quarterly**: Test full system recovery (database + storage)
- **After Changes**: Test after any changes to backup procedures

#### Test Environment Setup

1. **Create test database**:
   ```bash
   docker exec blihops-postgres psql -U blihops -d postgres -c "CREATE DATABASE blihops_test;"
   ```

2. **Restore to test database**:
   ```bash
   RESTORE_DB_NAME="blihops_test" \
     ./scripts/restore-database.sh /backups/postgresql/backup_YYYYMMDD_HHMMSS.dump.gz
   ```

3. **Verify test database**:
   ```bash
   docker exec blihops-postgres psql -U blihops -d blihops_test -c "\dt"
   docker exec blihops-postgres psql -U blihops -d blihops_test -c "SELECT COUNT(*) FROM talents;"
   ```

4. **Clean up test database**:
   ```bash
   docker exec blihops-postgres psql -U blihops -d postgres -c "DROP DATABASE blihops_test;"
   ```

### Backup Integrity Checks

#### Database Backup Verification

```bash
# Check backup file exists and is not empty
BACKUP_FILE="/backups/postgresql/backup_YYYYMMDD_HHMMSS.dump.gz"
[ -s "$BACKUP_FILE" ] && echo "Backup file exists and is not empty" || echo "Backup file is missing or empty"

# Verify backup is valid gzip
gunzip -t "$BACKUP_FILE" && echo "Backup file is valid gzip" || echo "Backup file is corrupted"

# Check backup file size (should be reasonable, not 0 bytes)
du -h "$BACKUP_FILE"
```

#### Storage Backup Verification

```bash
# Check backup file exists and is not empty
BACKUP_FILE="/backups/storage/storage-YYYYMMDD.tar.gz"
[ -s "$BACKUP_FILE" ] && echo "Backup file exists and is not empty" || echo "Backup file is missing or empty"

# Verify backup is valid tar.gz
tar -tzf "$BACKUP_FILE" > /dev/null && echo "Backup file is valid tar.gz" || echo "Backup file is corrupted"

# List contents (first 20 files)
tar -tzf "$BACKUP_FILE" | head -20
```

---

## Monitoring & Alerts

### Backup Monitoring

Monitor backup success/failure through:

1. **Log Files**: Check cron logs for backup execution
   ```bash
   tail -f /var/log/blihops-backup-db.log
   tail -f /var/log/blihops-backup-storage.log
   ```

2. **Backup Directory**: Verify backups are being created
   ```bash
   # Check latest backup timestamps
   ls -lht /backups/postgresql/ | head -5
   ls -lht /backups/storage/ | head -5
   ```

3. **Disk Space**: Monitor backup directory disk usage
   ```bash
   df -h /backups
   du -sh /backups/*
   ```

### Backup Alerts

#### Setting Up Email Alerts

Add email notification to backup scripts:

```bash
# In crontab, add MAILTO
MAILTO=admin@example.com
0 2 * * * /opt/blihops/scripts/backup-database.sh
```

#### Manual Alert Script

Create a script to check backup status and send alerts:

```bash
#!/bin/bash
# scripts/check-backups.sh

LAST_DB_BACKUP=$(find /backups/postgresql -name "backup_*.dump.gz" -type f -mtime -1 | head -1)
LAST_STORAGE_BACKUP=$(find /backups/storage -name "storage-*.tar.gz" -type f -mtime -1 | head -1)

if [ -z "$LAST_DB_BACKUP" ]; then
    echo "ALERT: No database backup found in last 24 hours"
fi

if [ -z "$LAST_STORAGE_BACKUP" ]; then
    echo "ALERT: No storage backup found in last 24 hours"
fi
```

### Backup Health Checks

Run periodic health checks:

```bash
# Check if backups exist from last 24 hours
find /backups/postgresql -name "backup_*.dump.gz" -mtime -1
find /backups/storage -name "storage-*.tar.gz" -mtime -1

# Check backup disk usage
du -sh /backups/*

# Check for backup errors in logs
grep -i error /var/log/blihops-backup-*.log | tail -10
```

---

## Troubleshooting

### Common Issues

#### Backup Script Fails

**Problem**: Backup script exits with error

**Solutions**:
1. Check container is running:
   ```bash
   docker ps | grep blihops-postgres
   ```

2. Check container logs:
   ```bash
   docker logs blihops-postgres
   ```

3. Check backup directory permissions:
   ```bash
   ls -ld /backups/postgresql
   chmod 755 /backups/postgresql
   ```

4. Check disk space:
   ```bash
   df -h /backups
   ```

#### Backup File is Empty

**Problem**: Backup file exists but is 0 bytes

**Solutions**:
1. Check database connection:
   ```bash
   docker exec blihops-postgres pg_isready -U blihops
   ```

2. Check database exists:
   ```bash
   docker exec blihops-postgres psql -U blihops -l
   ```

3. Run backup manually with verbose output:
   ```bash
   bash -x ./scripts/backup-database.sh
   ```

#### Restoration Fails

**Problem**: Restore script fails

**Solutions**:
1. Verify backup file is valid:
   ```bash
   file /backups/postgresql/backup_YYYYMMDD_HHMMSS.dump.gz
   gunzip -t /backups/postgresql/backup_YYYYMMDD_HHMMSS.dump.gz
   ```

2. Check database permissions:
   ```bash
   docker exec blihops-postgres psql -U blihops -d postgres -c "\du"
   ```

3. Check disk space:
   ```bash
   df -h
   ```

4. Check container logs:
   ```bash
   docker logs blihops-postgres
   ```

#### Cron Job Not Running

**Problem**: Backups not running automatically

**Solutions**:
1. Check cron service:
   ```bash
   sudo systemctl status cron
   ```

2. Check crontab:
   ```bash
   crontab -l
   ```

3. Check cron logs:
   ```bash
   grep CRON /var/log/syslog | tail -20
   ```

4. Test cron job manually:
   ```bash
   /opt/blihops/scripts/backup-database.sh
   ```

### Getting Help

1. Check script logs: `/var/log/blihops-backup-*.log`
2. Check container status: `docker ps`
3. Check disk space: `df -h`
4. Review script documentation: Script headers contain usage information
5. Test manually: Run scripts manually to see detailed error messages

---

## Best Practices

1. **Regular Testing**: Test backup restoration monthly
2. **Monitor Backups**: Set up alerts for backup failures
3. **Off-Site Backups**: Consider copying backups to external storage (S3, external drive)
4. **Document Changes**: Document any custom backup configurations
5. **Version Control**: Keep backup scripts in version control
6. **Backup Before Changes**: Always backup before major changes
7. **Multiple Backups**: Keep multiple backup copies when possible
8. **Encryption**: Consider encrypting backups if they contain sensitive data

---

**Last Updated**: 2026-01-14  
**Maintained By**: DevOps Team


