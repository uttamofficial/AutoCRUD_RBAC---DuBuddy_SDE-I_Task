# Dynamic Model Schema System

A TypeScript-based system for defining, validating, and managing dynamic models with Role-Based Access Control (RBAC) rules.

## Features

- ✅ **Type-safe model definitions** using TypeScript interfaces
- ✅ **Runtime validation** using Zod schemas
- ✅ **RBAC support** with role-based permissions (create, read, update, delete, all)
- ✅ **Relation support** (one-to-one, one-to-many, many-to-many)
- ✅ **Field types**: string, number, boolean, date, json, relation
- ✅ **Field constraints**: required, unique, default values
- ✅ **Cross-model validation** for relation integrity
- ✅ **Owner field** tracking for row-level security

## Installation

The schema system uses Zod for validation:

```bash
npm install zod
```

## Usage

### Basic Model Definition

```typescript
import { ModelDefinition, validateModelDefinition } from './models/schema';

const employeeModel: ModelDefinition = {
  name: 'Employee',
  fields: [
    { name: 'name', type: 'string', required: true },
    { name: 'age', type: 'number' },
    { name: 'isActive', type: 'boolean', default: true },
    { name: 'ownerId', type: 'number', required: true }
  ],
  ownerField: 'ownerId',
  rbac: {
    Admin: ['all'],
    Manager: ['create', 'read', 'update'],
    Viewer: ['read']
  },
  timestamps: true
};

// Validate the model
const result = validateModelDefinition(employeeModel);
if (result.success) {
  console.log('Valid model:', result.data);
} else {
  console.error('Validation errors:', result.errors);
}
```

### Model with Relations

```typescript
const departmentModel: ModelDefinition = {
  name: 'Department',
  fields: [
    { name: 'id', type: 'number', required: true, unique: true },
    { name: 'name', type: 'string', required: true },
    {
      name: 'manager',
      type: 'relation',
      relation: {
        model: 'Employee',
        type: 'one-to-one',
        foreignKey: 'managerId',
        references: 'id'
      }
    }
  ],
  rbac: {
    Admin: ['all'],
    Manager: ['read', 'update']
  }
};
```

### Validating Multiple Models

```typescript
import { validateModelDefinitions } from './models/schema';

const models = [employeeModel, departmentModel, projectModel];

const result = validateModelDefinitions(models);
if (result.success) {
  console.log('All models valid!');
  // result.data contains the validated models
} else {
  // result.errors contains validation errors including broken relations
  console.error('Validation errors:', result.errors);
}
```

### RBAC Permission Checking

```typescript
import { hasPermission, expandPermissions } from './models/schema';

const rbac = employeeModel.rbac;

// Check if a role has a specific permission
console.log(hasPermission(rbac, 'Admin', 'delete')); // true
console.log(hasPermission(rbac, 'Viewer', 'delete')); // false

// Expand 'all' permission to individual permissions
console.log(expandPermissions(['all'])); 
// ['create', 'read', 'update', 'delete']
```

### Validating JSON from External Source

```typescript
import { validateModelDefinition } from './models/schema';

const jsonString = `{
  "name": "Employee",
  "fields": [
    { "name": "name", "type": "string", "required": true },
    { "name": "age", "type": "number" }
  ],
  "rbac": {
    "Admin": ["all"]
  }
}`;

const parsed = JSON.parse(jsonString);
const result = validateModelDefinition(parsed);

if (result.success) {
  // Use result.data (typed as ModelDefinition)
  console.log('Valid model:', result.data);
} else {
  // Handle validation errors
  result.errors?.forEach(err => {
    console.log(`${err.path.join('.')}: ${err.message}`);
  });
}
```

## Field Types

| Type | Description | Example |
|------|-------------|---------|
| `string` | Text data | `"John Doe"` |
| `number` | Numeric data | `42`, `3.14` |
| `boolean` | True/false | `true`, `false` |
| `date` | Date/timestamp | ISO date string |
| `json` | JSON object | `{"key": "value"}` |
| `relation` | Relation to another model | Requires `relation` config |

