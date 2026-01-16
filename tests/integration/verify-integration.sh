#!/bin/bash

# Master integration verification script
# Runs all verification scripts in sequence

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BOT_DIR="${SCRIPT_DIR}/../../packages/telegram-bot"

echo "🚀 Running Integration Test Verification Suite..."
echo "=================================================="
echo ""

# Check prerequisites
echo "1. Checking prerequisites..."
if ! command -v psql &> /dev/null; then
  echo "⚠️  Warning: psql not found. Database verification will be skipped."
fi

if ! command -v redis-cli &> /dev/null; then
  echo "⚠️  Warning: redis-cli not found. Queue verification will be skipped."
fi

if ! command -v curl &> /dev/null; then
  echo "❌ Error: curl is required but not found"
  exit 1
fi

echo "✅ Prerequisites check complete"
echo ""

# Check API is running
echo "2. Checking API is running..."
API_URL="${API_URL:-http://localhost:3000/api/v1}"
if curl -s -f "${API_URL}/health" > /dev/null 2>&1; then
  echo "✅ API is running"
else
  echo "⚠️  Warning: API health check failed. Make sure API is running on ${API_URL}"
fi
echo ""

# Check Redis is running
echo "3. Checking Redis is running..."
if command -v redis-cli &> /dev/null; then
  if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is running"
  else
    echo "⚠️  Warning: Redis is not running"
  fi
else
  echo "⚠️  Skipping Redis check (redis-cli not found)"
fi
echo ""

# Check database connection
echo "4. Checking database connection..."
DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/blihops}"
if command -v psql &> /dev/null; then
  if psql "$DB_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database connection successful"
  else
    echo "⚠️  Warning: Database connection failed"
  fi
else
  echo "⚠️  Skipping database check (psql not found)"
fi
echo ""

echo "=================================================="
echo "✅ Prerequisites check complete!"
echo ""
echo "Next steps:"
echo "1. Run manual tests following INTEGRATION_TEST_GUIDE.md"
echo "2. Use individual verification scripts:"
echo "   - ./verify-talent-onboarding.sh <telegram_id>"
echo "   - ./verify-job-creation.sh <telegram_id> [job_id]"
echo "   - ./verify-talent-approval.sh <talent_id>"
echo "   - ./verify-job-publish.sh <job_id>"
echo "   - ./verify-matching.sh <job_id>"
echo "   - ./verify-webhook.sh"
echo ""

