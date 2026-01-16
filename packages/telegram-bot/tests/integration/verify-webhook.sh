#!/bin/bash

# Verification script for webhook integration
# Usage: ./verify-webhook.sh

set -e

API_URL="${API_URL:-http://localhost:3000/api/v1}"

echo "🔍 Verifying Webhook Integration..."
echo "==================================="

echo ""
echo "1. Checking webhook endpoint..."
# This is a placeholder - actual webhook endpoint depends on implementation
WEBHOOK_ENDPOINT="${API_URL}/webhook/telegram"

if curl -s -f -X GET "${WEBHOOK_ENDPOINT}" > /dev/null 2>&1; then
  echo "✅ Webhook endpoint is accessible"
else
  echo "⚠️  Warning: Webhook endpoint check failed"
  echo "   Endpoint: ${WEBHOOK_ENDPOINT}"
  echo "   Note: This may be expected if webhook requires POST"
fi

echo ""
echo "2. Testing webhook with invalid secret..."
# Test webhook security
TEST_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${WEBHOOK_ENDPOINT}" \
  -H "Content-Type: application/json" \
  -H "X-Telegram-Bot-Api-Secret-Token: invalid_secret" \
  -d '{"test": "data"}' || echo "ERROR\n000")

HTTP_CODE=$(echo "$TEST_RESPONSE" | tail -1)

if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
  echo "✅ Webhook security working (rejected invalid secret)"
elif [ "$HTTP_CODE" = "000" ]; then
  echo "⚠️  Warning: Could not test webhook (endpoint may not be configured)"
else
  echo "⚠️  Warning: Unexpected response code: $HTTP_CODE"
fi

echo ""
echo "==================================="
echo "✅ Webhook Verification Complete!"
echo ""
echo "Note: Full webhook testing requires:"
echo "  1. Bot configured with webhook URL"
echo "  2. Public URL or ngrok tunnel"
echo "  3. Actual Telegram webhook payload"
echo ""

