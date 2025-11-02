#!/bin/bash

# Test script for Model API Routes
# Usage: ./test-model-api.sh

BASE_URL="http://localhost:4000/api/models"

echo "🧪 Testing Model API Routes"
echo "================================"
echo ""

# Test 1: List models (should be empty or have existing models)
echo "📋 Test 1: GET /api/models - List all models"
curl -s "$BASE_URL" | python3 -m json.tool
echo ""
echo ""

# Test 2: Validate a model without saving
echo "📋 Test 2: POST /api/models/validate - Validate model definition"
curl -s -X POST "$BASE_URL/validate" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Task",
    "fields": [
      {"name": "id", "type": "number", "required": true, "unique": true},
      {"name": "title", "type": "string", "required": true},
      {"name": "completed", "type": "boolean", "default": false}
    ],
    "rbac": {
      "Admin": ["all"],
      "User": ["create", "read", "update"]
    }
  }' | python3 -m json.tool
echo ""
echo ""

# Test 3: Save a valid model
echo "📋 Test 3: POST /api/models/save - Save Task model"
curl -s -X POST "$BASE_URL/save" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Task",
    "fields": [
      {"name": "id", "type": "number", "required": true, "unique": true},
      {"name": "title", "type": "string", "required": true},
      {"name": "description", "type": "string"},
      {"name": "completed", "type": "boolean", "default": false},
      {"name": "dueDate", "type": "date"}
    ],
    "rbac": {
      "Admin": ["all"],
      "User": ["create", "read", "update"]
    }
  }' | python3 -m json.tool
echo ""
echo ""

# Test 4: Save another model
echo "📋 Test 4: POST /api/models/save - Save Project model"
curl -s -X POST "$BASE_URL/save" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Project",
    "fields": [
      {"name": "id", "type": "number", "required": true, "unique": true},
      {"name": "name", "type": "string", "required": true},
      {"name": "budget", "type": "number"},
      {"name": "metadata", "type": "json"}
    ],
    "ownerField": "ownerId",
    "rbac": {
      "Admin": ["all"],
      "Manager": ["create", "read", "update"],
      "Viewer": ["read"]
    }
  }' | python3 -m json.tool | head -20
echo ""
echo ""

# Test 5: List all models again
echo "📋 Test 5: GET /api/models - List all models (should show 2+)"
curl -s "$BASE_URL" | python3 -m json.tool
echo ""
echo ""

# Test 6: Get specific model
echo "📋 Test 6: GET /api/models/Task - Get Task model"
curl -s "$BASE_URL/Task" | python3 -m json.tool | head -30
echo ""
echo ""

# Test 7: Try to save invalid model
echo "📋 Test 7: POST /api/models/save - Try invalid model (snake_case)"
curl -s -X POST "$BASE_URL/save" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "invalid_model",
    "fields": [
      {"name": "id", "type": "number"}
    ]
  }' | python3 -m json.tool
echo ""
echo ""

# Test 8: Try to get non-existent model
echo "📋 Test 8: GET /api/models/NonExistent - Get non-existent model"
curl -s "$BASE_URL/NonExistent" | python3 -m json.tool
echo ""
echo ""

# Test 9: Delete a model
echo "📋 Test 9: DELETE /api/models/Task - Delete Task model"
curl -s -X DELETE "$BASE_URL/Task" | python3 -m json.tool
echo ""
echo ""

# Test 10: List models after deletion
echo "📋 Test 10: GET /api/models - List models after deletion"
curl -s "$BASE_URL" | python3 -m json.tool
echo ""
echo ""

echo "✅ All tests completed!"
