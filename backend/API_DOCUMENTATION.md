# Model API Routes Documentation

RESTful API endpoints for managing dynamic model definitions with validation and persistence.

## Base URL

```
http://localhost:4000
```

## General Endpoints

### Home / Root

**GET** `/api/home`

Returns welcome information and API overview.

**Response** (200 OK):
```json
{
  "message": "Welcome to AutoCRUD-RBAC API",
  "description": "A powerful dynamic model builder with automatic CRUD operations and role-based access control",
  "version": "1.0.0",
  "timestamp": "2025-11-03T...",
  "features": [
    "Dynamic model creation",
    "Automatic CRUD operations",
    "Role-based access control",
    "Model versioning",
    "Hot reload support",
    "Comprehensive audit logs"
  ],
  "endpoints": {
    "health": {
      "path": "/health",
      "method": "GET",
      "description": "Health check endpoint"
    },
    "home": {
      "path": "/api/home",
      "method": "GET",
      "description": "Home page information"
    },
    "auth": {
      "path": "/auth/*",
      "description": "Authentication endpoints"
    },
    "models": {
      "path": "/api/models/*",
      "description": "Model management endpoints"
    },
    "crud": {
      "path": "/api/crud/:modelName/*",
      "description": "CRUD operations for dynamic models"
    }
  }
}
```

---

### API Information

**GET** `/api/home/info`

Returns detailed API information and capabilities.

**Response** (200 OK):
```json
{
  "name": "AutoCRUD-RBAC API",
  "version": "1.0.0",
  "description": "Dynamic model builder with automatic CRUD operations and role-based access control",
  "features": {
    "dynamicModels": {
      "description": "Create and manage data models dynamically",
      "capabilities": [...]
    },
    "crud": {...},
    "rbac": {...},
    "auditing": {...}
  }
}
```

---

### Health Check

**GET** `/health`

Basic health check endpoint.

**Response** (200 OK):
```json
{
  "status": "ok",
  "timestamp": 1699012345678
}
```

---

## Model Endpoints

### Base URL for Models

```
http://localhost:4000/api/models
```

## Endpoints

### 1. List All Models

**GET** `/api/models`

Returns a list of all saved model definitions with summary information.

**Response** (200 OK):
```json
{
  "success": true,
  "count": 2,
  "models": [
    {
      "name": "Employee",
      "fileName": "Employee.json",
      "path": "/models/Employee.json",
      "fieldCount": 5,
      "hasRBAC": true,
      "ownerField": "ownerId",
      "timestamps": true
    },
    {
      "name": "Product",
      "fileName": "Product.json",
      "path": "/models/Product.json",
      "fieldCount": 4,
      "hasRBAC": true,
      "timestamps": true
    }
  ]
}
```

---

### 2. Get Specific Model

**GET** `/api/models/:name`

Returns the complete definition of a specific model.

**Parameters:**
- `name` (string) - Model name (e.g., "Employee" or "Employee.json")

**Response** (200 OK):
```json
{
  "success": true,
  "model": {
    "name": "Employee",
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
      }
    ],
    "rbac": {
      "Admin": ["all"],
      "Manager": ["create", "read", "update"]
    },
    "timestamps": true
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "message": "Model 'NonExistent' not found"
}
```

---

### 3. Save Model Definition

**POST** `/api/models/save`

Validates and saves a model definition to `/models/<ModelName>.json`. If the model already exists, it will be updated.

**Request Body:**
```json
{
  "name": "Employee",
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
      "name": "email",
      "type": "string",
      "required": true,
      "unique": true
    },
    {
      "name": "age",
      "type": "number"
    },
    {
      "name": "isActive",
      "type": "boolean",
      "default": true
    }
  ],
  "ownerField": "ownerId",
  "rbac": {
    "Admin": ["all"],
    "Manager": ["create", "read", "update"],
    "Viewer": ["read"]
  },
  "timestamps": true
}
```

**Response** (201 Created or 200 OK):
```json
{
  "success": true,
  "message": "Model 'Employee' created successfully",
  "model": { /* full model definition */ },
  "path": "/models/Employee.json"
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "Model validation failed",
  "errors": [
    {
      "path": ["name"],
      "message": "Model name must be PascalCase"
    }
  ]
}
```

