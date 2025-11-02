#!/bin/bash

echo "=========================================="
echo "Testing Frontend UI Model Creation Flow"
echo "=========================================="
echo ""

BASE_URL="http://localhost:4000/api"

echo "Step 1: Check backend health"
curl -s $BASE_URL/../health | jq .
echo ""

echo "Step 2: List existing models (should be empty or show existing)"
curl -s $BASE_URL/models | jq .
echo ""

echo "Step 3: Create a test model via API (simulating UI form submission)"
cat > /tmp/test-model.json << 'EOF'
{
  "name": "Product",
  "fields": [
    {
      "name": "id",
      "type": "number",
      "required": true,
      "unique": true
    },
    {
      "name": "name",
      "type": "string",
      "required": true
    },
    {
      "name": "price",
      "type": "number",
      "required": true
    },
    {
      "name": "description",
      "type": "string"
    },
    {
      "name": "inStock",
      "type": "boolean",
      "default": true
    },
    {
      "name": "createdAt",
      "type": "date"
    },
    {
      "name": "ownerId",
      "type": "number",
      "required": true
    }
  ],
  "ownerField": "ownerId",
  "rbac": {
    "Admin": ["all"],
    "Manager": ["create", "read", "update"],
    "Viewer": ["read"]
  }
}
EOF

echo "Sending model creation request..."
RESPONSE=$(curl -s -X POST $BASE_URL/models/save \
  -H "Content-Type: application/json" \
  -d @/tmp/test-model.json)

echo $RESPONSE | jq .

if echo $RESPONSE | jq -e '.success' > /dev/null; then
  echo "✅ Model created successfully!"
else
  echo "❌ Model creation failed!"
fi
echo ""

echo "Step 4: Validate that model was saved"
curl -s $BASE_URL/models/Product | jq .
echo ""

echo "Step 5: List all models (should now include Product)"
curl -s $BASE_URL/models | jq '.data | map(.name)'
echo ""

echo "Step 6: Create another model (Customer)"
cat > /tmp/customer-model.json << 'EOF'
{
  "name": "Customer",
  "fields": [
    {
      "name": "id",
      "type": "number",
      "required": true,
      "unique": true
    },
    {
      "name": "email",
      "type": "string",
      "required": true,
      "unique": true
    },
    {
      "name": "firstName",
      "type": "string",
      "required": true
    },
    {
      "name": "lastName",
      "type": "string",
      "required": true
    },
    {
      "name": "phone",
      "type": "string"
    },
    {
      "name": "createdBy",
      "type": "number"
    }
  ],
  "ownerField": "createdBy",
  "rbac": {
    "Admin": ["all"],
    "Manager": ["create", "read", "update", "delete"],
    "Viewer": ["read"]
  }
}
EOF

RESPONSE=$(curl -s -X POST $BASE_URL/models/save \
  -H "Content-Type: application/json" \
  -d @/tmp/customer-model.json)

echo $RESPONSE | jq .
echo ""

echo "Step 7: Final model list"
curl -s $BASE_URL/models | jq .
echo ""

echo "=========================================="
echo "✅ Frontend UI Testing Complete!"
echo "=========================================="
echo ""
echo "Now you can:"
echo "1. Open http://localhost:5173 in your browser"
echo "2. View the models list page"
echo "3. Click 'Create New Model' to test the form"
echo "4. Fill out the form with:"
echo "   - Model name (e.g., Order, Invoice)"
echo "   - Add fields with different types"
echo "   - Set owner field (optional)"
echo "   - Configure RBAC permissions"
echo "5. Click 'Publish Model' to save"
echo ""
