#!/bin/bash

# Integration Test Verification Script
# This script helps verify the state of the system after integration tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 BlihOps Integration Test Verification"
echo "========================================"
echo ""

# Check if services are running
echo "📦 Checking Services..."
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Docker services are running${NC}"
else
    echo -e "${RED}❌ Docker services are not running${NC}"
    exit 1
fi

# Check API health
echo ""
echo "🏥 Checking API Health..."
if curl -s http://localhost:3000/health > /dev/null; then
    echo -e "${GREEN}✅ API is healthy${NC}"
else
    echo -e "${RED}❌ API is not responding${NC}"
fi

# Check Redis
echo ""
echo "🔴 Checking Redis..."
if redis-cli -h localhost ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis is accessible${NC}"
else
    echo -e "${RED}❌ Redis is not accessible${NC}"
fi

# Check PostgreSQL
echo ""
echo "🐘 Checking PostgreSQL..."
if psql -h localhost -U blihops -d blihops_db -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL is accessible${NC}"
else
    echo -e "${RED}❌ PostgreSQL is not accessible${NC}"
fi

# Database Statistics
echo ""
echo "📊 Database Statistics"
echo "---------------------"

echo ""
echo "Talents by Status:"
psql -h localhost -U blihops -d blihops_db -t -c "
SELECT 
    CASE 
        WHEN status = 'PENDING' THEN '⏳ PENDING'
        WHEN status = 'APPROVED' THEN '✅ APPROVED'
        WHEN status = 'REJECTED' THEN '❌ REJECTED'
        WHEN status = 'HIRED' THEN '🎉 HIRED'
        WHEN status = 'INACTIVE' THEN '💤 INACTIVE'
        ELSE status
    END || ': ' || COUNT(*)::text
FROM talents 
GROUP BY status
ORDER BY status;
" || echo "  Unable to query talents"

echo ""
echo "Jobs by Status:"
psql -h localhost -U blihops -d blihops_db -t -c "
SELECT 
    CASE 
        WHEN status = 'DRAFT' THEN '📄 DRAFT'
        WHEN status = 'PENDING' THEN '⏳ PENDING'
        WHEN status = 'PUBLISHED' THEN '✅ PUBLISHED'
        WHEN status = 'ARCHIVED' THEN '📦 ARCHIVED'
        WHEN status = 'CLOSED' THEN '🔒 CLOSED'
        ELSE status
    END || ': ' || COUNT(*)::text
FROM jobs 
GROUP BY status
ORDER BY status;
" || echo "  Unable to query jobs"

# Recent Records
echo ""
echo "📝 Recent Records"
echo "----------------"

echo ""
echo "Latest 5 Talents:"
psql -h localhost -U blihops -d blihops_db -c "
SELECT 
    id,
    name,
    status,
    TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created
FROM talents 
ORDER BY created_at DESC 
LIMIT 5;
" || echo "  Unable to query talents"

echo ""
echo "Latest 5 Jobs:"
psql -h localhost -U blihops -d blihops_db -c "
SELECT 
    id,
    title,
    status,
    TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created
FROM jobs 
ORDER BY created_at DESC 
LIMIT 5;
" || echo "  Unable to query jobs"

# Queue Status
echo ""
echo "📬 Queue Status"
echo "--------------"

if redis-cli -h localhost ping > /dev/null 2>&1; then
    echo ""
    echo "Publish Talent Queue:"
    PUBLISH_TALENT=$(redis-cli -h localhost LLEN "bull:publish-talent:wait" 2>/dev/null || echo "0")
    echo "  Waiting: $PUBLISH_TALENT jobs"
    
    echo ""
    echo "Publish Job Queue:"
    PUBLISH_JOB=$(redis-cli -h localhost LLEN "bull:publish-job:wait" 2>/dev/null || echo "0")
    echo "  Waiting: $PUBLISH_JOB jobs"
    
    echo ""
    echo "Notify Talent Queue:"
    NOTIFY_TALENT=$(redis-cli -h localhost LLEN "bull:notify-talent:wait" 2>/dev/null || echo "0")
    echo "  Waiting: $NOTIFY_TALENT jobs"
    
    echo ""
    echo "All Queue Keys:"
    redis-cli -h localhost KEYS "bull:*" | head -10 || echo "  No queue keys found"
else
    echo -e "${YELLOW}⚠️  Redis not accessible, skipping queue checks${NC}"
fi

# Audit Logs
echo ""
echo "📋 Recent Audit Logs"
echo "-------------------"
psql -h localhost -U blihops -d blihops_db -c "
SELECT 
    action,
    entity_type,
    LEFT(entity_id, 8) as entity_id,
    TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created
FROM audit_logs 
ORDER BY created_at DESC 
LIMIT 10;
" || echo "  Unable to query audit logs"

echo ""
echo "✅ Verification Complete"
echo ""