---

### 4. Validate Model Definition

**POST** `/api/models/validate`

Validates a model definition without saving it. Useful for checking if a model is valid before attempting to save.

**Request Body:**
```json
{
  "name": "Task",
  "fields": [
    {
      "name": "title",
      "type": "string",
      "required": true
    }
  ]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Model definition is valid",
  "model": { /* validated and normalized model */ }
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "Model validation failed",
  "errors": [
    {
      "path": ["fields", "0", "name"],
      "message": "Field name must be a valid identifier"
    }
  ]
}
```

---

### 5. Delete Model

**DELETE** `/api/models/:name`

Deletes a model definition file.

**Parameters:**
- `name` (string) - Model name to delete

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Model 'Employee' deleted successfully"
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "message": "Model 'NonExistent' not found"
}
```

---

## Model Definition Schema

A valid model definition must follow this structure:

```typescript
{
  name: string;              // PascalCase, e.g., "Employee"
  fields: Array<{
    name: string;            // Valid identifier, e.g., "firstName"
    type: "string" | "number" | "boolean" | "date" | "json" | "relation";
    required?: boolean;      // Default: false
    unique?: boolean;        // Default: false
    default?: any;           // Default value
    relation?: {             // Required if type is "relation"
      model: string;
      type: "one-to-one" | "one-to-many" | "many-to-many";
      foreignKey?: string;
      references?: string;
    }
  }>;
  ownerField?: string;       // Field name for row-level ownership
  rbac?: {                   // Role-based access control
    [roleName: string]: Array<"create" | "read" | "update" | "delete" | "all">
  };
  timestamps?: boolean;      // Default: true
}
```

## Validation Rules

1. **Model Name**: Must be PascalCase (e.g., `Employee`, `TaskItem`)
2. **Field Name**: Must be a valid identifier (e.g., `firstName`, `user_id`)
3. **Field Names**: Must be unique within the model
4. **Owner Field**: If specified, must reference an existing field
5. **Relations**: Referenced models must exist (validated when multiple models are processed)
6. **RBAC**: Each role must have at least one permission

## Field Types

| Type | Description | Example |
|------|-------------|---------|
| `string` | Text data | `"John Doe"` |
| `number` | Numeric data | `42`, `3.14` |
| `boolean` | True/false | `true`, `false` |
| `date` | Date/timestamp | ISO date string |
| `json` | JSON object | `{"key": "value"}` |
| `relation` | Relation to another model | Requires `relation` config |

## RBAC Permissions

- `create` - Create new records
- `read` - Read/view records
- `update` - Modify existing records
- `delete` - Delete records
- `all` - All permissions (expands to create, read, update, delete)

## Examples

### Example 1: Simple Model

```bash
curl -X POST http://localhost:4000/api/models/save \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Product",
    "fields": [
      {"name": "id", "type": "number", "required": true, "unique": true},
      {"name": "name", "type": "string", "required": true},
      {"name": "price", "type": "number", "required": true}
    ]
  }'
```

### Example 2: Model with RBAC

```bash
curl -X POST http://localhost:4000/api/models/save \
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
  }'
```

### Example 3: Model with Relations

```bash
curl -X POST http://localhost:4000/api/models/save \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Order",
    "fields": [
      {"name": "id", "type": "number", "required": true, "unique": true},
      {"name": "orderNumber", "type": "string", "required": true},
      {
        "name": "customer",
        "type": "relation",
        "relation": {
          "model": "Customer",
          "type": "one-to-one",
          "foreignKey": "customerId"
        }
      }
    ]
  }'
```

## Testing

A test script is provided to demonstrate all endpoints:

```bash
cd backend
./test-model-api.sh
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "path": ["field", "path", "to", "error"],
      "message": "Specific error message"
    }
  ]
}
```

Common HTTP status codes:
- `200 OK` - Success
- `201 Created` - Resource created successfully
- `400 Bad Request` - Validation error
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## File Storage

Model definitions are stored as JSON files in:
```
/models/<ModelName>.json
```

Each file contains the validated and normalized model definition with pretty formatting (2-space indentation).
