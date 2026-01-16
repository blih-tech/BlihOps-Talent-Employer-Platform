#!/bin/bash

# Verification script for job publishing flow
# Usage: ./verify-job-publish.sh [job_id]

set -e

JOB_ID="${1:-}"
API_URL="${API_URL:-http://localhost:3000/api/v1}"
DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/blihops}"
REDIS_URL="${REDIS_URL:-redis://localhost:6379}"

echo "🔍 Verifying Job Publishing Flow..."
echo "==================================="

if [ -z "$JOB_ID" ]; then
  echo "❌ Error: Job ID is required"
  echo "Usage: ./verify-job-publish.sh <job_id>"
  exit 1
fi

echo ""
echo "1. Checking job status in database..."
DB_QUERY="SELECT id, title, status, \"publishedAt\" FROM jobs WHERE id = '${JOB_ID}';"
DB_RESULT=$(psql "$DB_URL" -t -A -F"," -c "$DB_QUERY" 2>&1 || echo "ERROR")

if echo "$DB_RESULT" | grep -q "ERROR"; then
  echo "❌ Failed to query database"
  exit 1
fi

if [ -z "$DB_RESULT" ]; then
  echo "❌ Job not found"
  exit 1
fi

STATUS=$(echo "$DB_RESULT" | cut -d',' -f3)
PUBLISHED_AT=$(echo "$DB_RESULT" | cut -d',' -f4)

echo "✅ Job found"
echo "   Status: $STATUS"
echo "   Published At: ${PUBLISHED_AT:-Not set}"

echo ""
echo "2. Verifying status is PUBLISHED..."
if [ "$STATUS" != "PUBLISHED" ]; then
  echo "❌ Job status is '$STATUS', expected 'PUBLISHED'"
  exit 1
fi
echo "✅ Job status is PUBLISHED"

echo ""
echo "3. Checking for publish job in queue..."
if command -v redis-cli &> /dev/null; then
  QUEUE_KEYS=$(redis-cli KEYS "bull:publish-job:*" 2>/dev/null || echo "")
  if [ -n "$QUEUE_KEYS" ]; then
    echo "✅ Publish job found in queue"
    WAITING=$(redis-cli LLEN "bull:publish-job:waiting" 2>/dev/null || echo "0")
    echo "   Waiting jobs: $WAITING"
  else
    echo "⚠️  Warning: No publish jobs found in queue"
  fi
else
  echo "⚠️  Skipping queue check (redis-cli not found)"
fi

echo ""
echo "4. Checking for matching jobs in queue..."
if command -v redis-cli &> /dev/null; then
  MATCHING_KEYS=$(redis-cli KEYS "bull:matching:*" 2>/dev/null || echo "")
  if [ -n "$MATCHING_KEYS" ]; then
    echo "✅ Matching jobs found in queue"
  else
    echo "⚠️  Warning: No matching jobs found in queue"
  fi
else
  echo "⚠️  Skipping queue check (redis-cli not found)"
fi

echo ""
echo "==================================="
echo "✅ Job Publishing Verification Complete!"
echo ""

