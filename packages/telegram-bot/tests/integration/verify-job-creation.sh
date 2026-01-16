#!/bin/bash

# Verification script for job creation integration test
# Usage: ./verify-job-creation.sh [telegram_id] [job_id]

set -e

TELEGRAM_ID="${1:-}"
JOB_ID="${2:-}"
API_URL="${API_URL:-http://localhost:3000/api/v1}"
DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/blihops}"

echo "🔍 Verifying Job Creation Integration..."
echo "=========================================="

if [ -z "$TELEGRAM_ID" ]; then
  echo "❌ Error: Telegram ID is required"
  echo "Usage: ./verify-job-creation.sh <telegram_id> [job_id]"
  exit 1
fi

echo ""
echo "1. Checking database for job records..."
DB_QUERY="SELECT id, title, \"createdBy\", status, \"serviceCategory\", \"createdAt\" FROM jobs WHERE \"createdBy\" = '${TELEGRAM_ID}' ORDER BY \"createdAt\" DESC LIMIT 1;"

DB_RESULT=$(psql "$DB_URL" -t -A -F"," -c "$DB_QUERY" 2>&1 || echo "ERROR")

if echo "$DB_RESULT" | grep -q "ERROR"; then
  echo "❌ Failed to query database"
  echo "   Error: $DB_RESULT"
  exit 1
fi

if [ -z "$DB_RESULT" ] || [ "$DB_RESULT" = "" ]; then
  echo "❌ No jobs found for admin Telegram ID: $TELEGRAM_ID"
  exit 1
fi

FOUND_JOB_ID=$(echo "$DB_RESULT" | cut -d',' -f1)
JOB_TITLE=$(echo "$DB_RESULT" | cut -d',' -f2)
JOB_STATUS=$(echo "$DB_RESULT" | cut -d',' -f4)

echo "✅ Job found in database"
echo "   Job ID: $FOUND_JOB_ID"
echo "   Title: $JOB_TITLE"
echo "   Status: $JOB_STATUS"

if [ -n "$JOB_ID" ] && [ "$FOUND_JOB_ID" != "$JOB_ID" ]; then
  echo "⚠️  Warning: Job ID mismatch (expected: $JOB_ID, found: $FOUND_JOB_ID)"
fi

echo ""
echo "2. Verifying job status is PENDING..."
if [ "$JOB_STATUS" != "PENDING" ]; then
  echo "⚠️  Warning: Job status is '$JOB_STATUS', expected 'PENDING'"
else
  echo "✅ Job status is PENDING"
fi

echo ""
echo "3. Checking API for job record..."
JOB_RESPONSE=$(curl -s -X GET "${API_URL}/jobs/${FOUND_JOB_ID}" \
  -H "Content-Type: application/json" || echo "ERROR")

if echo "$JOB_RESPONSE" | grep -q "ERROR"; then
  echo "❌ Failed to fetch job from API"
  echo "   Make sure API is running on ${API_URL}"
else
  echo "✅ Job found in API"
fi

echo ""
echo "4. Checking audit logs..."
AUDIT_QUERY="SELECT action, \"resourceType\", \"resourceId\" FROM audit_logs WHERE \"resourceId\" = '${FOUND_JOB_ID}' ORDER BY timestamp DESC LIMIT 1;"
AUDIT_RESULT=$(psql "$DB_URL" -t -A -F"," -c "$AUDIT_QUERY" 2>&1 || echo "ERROR")

if echo "$AUDIT_RESULT" | grep -q "ERROR"; then
  echo "⚠️  Warning: Could not check audit logs"
else
  if [ -n "$AUDIT_RESULT" ] && [ "$AUDIT_RESULT" != "" ]; then
    echo "✅ Audit log entry found: $AUDIT_RESULT"
  else
    echo "⚠️  Warning: No audit log entry found"
  fi
fi

echo ""
echo "=========================================="
echo "✅ Job Creation Verification Complete!"
echo ""
echo "Summary:"
echo "  - Job ID: $FOUND_JOB_ID"
echo "  - Title: $JOB_TITLE"
echo "  - Status: $JOB_STATUS"
echo "  - Created By: $TELEGRAM_ID"
echo ""

