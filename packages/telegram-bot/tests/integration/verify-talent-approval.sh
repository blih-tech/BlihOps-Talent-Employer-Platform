#!/bin/bash

# Verification script for talent approval flow
# Usage: ./verify-talent-approval.sh [talent_id]

set -e

TALENT_ID="${1:-}"
API_URL="${API_URL:-http://localhost:3000/api/v1}"
DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/blihops}"
REDIS_URL="${REDIS_URL:-redis://localhost:6379}"

echo "🔍 Verifying Talent Approval Flow..."
echo "===================================="

if [ -z "$TALENT_ID" ]; then
  echo "❌ Error: Talent ID is required"
  echo "Usage: ./verify-talent-approval.sh <talent_id>"
  exit 1
fi

echo ""
echo "1. Checking talent status in database..."
DB_QUERY="SELECT id, name, status, \"approvedAt\" FROM talents WHERE id = '${TALENT_ID}';"
DB_RESULT=$(psql "$DB_URL" -t -A -F"," -c "$DB_QUERY" 2>&1 || echo "ERROR")

if echo "$DB_RESULT" | grep -q "ERROR"; then
  echo "❌ Failed to query database"
  exit 1
fi

if [ -z "$DB_RESULT" ]; then
  echo "❌ Talent not found"
  exit 1
fi

STATUS=$(echo "$DB_RESULT" | cut -d',' -f3)
APPROVED_AT=$(echo "$DB_RESULT" | cut -d',' -f4)

echo "✅ Talent found"
echo "   Status: $STATUS"
echo "   Approved At: ${APPROVED_AT:-Not set}"

echo ""
echo "2. Verifying status is APPROVED..."
if [ "$STATUS" != "APPROVED" ]; then
  echo "❌ Talent status is '$STATUS', expected 'APPROVED'"
  exit 1
fi
echo "✅ Talent status is APPROVED"

echo ""
echo "3. Checking for publish job in queue..."
if command -v redis-cli &> /dev/null; then
  QUEUE_KEYS=$(redis-cli KEYS "bull:publish-talent:*" 2>/dev/null || echo "")
  if [ -n "$QUEUE_KEYS" ]; then
    echo "✅ Publish job found in queue"
    # Check waiting jobs
    WAITING=$(redis-cli LLEN "bull:publish-talent:waiting" 2>/dev/null || echo "0")
    echo "   Waiting jobs: $WAITING"
  else
    echo "⚠️  Warning: No publish jobs found in queue"
  fi
else
  echo "⚠️  Skipping queue check (redis-cli not found)"
fi

echo ""
echo "===================================="
echo "✅ Talent Approval Verification Complete!"
echo ""

