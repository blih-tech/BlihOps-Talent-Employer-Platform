#!/bin/bash

# Manual test script for queue integration
# This script tests the queue integration by making API calls and checking BullMQ Board

BASE_URL="http://localhost:3000/api/v1"
BOARD_URL="http://localhost:3000/admin/queues/api"

echo "🧪 Queue Integration Test"
echo "=========================="
echo ""

# Function to get queue status
get_queue_status() {
    local queue_name=$1
    curl -s "${BOARD_URL}/queues/${queue_name}" 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    counts = data.get('counts', {})
    print(f\"  Waiting: {counts.get('waiting', 0)}\")
    print(f\"  Active: {counts.get('active', 0)}\")
    print(f\"  Completed: {counts.get('completed', 0)}\")
    print(f\"  Failed: {counts.get('failed', 0)}\")
except:
    print('  Error reading queue status')
" 2>/dev/null || echo "  Error"
}

# Function to get latest jobs
get_latest_jobs() {
    local queue_name=$1
    local status=${2:-completed}
    echo ""
    echo "  Latest ${status} jobs:"
    curl -s "${BOARD_URL}/queues/${queue_name}/jobs/${status}" 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    jobs = data.get('jobs', [])[:3]
    for job in jobs:
        print(f\"    Job ID: {job.get('id', 'N/A')}\")
        print(f\"    Data: {job.get('data', {})}\")
        print(f\"    Status: {job.get('status', 'N/A')}\")
        print(\"\")
except Exception as e:
    print(f'    Error: {e}')
" 2>/dev/null || echo "    No jobs found"
}

echo "📊 Initial Queue Status:"
echo "publish-talent:"
get_queue_status "publish-talent"
echo ""
echo "publish-job:"
get_queue_status "publish-job"
echo ""
echo "notify-talent:"
get_queue_status "notify-talent"
echo ""

# Test 1: Approve a talent
echo "✅ Test 1: Approving a talent..."
PENDING_TALENT=$(curl -s "${BASE_URL}/talents?status=PENDING&limit=1" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('data') and len(data['data']) > 0:
        print(data['data'][0]['id'])
    else:
        print('NONE')
except:
    print('NONE')
" 2>/dev/null)

if [ "$PENDING_TALENT" = "NONE" ] || [ -z "$PENDING_TALENT" ]; then
    echo "⚠️  No pending talent found. Skipping talent approval test."
else
    echo "Found pending talent: ${PENDING_TALENT}"
    echo "Approving..."
    RESPONSE=$(curl -s -X POST "${BASE_URL}/talents/${PENDING_TALENT}/approve")
    echo "Response status: $(echo $RESPONSE | python3 -c 'import sys, json; d=json.load(sys.stdin); print(d.get(\"status\", \"OK\"))' 2>/dev/null || echo 'OK')"
    
    sleep 2
    echo ""
    echo "📊 Queue Status After Talent Approval:"
    echo "publish-talent:"
    get_queue_status "publish-talent"
    get_latest_jobs "publish-talent" "completed"
    get_latest_jobs "publish-talent" "failed"
fi

echo ""
echo "=========================="
echo ""

# Test 2: Publish a job
echo "✅ Test 2: Publishing a job..."
PENDING_JOB=$(curl -s "${BASE_URL}/jobs?status=PENDING&limit=1" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('data') and len(data['data']) > 0:
        print(data['data'][0]['id'])
    else:
        print('NONE')
except:
    print('NONE')
" 2>/dev/null)

if [ "$PENDING_JOB" = "NONE" ] || [ -z "$PENDING_JOB" ]; then
    echo "⚠️  No pending job found. Skipping job publish test."
else
    echo "Found pending job: ${PENDING_JOB}"
    echo "Publishing..."
    RESPONSE=$(curl -s -X POST "${BASE_URL}/jobs/${PENDING_JOB}/publish" \
        -H "Content-Type: application/json" \
        -d '{"adminId":"test-admin"}')
    echo "Response status: $(echo $RESPONSE | python3 -c 'import sys, json; d=json.load(sys.stdin); print(d.get(\"status\", \"OK\"))' 2>/dev/null || echo 'OK')"
    
    sleep 3
    echo ""
    echo "📊 Queue Status After Job Publish:"
    echo "publish-job:"
    get_queue_status "publish-job"
    get_latest_jobs "publish-job" "completed"
    echo ""
    echo "notify-talent:"
    get_queue_status "notify-talent"
    get_latest_jobs "notify-talent" "completed"
fi

echo ""
echo "=========================="
echo "✅ Testing Complete!"
echo ""
echo "💡 Tip: Visit http://localhost:3000/admin/queues to see the BullMQ Board UI"


