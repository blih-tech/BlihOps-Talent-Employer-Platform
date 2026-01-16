#!/bin/bash

# Verification script for talent onboarding integration test
# Usage: ./verify-talent-onboarding.sh [telegram_id]

set -e

TELEGRAM_ID="${1:-}"
API_URL="${API_URL:-http://localhost:3000/api/v1}"
DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/blihops}"

echo "🔍 Verifying Talent Onboarding Integration..."
echo "=============================================="

if [ -z "$TELEGRAM_ID" ]; then
  echo "❌ Error: Telegram ID is required"
  echo "Usage: ./verify-talent-onboarding.sh <telegram_id>"
  exit 1
fi

echo ""
echo "1. Checking API for talent record..."
TALENT_RESPONSE=$(curl -s -X GET "${API_URL}/talents/telegram/${TELEGRAM_ID}" \
  -H "Content-Type: application/json" || echo "ERROR")

if echo "$TALENT_RESPONSE" | grep -q "ERROR"; then
  echo "❌ Failed to fetch talent from API"
  echo "   Make sure API is running on ${API_URL}"
  exit 1
fi

TALENT_ID=$(echo "$TALENT_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")

if [ -z "$TALENT_ID" ]; then
  echo "❌ Talent not found in API"
  echo "   Response: $TALENT_RESPONSE"
  exit 1
fi

echo "✅ Talent found in API: $TALENT_ID"

echo ""
echo "2. Checking database for talent record..."
DB_QUERY="SELECT id, name, status, \"serviceCategory\", \"createdAt\" FROM talents WHERE \"telegramId\" = '${TELEGRAM_ID}' ORDER BY \"createdAt\" DESC LIMIT 1;"

DB_RESULT=$(psql "$DB_URL" -t -A -F"," -c "$DB_QUERY" 2>&1 || echo "ERROR")

if echo "$DB_RESULT" | grep -q "ERROR"; then
  echo "❌ Failed to query database"
  echo "   Error: $DB_RESULT"
  exit 1
fi

if [ -z "$DB_RESULT" ] || [ "$DB_RESULT" = "" ]; then
  echo "❌ Talent not found in database"
  exit 1
fi

echo "✅ Talent found in database"
echo "   Record: $DB_RESULT"

echo ""
echo "3. Verifying talent status is PENDING..."
STATUS=$(echo "$DB_RESULT" | cut -d',' -f3)
if [ "$STATUS" != "PENDING" ]; then
  echo "⚠️  Warning: Talent status is '$STATUS', expected 'PENDING'"
else
  echo "✅ Talent status is PENDING"
fi

echo ""
echo "4. Checking audit logs..."
AUDIT_QUERY="SELECT action, \"resourceType\", \"resourceId\" FROM audit_logs WHERE \"resourceId\" = '${TALENT_ID}' ORDER BY timestamp DESC LIMIT 1;"
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
echo "=============================================="
echo "✅ Talent Onboarding Verification Complete!"
echo ""
echo "Summary:"
echo "  - Talent ID: $TALENT_ID"
echo "  - Telegram ID: $TELEGRAM_ID"
echo "  - Status: $STATUS"
echo ""

