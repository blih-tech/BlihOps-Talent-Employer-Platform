#!/bin/bash
#
# Storage Volume Backup Script
#
# This script backs up the application storage directory (CVs, files, etc.)
# Designed to run via cron:
#   - Daily backup at 2 AM: 0 2 * * * /path/to/backup-storage.sh
#
# Environment variables:
#   BACKUP_DIR: Backup directory (default: /backups/storage)
#   STORAGE_DIR: Storage directory to backup (default: ./storage)
#   RETENTION_DAYS: Number of days to retain backups (default: 30)
#

set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/backups/storage}"
STORAGE_DIR="${STORAGE_DIR:-./storage}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Timestamp for backup filename (date only, not time, for daily backups)
TIMESTAMP=$(date +%Y%m%d)
BACKUP_FILE="${BACKUP_DIR}/storage-${TIMESTAMP}.tar.gz"

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

# Check if storage directory exists
if [ ! -d "$STORAGE_DIR" ]; then
    error_exit "Storage directory not found: $STORAGE_DIR"
fi

log "Starting storage backup..."
log "Source directory: ${STORAGE_DIR}"
log "Backup file: ${BACKUP_FILE}"

# Check if today's backup already exists
if [ -f "$BACKUP_FILE" ]; then
    log "Today's backup already exists: ${BACKUP_FILE}"
    log "Skipping backup (to force backup, delete existing file first)"
    exit 0
fi

# Create tar archive
log "Creating compressed archive..."
if tar -czf "$BACKUP_FILE" -C "$(dirname "$STORAGE_DIR")" "$(basename "$STORAGE_DIR")" 2>&1; then
    # Get backup file size
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    
    # Verify backup file
    if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
        log "Backup completed successfully: ${BACKUP_FILE} (${BACKUP_SIZE})"
    else
        error_exit "Backup file is empty or was not created"
    fi
else
    error_exit "Failed to create backup archive"
fi

# Remove old backups (older than RETENTION_DAYS)
log "Cleaning up backups older than ${RETENTION_DAYS} days..."
DELETED_COUNT=$(find "$BACKUP_DIR" -name "storage-*.tar.gz" -type f -mtime +${RETENTION_DAYS} -delete -print | wc -l)
if [ "$DELETED_COUNT" -gt 0 ]; then
    log "Deleted ${DELETED_COUNT} old backup(s)"
fi

# Summary
TOTAL_BACKUPS=$(find "$BACKUP_DIR" -name "storage-*.tar.gz" -type f | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
log "Backup summary: ${TOTAL_BACKUPS} backup(s) in ${BACKUP_DIR} (${TOTAL_SIZE})"

exit 0



