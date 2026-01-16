#!/bin/bash

# Test script for queue integration
# Tests: Talent approval → publish-talent queue, Job publish → publish-job + notify-talent queues

BASE_URL="http://localhost:3000/api/v1"
REDIS_CMD="docker exec blihops-redis-dev redis-cli"

echo "🧪 Testing Queue Integration"
echo "============================"
echo ""

# Function to check queue length
check_queue() {
    local queue_name=$1
    local count=$($REDIS_CMD LLEN "bull:${queue_name}:waiting" 2>/dev/null || echo "0")
    echo "Queue '${queue_name}': ${count} waiting jobs"
    return $count
}

# Function to get job data from queue
get_queue_jobs() {
    local queue_name=$1
    echo ""
    echo "📋 Jobs in '${queue_name}' queue:"
    $REDIS_CMD LRANGE "bull:${queue_name}:waiting" 0 -1 2>/dev/null | head -5
}

echo "📊 Initial Queue Status:"
check_queue "publish-talent:waiting"
check_queue "publish-job:waiting"
check_queue "notify-talent:waiting"
echo ""

# Test 1: Approve a talent
echo "✅ Test 1: Approving a talent..."
PENDING_TALENT_ID=$(curl -s "${BASE_URL}/talents?status=PENDING&limit=1" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$PENDING_TALENT_ID" ]; then
    echo "❌ No pending talent found. Creating one..."
    # Create a test talent first (this would require a POST request)
    echo "⚠️  Skipping talent approval test - no pending talent available"
else
    echo "Found pending talent: ${PENDING_TALENT_ID}"
    echo "Approving talent..."
    RESPONSE=$(curl -s -X POST "${BASE_URL}/talents/${PENDING_TALENT_ID}/approve")
    echo "Response: ${RESPONSE}"
    
    sleep 1
    echo ""
    echo "📊 Queue Status After Talent Approval:"
    check_queue "publish-talent:waiting"
    get_queue_jobs "publish-talent:waiting"
fi

echo ""
echo "============================"
echo ""

# Test 2: Publish a job
echo "✅ Test 2: Publishing a job..."
PENDING_JOB_ID=$(curl -s "${BASE_URL}/jobs?status=PENDING&limit=1" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$PENDING_JOB_ID" ]; then
    echo "❌ No pending job found"
    echo "⚠️  Skipping job publish test - no pending job available"
else
    echo "Found pending job: ${PENDING_JOB_ID}"
    echo "Publishing job..."
    RESPONSE=$(curl -s -X POST "${BASE_URL}/jobs/${PENDING_JOB_ID}/publish" -H "Content-Type: application/json" -d '{"adminId":"test-admin"}')
    echo "Response: ${RESPONSE}"
    
    sleep 2
    echo ""
    echo "📊 Queue Status After Job Publish:"
    check_queue "publish-job:waiting"
    check_queue "notify-talent:waiting"
    get_queue_jobs "publish-job:waiting"
    echo ""
    get_queue_jobs "notify-talent:waiting"
fi

echo ""
echo "============================"
echo "✅ Testing Complete!"



