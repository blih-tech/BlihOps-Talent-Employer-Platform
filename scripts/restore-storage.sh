#!/bin/bash
#
# Storage Volume Restore Script
#
# This script restores the application storage directory from a backup file.
#
# Usage:
#   ./restore-storage.sh <backup_file.tar.gz> [target_directory]
#
# Environment variables:
#   STORAGE_DIR: Target storage directory (default: ./storage)
#

set -euo pipefail

# Configuration
STORAGE_DIR="${STORAGE_DIR:-./storage}"

# Logging function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*" >&2
}

# Error handler
error_exit() {
    log "ERROR: $*"
    exit 1
}

# Check if backup file is provided
if [ $# -eq 0 ]; then
    error_exit "Usage: $0 <backup_file.tar.gz> [target_directory]"
fi

BACKUP_FILE="$1"
TARGET_DIR="${2:-$STORAGE_DIR}"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    error_exit "Backup file not found: $BACKUP_FILE"
fi

# Verify backup file is a tar.gz archive
if ! file "$BACKUP_FILE" | grep -q "gzip compressed"; then
    error_exit "Backup file does not appear to be a gzip compressed tar archive"
fi

# Confirm restoration (safety check)
log "WARNING: This will restore files to: ${TARGET_DIR}"
log "Backup file: ${BACKUP_FILE}"
log "Target directory: ${TARGET_DIR}"
echo ""
read -p "Are you sure you want to proceed? This may overwrite existing files. (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    log "Restoration cancelled"
    exit 1
fi

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR" || error_exit "Failed to create target directory: $TARGET_DIR"

# Extract backup
log "Extracting backup archive..."
if tar -xzf "$BACKUP_FILE" -C "$(dirname "$TARGET_DIR")" 2>&1; then
    log "Storage restored successfully to: ${TARGET_DIR}"
    
    # Verify restoration
    if [ -d "$TARGET_DIR" ]; then
        FILE_COUNT=$(find "$TARGET_DIR" -type f | wc -l)
        DIR_COUNT=$(find "$TARGET_DIR" -type d | wc -l)
        TOTAL_SIZE=$(du -sh "$TARGET_DIR" | cut -f1)
        log "Restoration complete. Found ${FILE_COUNT} files in ${DIR_COUNT} directories (${TOTAL_SIZE})"
    else
        error_exit "Restoration completed but target directory not found"
    fi
else
    error_exit "Failed to extract backup archive"
fi

exit 0



