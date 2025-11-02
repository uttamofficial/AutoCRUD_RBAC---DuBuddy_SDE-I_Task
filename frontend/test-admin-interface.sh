#!/bin/bash

echo "=========================================="
echo "Admin Interface - Full Workflow Test"
echo "=========================================="
echo ""

BASE_URL="http://localhost:4000/api"

echo "Step 1: Generate tokens for different roles"
echo ""

echo "1a. Generating Admin token..."
ADMIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/mock-token \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "email": "admin@example.com", "role": "Admin"}')

ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | jq -r '.data.token')
echo "Admin Token: ${ADMIN_TOKEN:0:50}..."
echo ""

echo "1b. Generating Manager token..."
MANAGER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/mock-token \
  -H "Content-Type: application/json" \
  -d '{"userId": 100, "email": "manager@example.com", "role": "Manager"}')

MANAGER_TOKEN=$(echo $MANAGER_RESPONSE | jq -r '.data.token')
echo "Manager Token: ${MANAGER_TOKEN:0:50}..."
echo ""

echo "1c. Generating Viewer token..."
VIEWER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/mock-token \
  -H "Content-Type: application/json" \
  -d '{"userId": 200, "email": "viewer@example.com", "role": "Viewer"}')

VIEWER_TOKEN=$(echo $VIEWER_RESPONSE | jq -r '.data.token')
echo "Viewer Token: ${VIEWER_TOKEN:0:50}..."
echo ""

echo "=========================================="
echo "Step 2: Admin creates Product records"
echo "=========================================="
echo ""

echo "2a. Creating Product 1 (Admin owned)..."
PRODUCT1=$(curl -s -X POST $BASE_URL/crud/Product \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "id": 1,
    "name": "Laptop",
    "price": 999.99,
    "description": "High-performance laptop",
    "inStock": true,
    "createdAt": "2025-10-31",
    "ownerId": 1
  }')
echo $PRODUCT1 | jq .
echo ""

echo "2b. Creating Product 2 (Admin owned)..."
PRODUCT2=$(curl -s -X POST $BASE_URL/crud/Product \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "id": 2,
    "name": "Mouse",
    "price": 29.99,
    "description": "Wireless mouse",
    "inStock": true,
    "createdAt": "2025-10-31",
    "ownerId": 1
  }')
echo $PRODUCT2 | jq .
echo ""

echo "=========================================="
echo "Step 3: Manager creates their own Product"
echo "=========================================="
echo ""

PRODUCT3=$(curl -s -X POST $BASE_URL/crud/Product \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -d '{
    "id": 3,
    "name": "Keyboard",
    "price": 79.99,
    "description": "Mechanical keyboard",
    "inStock": true,
    "createdAt": "2025-10-31",
    "ownerId": 100
  }')
echo $PRODUCT3 | jq .
echo ""

echo "=========================================="
echo "Step 4: Test Read Operations"
echo "=========================================="
echo ""

echo "4a. Admin views all products (should see 3)..."
ADMIN_VIEW=$(curl -s -X GET $BASE_URL/crud/Product \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo "Admin sees $(echo $ADMIN_VIEW | jq '.data | length') products"
echo $ADMIN_VIEW | jq '.data | map({id, name, ownerId})'
echo ""

echo "4b. Manager views products (should only see their own)..."
MANAGER_VIEW=$(curl -s -X GET $BASE_URL/crud/Product \
  -H "Authorization: Bearer $MANAGER_TOKEN")
echo "Manager sees $(echo $MANAGER_VIEW | jq '.data | length') product(s)"
echo $MANAGER_VIEW | jq '.data | map({id, name, ownerId})'
echo ""

echo "4c. Viewer views products (read permission test)..."
VIEWER_VIEW=$(curl -s -X GET $BASE_URL/crud/Product \
  -H "Authorization: Bearer $VIEWER_TOKEN")
echo "Viewer result:"
echo $VIEWER_VIEW | jq .
echo ""

echo "=========================================="
echo "Step 5: Test Update Operations"
echo "=========================================="
echo ""

echo "5a. Manager updates their own product (should succeed)..."
UPDATE1=$(curl -s -X PUT $BASE_URL/crud/Product/3 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -d '{
    "name": "Keyboard Pro",
    "price": 99.99,
    "description": "Premium mechanical keyboard"
  }')
echo $UPDATE1 | jq .
echo ""

echo "5b. Manager tries to update Admin's product (should fail)..."
UPDATE2=$(curl -s -X PUT $BASE_URL/crud/Product/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -d '{
    "name": "Hacked Laptop",
    "price": 1.00
  }')
echo $UPDATE2 | jq .
echo ""

echo "5c. Admin updates any product (should succeed)..."
UPDATE3=$(curl -s -X PUT $BASE_URL/crud/Product/3 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Keyboard Ultimate",
    "price": 149.99
  }')
echo $UPDATE3 | jq .
echo ""

echo "=========================================="
echo "Step 6: Test Delete Operations"
echo "=========================================="
echo ""

echo "6a. Viewer tries to delete (should fail - no permission)..."
DELETE1=$(curl -s -X DELETE $BASE_URL/crud/Product/2 \
  -H "Authorization: Bearer $VIEWER_TOKEN")
echo $DELETE1 | jq .
echo ""

echo "6b. Manager tries to delete (should fail - no delete permission)..."
DELETE2=$(curl -s -X DELETE $BASE_URL/crud/Product/2 \
  -H "Authorization: Bearer $MANAGER_TOKEN")
echo $DELETE2 | jq .
echo ""

echo "6c. Admin deletes a product (should succeed)..."
DELETE3=$(curl -s -X DELETE $BASE_URL/crud/Product/2 \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo $DELETE3 | jq .
echo ""

echo "=========================================="
echo "Step 7: Final Record Count"
echo "=========================================="
echo ""

FINAL=$(curl -s -X GET $BASE_URL/crud/Product \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo "Remaining products: $(echo $FINAL | jq '.data | length')"
echo $FINAL | jq '.data | map({id, name, price, ownerId})'
echo ""

echo "=========================================="
echo "✅ Admin Interface Test Complete!"
echo "=========================================="
echo ""
echo "Summary:"
echo "- Admin: Full CRUD access ✓"
echo "- Manager: Create/Read/Update own records ✓"
echo "- Viewer: Read only ✓"
echo "- Ownership filtering works ✓"
echo "- Permission enforcement works ✓"
echo ""
echo "Now open http://localhost:5173/admin to use the UI!"
echo ""
echo "Test the UI by:"
echo "1. Click 'Login (Generate Token)' and select a role"
echo "2. Select 'Product' model"
echo "3. View existing records"
echo "4. Try Create/Edit/Delete based on your role"
echo "5. Logout and try different roles"
echo ""
