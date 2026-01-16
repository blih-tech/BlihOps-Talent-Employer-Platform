#!/bin/bash
#
# PostgreSQL Database Restore Script
#
# This script restores a PostgreSQL database from a backup file.
# 
# Usage:
#   ./restore-database.sh <backup_file.dump.gz>
#
# Environment variables:
#   POSTGRES_CONTAINER: Container name (default: blihops-postgres)
#   POSTGRES_USER: Database user (default: blihops)
#   POSTGRES_DB: Database name (default: blihops_db)
#   RESTORE_DB_NAME: Target database name (default: same as POSTGRES_DB)
#

set -euo pipefail

# Configuration
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-blihops-postgres}"
POSTGRES_USER="${POSTGRES_USER:-blihops}"
POSTGRES_DB="${POSTGRES_DB:-blihops_db}"
RESTORE_DB_NAME="${RESTORE_DB_NAME:-${POSTGRES_DB}}"

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
    error_exit "Usage: $0 <backup_file.dump.gz>"
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    error_exit "Backup file not found: $BACKUP_FILE"
fi

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${POSTGRES_CONTAINER}$"; then
    error_exit "Container ${POSTGRES_CONTAINER} is not running"
fi

# Extract backup file if compressed
TEMP_BACKUP="/tmp/restore_$(date +%Y%m%d_%H%M%S).dump"
if [[ "$BACKUP_FILE" == *.gz ]]; then
    log "Decompressing backup file..."
    gunzip -c "$BACKUP_FILE" > "$TEMP_BACKUP" || error_exit "Failed to decompress backup file"
else
    cp "$BACKUP_FILE" "$TEMP_BACKUP"
fi

# Copy backup to container
CONTAINER_BACKUP="/tmp/restore_$(basename $TEMP_BACKUP)"
log "Copying backup to container..."
docker cp "$TEMP_BACKUP" "${POSTGRES_CONTAINER}:${CONTAINER_BACKUP}" || error_exit "Failed to copy backup to container"
rm -f "$TEMP_BACKUP"

# Confirm restoration (safety check)
log "WARNING: This will replace the database: ${RESTORE_DB_NAME}"
log "Container: ${POSTGRES_CONTAINER}"
log "Backup file: ${BACKUP_FILE}"
echo ""
read -p "Are you sure you want to proceed? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    log "Restoration cancelled"
    docker exec "${POSTGRES_CONTAINER}" rm -f "$CONTAINER_BACKUP"
    exit 1
fi

# Drop and recreate database (optional - comment out if you want to restore to existing database)
log "Dropping existing database if it exists..."
docker exec "${POSTGRES_CONTAINER}" psql -U "${POSTGRES_USER}" -d postgres -c "DROP DATABASE IF EXISTS ${RESTORE_DB_NAME};" 2>&1 || true

log "Creating database: ${RESTORE_DB_NAME}"
docker exec "${POSTGRES_CONTAINER}" psql -U "${POSTGRES_USER}" -d postgres -c "CREATE DATABASE ${RESTORE_DB_NAME};" || error_exit "Failed to create database"

# Restore database
log "Restoring database from backup..."
if docker exec "${POSTGRES_CONTAINER}" pg_restore \
    -U "${POSTGRES_USER}" \
    -d "${RESTORE_DB_NAME}" \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    "$CONTAINER_BACKUP" 2>&1; then
    
    log "Database restored successfully"
else
    log "ERROR: Database restoration failed"
    # Clean up
    docker exec "${POSTGRES_CONTAINER}" rm -f "$CONTAINER_BACKUP"
    exit 1
fi

# Clean up
docker exec "${POSTGRES_CONTAINER}" rm -f "$CONTAINER_BACKUP"

# Verify restoration
log "Verifying restoration..."
RECORD_COUNT=$(docker exec "${POSTGRES_CONTAINER}" psql -U "${POSTGRES_USER}" -d "${RESTORE_DB_NAME}" -t -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public';" 2>/dev/null | tr -d ' ' || echo "0")
log "Restoration complete. Found ${RECORD_COUNT} tables in restored database."

exit 0



