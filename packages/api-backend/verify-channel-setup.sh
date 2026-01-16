#!/bin/bash

# Quick verification script for Telegram channel setup
# This script verifies that the bot token is configured and can access both channels

echo "🔍 Verifying Telegram Channel Setup"
echo "===================================="
echo ""

# Load .env file if it exists
ENV_FILE="$(cd "$(dirname "$0")" && pwd)/.env"
if [ -f "$ENV_FILE" ]; then
    echo "📄 Loading configuration from .env file..."
    export $(grep -v '^#' "$ENV_FILE" | grep -E "TELEGRAM_BOT_TOKEN|TELEGRAM_CHANNEL_ID" | xargs)
fi

BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
JOBS_CHANNEL_ID="${TELEGRAM_CHANNEL_ID_JOBS:--1002985721031}"
TALENTS_CHANNEL_ID="${TELEGRAM_CHANNEL_ID_TALENTS:--1003451753461}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if bot token is set
if [ -z "$BOT_TOKEN" ]; then
    echo -e "${RED}❌ ERROR: TELEGRAM_BOT_TOKEN not found${NC}"
    echo ""
    echo "Please ensure TELEGRAM_BOT_TOKEN is set in your .env file:"
    echo "  TELEGRAM_BOT_TOKEN=your-bot-token-from-botfather"
    echo ""
    echo "Or export it manually:"
    echo "  export TELEGRAM_BOT_TOKEN=your-bot-token"
    exit 1
fi

echo -e "${GREEN}✅ Bot token found${NC}"
echo "   Channel IDs:"
echo "   - Jobs: ${JOBS_CHANNEL_ID}"
echo "   - Talents: ${TALENTS_CHANNEL_ID}"
echo ""

# Test Jobs Channel
echo "🧪 Testing Jobs Channel access..."
response=$(curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
    -H "Content-Type: application/json" \
    -d "{
        \"chat_id\": \"${JOBS_CHANNEL_ID}\",
        \"text\": \"✅ Channel setup verified - Jobs Channel\"
    }")

if echo "$response" | grep -q '"ok":true'; then
    message_id=$(echo "$response" | grep -o '"message_id":[0-9]*' | cut -d':' -f2)
    echo -e "${GREEN}✅ Jobs Channel: Bot can send messages (Message ID: ${message_id})${NC}"
    jobs_ok=true
else
    error=$(echo "$response" | grep -o '"description":"[^"]*"' | cut -d'"' -f4 || echo "Unknown error")
    echo -e "${RED}❌ Jobs Channel: ${error}${NC}"
    echo "   Make sure the bot is added as administrator with 'Post Messages' permission"
    jobs_ok=false
fi

echo ""

# Test Talents Channel
echo "🧪 Testing Talents Channel access..."
response=$(curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
    -H "Content-Type: application/json" \
    -d "{
        \"chat_id\": \"${TALENTS_CHANNEL_ID}\",
        \"text\": \"✅ Channel setup verified - Talents Channel\"
    }")

if echo "$response" | grep -q '"ok":true'; then
    message_id=$(echo "$response" | grep -o '"message_id":[0-9]*' | cut -d':' -f2)
    echo -e "${GREEN}✅ Talents Channel: Bot can send messages (Message ID: ${message_id})${NC}"
    talents_ok=true
else
    error=$(echo "$response" | grep -o '"description":"[^"]*"' | cut -d'"' -f4 || echo "Unknown error")
    echo -e "${RED}❌ Talents Channel: ${error}${NC}"
    echo "   Make sure the bot is added as administrator with 'Post Messages' permission"
    talents_ok=false
fi

echo ""
echo "===================================="

if [ "$jobs_ok" = true ] && [ "$talents_ok" = true ]; then
    echo -e "${GREEN}✅ All channels configured correctly!${NC}"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Start your backend: cd packages/api-backend && pnpm dev"
    echo "2. Test talent approval: POST /api/v1/talents/:id/approve"
    echo "3. Test job publishing: POST /api/v1/jobs/:id/publish"
    echo "4. Check messages in Telegram channels"
    exit 0
else
    echo -e "${RED}❌ Channel setup incomplete${NC}"
    echo ""
    echo "Please fix the issues above and run this script again."
    exit 1
fi

