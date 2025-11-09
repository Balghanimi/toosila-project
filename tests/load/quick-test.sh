#!/bin/bash

# Quick Load Test Script
# Tests API performance with autocannon (faster than Artillery)

echo "🚀 Starting Quick Performance Test..."
echo ""

# Test 1: Get Offers Endpoint
echo "📊 Test 1: GET /api/offers"
npx autocannon -c 100 -d 10 -p 1 http://localhost:5001/api/offers?page=1&limit=10

echo ""
echo "---"
echo ""

# Test 2: Search Offers Endpoint
echo "📊 Test 2: GET /api/offers/search"
npx autocannon -c 100 -d 10 -p 1 "http://localhost:5001/api/offers/search?q=Baghdad&page=1&limit=10"

echo ""
echo "---"
echo ""

# Test 3: Get Demands Endpoint
echo "📊 Test 3: GET /api/demands"
npx autocannon -c 100 -d 10 -p 1 http://localhost:5001/api/demands?page=1&limit=10

echo ""
echo "✅ Quick Performance Test Complete!"
echo ""
echo "Key Metrics to Monitor:"
echo "  - Requests/sec: Should be >100 for good performance"
echo "  - Avg Latency: Should be <200ms"
echo "  - Errors: Should be 0%"
