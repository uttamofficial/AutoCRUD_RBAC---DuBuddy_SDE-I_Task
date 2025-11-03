#!/bin/bash

# Test script for Home API endpoints
# Make sure the server is running before executing this script

BASE_URL="http://localhost:4000"

echo "=========================================="
echo "Testing AutoCRUD-RBAC Home API Endpoints"
echo "=========================================="
echo ""

# Test 1: Health Check
echo "1. Testing Health Check Endpoint"
echo "GET $BASE_URL/health"
echo "---"
curl -s "$BASE_URL/health" | jq '.'
echo ""
echo ""

# Test 2: Home Endpoint
echo "2. Testing Home Endpoint"
echo "GET $BASE_URL/api/home"
echo "---"
curl -s "$BASE_URL/api/home" | jq '.'
echo ""
echo ""

# Test 3: API Info Endpoint
echo "3. Testing API Info Endpoint"
echo "GET $BASE_URL/api/home/info"
echo "---"
curl -s "$BASE_URL/api/home/info" | jq '.'
echo ""
echo ""

echo "=========================================="
echo "All tests completed!"
echo "=========================================="
