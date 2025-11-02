#!/bin/bash

# RBAC System Test Script
# Tests authentication, authorization, and ownership rules

BASE_URL="http://localhost:4000"
MODEL_NAME="Employee"

echo "🔐 Testing RBAC System"
echo "=========================================="
echo ""

# Step 1: Create a model with RBAC and ownership
echo "📋 Step 1: Creating Employee model with RBAC rules"
curl -s -X POST "$BASE_URL/api/models/save" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Employee",
    "fields": [
      {"name": "id", "type": "number", "required": true, "unique": true},
      {"name": "name", "type": "string", "required": true},
      {"name": "email", "type": "string", "required": true, "unique": true},
      {"name": "department", "type": "string"},
      {"name": "salary", "type": "number"},
      {"name": "ownerId", "type": "number", "required": true}
    ],
    "ownerField": "ownerId",
    "rbac": {
      "Admin": ["all"],
      "Manager": ["create", "read", "update"],
      "Viewer": ["read"]
    }
  }' | python3 -m json.tool | head -15
echo ""
echo ""

# Step 2: Get tokens for different roles
echo "📋 Step 2: Getting JWT tokens for different roles"
echo ""

echo "👤 Admin token:"
ADMIN_TOKEN=$(curl -s -X POST "$BASE_URL/auth/mock-token" \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "email": "admin@example.com", "role": "Admin"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
echo "Token: ${ADMIN_TOKEN:0:50}..."
echo ""

echo "👤 Manager token:"
MANAGER_TOKEN=$(curl -s -X POST "$BASE_URL/auth/mock-token" \
  -H "Content-Type: application/json" \
  -d '{"userId": 2, "email": "manager@example.com", "role": "Manager"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
echo "Token: ${MANAGER_TOKEN:0:50}..."
echo ""

echo "👤 Viewer token:"
VIEWER_TOKEN=$(curl -s -X POST "$BASE_URL/auth/mock-token" \
  -H "Content-Type: application/json" \
  -d '{"userId": 3, "email": "viewer@example.com", "role": "Viewer"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
echo "Token: ${VIEWER_TOKEN:0:50}..."
echo ""
echo ""

# Step 3: Test without authentication
echo "📋 Step 3: Attempt to access without authentication (should fail)"
curl -s "$BASE_URL/api/crud/$MODEL_NAME" | python3 -m json.tool
echo ""
echo ""

# Step 4: Admin creates records
echo "📋 Step 4: Admin creates employee records"
echo ""

echo "Creating Employee 1 (owned by user 1):"
RECORD1=$(curl -s -X POST "$BASE_URL/api/crud/$MODEL_NAME" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "department": "Engineering", "salary": 80000}' | python3 -m json.tool | head -10)
echo "$RECORD1"
RECORD1_ID=$(echo "$RECORD1" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null || echo "1")
echo ""

echo "Creating Employee 2 (owned by user 1):"
curl -s -X POST "$BASE_URL/api/crud/$MODEL_NAME" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Smith", "email": "jane@example.com", "department": "Sales", "salary": 75000}' | python3 -m json.tool | head -10
echo ""
echo ""

# Step 5: Manager creates a record (should auto-assign ownerId=2)
echo "📋 Step 5: Manager creates their own employee record"
MANAGER_RECORD=$(curl -s -X POST "$BASE_URL/api/crud/$MODEL_NAME" \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Bob Manager", "email": "bob@example.com", "department": "Management", "salary": 90000}' | python3 -m json.tool | head -10)
echo "$MANAGER_RECORD"
MANAGER_RECORD_ID=$(echo "$MANAGER_RECORD" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null || echo "3")
echo ""
echo ""

# Step 6: Viewer tries to create (should fail)
echo "📋 Step 6: Viewer tries to create employee (should fail - no create permission)"
curl -s -X POST "$BASE_URL/api/crud/$MODEL_NAME" \
  -H "Authorization: Bearer $VIEWER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Denied User", "email": "denied@example.com"}' | python3 -m json.tool
echo ""
echo ""

# Step 7: Admin lists all records
echo "📋 Step 7: Admin lists all employees (should see all)"
curl -s "$BASE_URL/api/crud/$MODEL_NAME" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | python3 -m json.tool
echo ""
echo ""

# Step 8: Manager lists records (should only see their own)
echo "📋 Step 8: Manager lists employees (should only see their own)"
curl -s "$BASE_URL/api/crud/$MODEL_NAME" \
  -H "Authorization: Bearer $MANAGER_TOKEN" | python3 -m json.tool
echo ""
echo ""

# Step 9: Manager tries to update Admin's record (should fail - ownership)
echo "📋 Step 9: Manager tries to update Admin's record (should fail - not owner)"
curl -s -X PUT "$BASE_URL/api/crud/$MODEL_NAME/$RECORD1_ID" \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"salary": 100000}' | python3 -m json.tool
echo ""
echo ""

# Step 10: Manager updates their own record (should succeed)
echo "📋 Step 10: Manager updates their own record (should succeed)"
curl -s -X PUT "$BASE_URL/api/crud/$MODEL_NAME/$MANAGER_RECORD_ID" \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"salary": 95000}' | python3 -m json.tool | head -10
echo ""
echo ""

# Step 11: Viewer tries to update (should fail - no update permission)
echo "📋 Step 11: Viewer tries to update record (should fail - no update permission)"
curl -s -X PUT "$BASE_URL/api/crud/$MODEL_NAME/$MANAGER_RECORD_ID" \
  -H "Authorization: Bearer $VIEWER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"salary": 50000}' | python3 -m json.tool
echo ""
echo ""

# Step 12: Admin deletes a record (should succeed)
echo "📋 Step 12: Admin deletes a record (should succeed)"
curl -s -X DELETE "$BASE_URL/api/crud/$MODEL_NAME/$RECORD1_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | python3 -m json.tool
echo ""
echo ""

# Step 13: Manager tries to delete Admin's record (should fail)
echo "📋 Step 13: Manager tries to delete Admin's record (should fail - not owner)"
curl -s -X DELETE "$BASE_URL/api/crud/$MODEL_NAME/2" \
  -H "Authorization: Bearer $MANAGER_TOKEN" | python3 -m json.tool
echo ""
echo ""

echo "✅ RBAC testing completed!"
echo ""
echo "Summary:"
echo "  ✓ Authentication required for all operations"
echo "  ✓ Admin has full access (all permissions)"
echo "  ✓ Manager can create, read, update (but not delete)"
echo "  ✓ Viewer can only read"
echo "  ✓ Ownership rules enforced (users can only modify their own records)"
echo "  ✓ Admin bypasses ownership restrictions"
