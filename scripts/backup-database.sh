#!/bin/bash
#
# PostgreSQL Database Backup Script
# 
# This script performs full backups of the PostgreSQL database.
# Designed to run via cron:
#   - Daily full backup at 2 AM: 0 2 * * * /path/to/backup-database.sh
#   - Periodic backups every 6 hours: 0 */6 * * * /path/to/backup-database.sh
#
# Environment variables:
#   BACKUP_DIR: Backup directory (default: /backups/postgresql)
#   POSTGRES_CONTAINER: Container name (default: blihops-postgres)
#   POSTGRES_USER: Database user (default: blihops)
#   POSTGRES_DB: Database name (default: blihops_db)
#

set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/backups/postgresql}"
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-blihops-postgres}"
POSTGRES_USER="${POSTGRES_USER:-blihops}"
POSTGRES_DB="${POSTGRES_DB:-blihops_db}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Timestamp for backup filename
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql"
BACKUP_FILE_COMPRESSED="${BACKUP_FILE}.gz"

# Logging function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*" >&2
}

# Error handler
error_exit() {
    log "ERROR: $*"
    exit 1
}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR" || error_exit "Failed to create backup directory: $BACKUP_DIR"

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${POSTGRES_CONTAINER}$"; then
    error_exit "Container ${POSTGRES_CONTAINER} is not running"
fi

log "Starting database backup..."
log "Container: ${POSTGRES_CONTAINER}"
log "Database: ${POSTGRES_DB}"
log "User: ${POSTGRES_USER}"
log "Backup file: ${BACKUP_FILE_COMPRESSED}"

# Perform backup using pg_dump
# Using custom format for better compression and restore options
if docker exec "${POSTGRES_CONTAINER}" pg_dump \
    -U "${POSTGRES_USER}" \
    -d "${POSTGRES_DB}" \
    -F c \
    -f "/tmp/backup_${TIMESTAMP}.dump" 2>&1; then
    
    # Copy backup from container to host
    if docker cp "${POSTGRES_CONTAINER}:/tmp/backup_${TIMESTAMP}.dump" "${BACKUP_FILE}.dump" 2>&1; then
        # Remove backup from container
        docker exec "${POSTGRES_CONTAINER}" rm -f "/tmp/backup_${TIMESTAMP}.dump"
        
        # Compress the backup
        log "Compressing backup..."
        gzip -f "${BACKUP_FILE}.dump" || error_exit "Failed to compress backup"
        BACKUP_FILE_COMPRESSED="${BACKUP_FILE}.dump.gz"
        
        # Get backup file size
        BACKUP_SIZE=$(du -h "${BACKUP_FILE_COMPRESSED}" | cut -f1)
        
        log "Backup completed successfully: ${BACKUP_FILE_COMPRESSED} (${BACKUP_SIZE})"
    else
        error_exit "Failed to copy backup from container"
    fi
else
    error_exit "Database backup failed"
fi

# Remove old backups (older than RETENTION_DAYS)
log "Cleaning up backups older than ${RETENTION_DAYS} days..."
DELETED_COUNT=$(find "$BACKUP_DIR" -name "backup_*.dump.gz" -type f -mtime +${RETENTION_DAYS} -delete -print | wc -l)
if [ "$DELETED_COUNT" -gt 0 ]; then
    log "Deleted ${DELETED_COUNT} old backup(s)"
fi

# Summary
TOTAL_BACKUPS=$(find "$BACKUP_DIR" -name "backup_*.dump.gz" -type f | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
log "Backup summary: ${TOTAL_BACKUPS} backup(s) in ${BACKUP_DIR} (${TOTAL_SIZE})"

exit 0


