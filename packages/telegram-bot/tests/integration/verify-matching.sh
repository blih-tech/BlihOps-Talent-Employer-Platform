#!/bin/bash

# Verification script for matching flow
# Usage: ./verify-matching.sh [job_id]

set -e

JOB_ID="${1:-}"
API_URL="${API_URL:-http://localhost:3000/api/v1}"
DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/blihops}"
REDIS_URL="${REDIS_URL:-redis://localhost:6379}"

echo "🔍 Verifying Matching Flow..."
echo "============================="

if [ -z "$JOB_ID" ]; then
  echo "❌ Error: Job ID is required"
  echo "Usage: ./verify-matching.sh <job_id>"
  exit 1
fi

echo ""
echo "1. Checking for applications with match scores..."
DB_QUERY="SELECT COUNT(*), AVG(\"matchScore\") FROM applications WHERE \"jobId\" = '${JOB_ID}';"
DB_RESULT=$(psql "$DB_URL" -t -A -F"," -c "$DB_QUERY" 2>&1 || echo "ERROR")

if echo "$DB_RESULT" | grep -q "ERROR"; then
  echo "❌ Failed to query database"
  exit 1
fi

COUNT=$(echo "$DB_RESULT" | cut -d',' -f1)
AVG_SCORE=$(echo "$DB_RESULT" | cut -d',' -f2)

echo "✅ Applications found: $COUNT"
if [ "$COUNT" -gt 0 ]; then
  echo "   Average match score: ${AVG_SCORE:-N/A}"
fi

echo ""
echo "2. Checking for matching jobs in queue..."
if command -v redis-cli &> /dev/null; then
  MATCHING_KEYS=$(redis-cli KEYS "bull:matching:*" 2>/dev/null || echo "")
  if [ -n "$MATCHING_KEYS" ]; then
    echo "✅ Matching jobs found in queue"
    WAITING=$(redis-cli LLEN "bull:matching:waiting" 2>/dev/null || echo "0")
    echo "   Waiting jobs: $WAITING"
  else
    echo "⚠️  Warning: No matching jobs found in queue"
  fi
else
  echo "⚠️  Skipping queue check (redis-cli not found)"
fi

echo ""
echo "3. Checking for notify jobs in queue..."
if command -v redis-cli &> /dev/null; then
  NOTIFY_KEYS=$(redis-cli KEYS "bull:notify-talent:*" 2>/dev/null || echo "")
  if [ -n "$NOTIFY_KEYS" ]; then
    echo "✅ Notify jobs found in queue"
    WAITING=$(redis-cli LLEN "bull:notify-talent:waiting" 2>/dev/null || echo "0")
    echo "   Waiting jobs: $WAITING"
  else
    echo "⚠️  Warning: No notify jobs found in queue"
  fi
else
  echo "⚠️  Skipping queue check (redis-cli not found)"
fi

echo ""
echo "============================="
echo "✅ Matching Verification Complete!"
echo ""