## Field Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `name` | string | Yes | - | Field name (must be valid identifier) |
| `type` | FieldType | Yes | - | Field data type |
| `required` | boolean | No | `false` | Whether field is required |
| `unique` | boolean | No | `false` | Whether field must be unique |
| `default` | any | No | - | Default value for field |
| `relation` | RelationConfig | No | - | Relation configuration (required if type is 'relation') |

## Relation Types

| Type | Description |
|------|-------------|
| `one-to-one` | One record relates to exactly one record in another model |
| `one-to-many` | One record relates to many records in another model |
| `many-to-many` | Many records relate to many records in another model |

## RBAC Permissions

| Permission | Description |
|------------|-------------|
| `create` | Create new records |
| `read` | Read/view records |
| `update` | Modify existing records |
| `delete` | Delete records |
| `all` | All permissions (expands to create, read, update, delete) |

## Model Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `name` | string | Yes | - | Model name (must be PascalCase) |
| `fields` | FieldDefinition[] | Yes | - | Array of field definitions |
| `ownerField` | string | No | - | Field name for row-level ownership |
| `rbac` | RBACRules | No | - | Role-based access control rules |
| `timestamps` | boolean | No | `true` | Auto-add createdAt/updatedAt |

## Validation Rules

### Model Name
- Must be PascalCase (e.g., `Employee`, `DailyReport`)
- Matches regex: `^[A-Z][a-zA-Z0-9]*$`

### Field Name
- Must be a valid JavaScript identifier
- Matches regex: `^[a-zA-Z_][a-zA-Z0-9_]*$`
- Must be unique within the model

### Relations
- If field type is `relation`, `relation` config must be provided
- Referenced model must exist when validating multiple models
- `foreignKey` and `references` are optional but recommended for clarity

### Owner Field
- If specified, must reference an existing field in the model
- Typically used for row-level security

## Error Handling

Validation functions return a `ValidationResult<T>` object:

```typescript
interface ValidationResult<T> {
  success: boolean;
  data?: T;              // Present if success is true
  errors?: Array<{       // Present if success is false
    path: string[];      // Path to the error (e.g., ['fields', '0', 'name'])
    message: string;     // Human-readable error message
  }>;
}
```

## Examples

See the `examples.ts` file for complete model examples including:
- **Employee**: Basic model with RBAC and owner field
- **Department**: Model with one-to-one relation
- **Project**: Model with many-to-many relation and JSON field

## Demo

Run the demo to see validation in action:

```typescript
import { runAllDemos } from './models/schema';

runAllDemos();
```

This will demonstrate:
- ✅ Valid model validation
- ❌ Invalid model validation
- ✅ Multiple models with relations
- ❌ Broken relation validation
- 🔐 RBAC permission checking
- 📄 JSON parsing and validation

## API Reference

### `validateModelDefinition(modelJson: unknown): ValidationResult<ModelDefinition>`
Validates a single model definition.

### `validateModelDefinitions(models: unknown[]): ValidationResult<ModelDefinition[]>`
Validates multiple models and checks cross-model relation integrity.

### `expandPermissions(permissions: Permission[]): Permission[]`
Expands 'all' permission to individual permissions.

### `hasPermission(rbac: RBACRules | undefined, role: string, permission: Permission): boolean`
Checks if a role has a specific permission.

## Integration with Backend

This schema system can be integrated with:
- **Dynamic Prisma Schema Generation**: Convert model definitions to Prisma schema
- **REST API Generation**: Auto-generate CRUD endpoints based on models
- **GraphQL Schema**: Generate GraphQL types and resolvers
- **Validation Middleware**: Validate incoming data against model definitions
- **Authorization Middleware**: Enforce RBAC rules on API endpoints

## License

MIT
