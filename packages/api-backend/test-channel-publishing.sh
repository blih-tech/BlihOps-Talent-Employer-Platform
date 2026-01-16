#!/bin/bash

# Test script for Telegram channel publishing
# This script tests that talents and jobs are published to the correct Telegram channels

BASE_URL="http://localhost:3000/api/v1"
BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
JOBS_CHANNEL_ID="-1002985721031"
TALENTS_CHANNEL_ID="-1003451753461"

echo "🧪 Telegram Channel Publishing Test"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if bot token is set
check_bot_token() {
    if [ -z "$BOT_TOKEN" ]; then
        echo -e "${RED}❌ ERROR: TELEGRAM_BOT_TOKEN not set${NC}"
        echo "Please set TELEGRAM_BOT_TOKEN environment variable:"
        echo "  export TELEGRAM_BOT_TOKEN=your-bot-token"
        echo "Or add it to your .env file"
        exit 1
    fi
    echo -e "${GREEN}✅ Bot token is configured${NC}"
}

# Function to verify bot can access channel
verify_channel_access() {
    local channel_id=$1
    local channel_name=$2
    
    echo ""
    echo "🔍 Verifying bot access to ${channel_name} (${channel_id})..."
    
    response=$(curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
        -H "Content-Type: application/json" \
        -d "{
            \"chat_id\": \"${channel_id}\",
            \"text\": \"🔧 Test message - Bot channel access verification\"
        }")
    
    if echo "$response" | grep -q '"ok":true'; then
        echo -e "${GREEN}✅ Bot can send messages to ${channel_name}${NC}"
        return 0
    else
        error=$(echo "$response" | grep -o '"description":"[^"]*"' | cut -d'"' -f4 || echo "Unknown error")
        echo -e "${RED}❌ Bot cannot send messages to ${channel_name}: ${error}${NC}"
        echo "   Make sure the bot is added as administrator with 'Post Messages' permission"
        return 1
    fi
}

# Function to create test talent
create_test_talent() {
    echo ""
    echo "📝 Creating test talent..."
    
    response=$(curl -s -X POST "${BASE_URL}/talents" \
        -H "Content-Type: application/json" \
        -d '{
            "telegramId": "999999999",
            "name": "Test Talent for Channel Publishing",
            "serviceCategory": "WEB_DEVELOPMENT",
            "skills": ["JavaScript", "React", "Node.js"],
            "experienceLevel": "INTERMEDIATE",
            "yearsOfExperience": 3,
            "bio": "This is a test talent profile for testing channel publishing functionality."
        }')
    
    talent_id=$(echo "$response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -z "$talent_id" ]; then
        echo -e "${RED}❌ Failed to create talent${NC}"
        echo "Response: $response"
        return ""
    fi
    
    echo -e "${GREEN}✅ Test talent created: ${talent_id}${NC}"
    echo "$talent_id"
}

# Function to approve talent
approve_talent() {
    local talent_id=$1
    
    echo ""
    echo "✅ Approving talent ${talent_id}..."
    
    # Note: This requires admin authentication. For manual testing, use JWT token.
    # For automated testing, you may need to include Authorization header
    response=$(curl -s -X POST "${BASE_URL}/talents/${talent_id}/approve" \
        -H "Content-Type: application/json")
    
    if echo "$response" | grep -q '"status":"APPROVED"'; then
        echo -e "${GREEN}✅ Talent approved successfully${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Approval may require authentication. Response: $response${NC}"
        echo "   Try manually: curl -X POST ${BASE_URL}/talents/${talent_id}/approve -H 'Authorization: Bearer YOUR_JWT_TOKEN'"
        return 1
    fi
}

# Function to check channel for message
check_channel_message() {
    local channel_id=$1
    local channel_name=$2
    local search_text=$3
    
    echo ""
    echo "🔍 Checking ${channel_name} for new message..."
    echo -e "${YELLOW}⚠️  Please manually check the channel: ${channel_name}${NC}"
    echo "   Channel ID: ${channel_id}"
    echo "   Look for message containing: ${search_text}"
    echo ""
}

# Main test flow
echo "Step 1: Checking configuration..."
check_bot_token

echo ""
echo "Step 2: Verifying channel access..."
verify_channel_access "$JOBS_CHANNEL_ID" "Jobs Channel"
jobs_ok=$?
verify_channel_access "$TALENTS_CHANNEL_ID" "Talents Channel"
talents_ok=$?

if [ $jobs_ok -ne 0 ] || [ $talents_ok -ne 0 ]; then
    echo ""
    echo -e "${RED}❌ Channel access verification failed${NC}"
    echo "Please fix channel permissions before continuing."
    echo "See TELEGRAM_CHANNEL_SETUP.md for instructions."
    exit 1
fi

echo ""
echo "Step 3: Testing talent publishing..."
talent_id=$(create_test_talent)

if [ -n "$talent_id" ]; then
    echo ""
    echo "⏳ Waiting 1 second before approval..."
    sleep 1
    
    approve_talent "$talent_id"
    
    echo ""
    echo "⏳ Waiting 3 seconds for queue processing..."
    sleep 3
    
    check_channel_message "$TALENTS_CHANNEL_ID" "Talents Channel" "Test Talent for Channel Publishing"
fi

echo ""
echo "Step 4: Testing job publishing..."
echo -e "${YELLOW}⚠️  Job publishing test requires manual steps:${NC}"
echo ""
echo "1. Create a job via API or admin dashboard"
echo "2. Publish the job (this will trigger queue job)"
echo "3. Check Jobs Channel ($JOBS_CHANNEL_ID) for the message"
echo ""
echo "Example API call:"
echo "  curl -X POST ${BASE_URL}/jobs/JOB_ID/publish \\"
echo "    -H 'Authorization: Bearer YOUR_JWT_TOKEN'"

echo ""
echo "===================================="
echo "✅ Test script complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Check backend logs for publishing confirmation"
echo "2. Check BullMQ Board: http://localhost:3000/admin/queues"
echo "3. Verify messages in Telegram channels"
echo ""
echo "📚 See TELEGRAM_CHANNEL_TESTING.md for detailed testing guide"

