import {
  validateModelDefinition,
  validateModelDefinitions,
  hasPermission,
  expandPermissions
} from './modelSchema';
import { exampleModels, employeeModel } from './examples';

/**
 * Demo: Validate a single model
 */
export function demoValidateSingleModel() {
  console.log('=== Demo: Validate Single Model ===\n');
  
  const result = validateModelDefinition(employeeModel);
  
  if (result.success) {
    console.log('✓ Employee model is valid!');
    console.log('Model name:', result.data?.name);
    console.log('Number of fields:', result.data?.fields.length);
    console.log('Owner field:', result.data?.ownerField);
    console.log('RBAC roles:', Object.keys(result.data?.rbac || {}));
  } else {
    console.log('✗ Validation failed:');
    result.errors?.forEach(err => {
      console.log(`  - ${err.path.join('.')}: ${err.message}`);
    });
  }
  console.log();
}

/**
 * Demo: Validate invalid model
 */
export function demoValidateInvalidModel() {
  console.log('=== Demo: Validate Invalid Model ===\n');
  
  const invalidModel = {
    name: 'invalid_name', // Should be PascalCase
    fields: [
      {
        name: 'field1',
        type: 'string'
        // missing required property
      },
      {
        name: 'field1', // Duplicate name
        type: 'number'
      }
    ]
  };
  
  const result = validateModelDefinition(invalidModel);
  
  if (!result.success) {
    console.log('✗ Validation failed (as expected):');
    result.errors?.forEach(err => {
      console.log(`  - ${err.path.join('.')}: ${err.message}`);
    });
  }
  console.log();
}

/**
 * Demo: Validate multiple models with relations
 */
export function demoValidateMultipleModels() {
  console.log('=== Demo: Validate Multiple Related Models ===\n');
  
  const result = validateModelDefinitions(exampleModels);
  
  if (result.success) {
    console.log('✓ All models are valid!');
    console.log('Models validated:', result.data?.map(m => m.name).join(', '));
  } else {
    console.log('✗ Validation failed:');
    result.errors?.forEach(err => {
      console.log(`  - ${err.path.join('.')}: ${err.message}`);
    });
  }
  console.log();
}

/**
 * Demo: Validate models with broken relations
 */
export function demoValidateBrokenRelations() {
  console.log('=== Demo: Validate Models with Broken Relations ===\n');
  
  const modelWithBrokenRelation = {
    name: 'Task',
    fields: [
      {
        name: 'id',
        type: 'number',
        required: true,
        unique: true
      },
      {
        name: 'assignee',
        type: 'relation',
        relation: {
          model: 'NonExistentModel', // This model doesn't exist
          type: 'one-to-one'
        }
      }
    ]
  };
  
  const result = validateModelDefinitions([modelWithBrokenRelation]);
  
  if (!result.success) {
    console.log('✗ Validation failed (as expected):');
    result.errors?.forEach(err => {
      console.log(`  - ${err.path.join('.')}: ${err.message}`);
    });
  }
  console.log();
}

/**
 * Demo: RBAC permission checking
 */
export function demoRBACPermissions() {
  console.log('=== Demo: RBAC Permission Checking ===\n');
  
  const rbac = employeeModel.rbac;
  
  console.log('Admin permissions:', expandPermissions(['all']));
  console.log('Admin can create:', hasPermission(rbac, 'Admin', 'create'));
  console.log('Admin can delete:', hasPermission(rbac, 'Admin', 'delete'));
  console.log();
  
  console.log('Manager can create:', hasPermission(rbac, 'Manager', 'create'));
  console.log('Manager can delete:', hasPermission(rbac, 'Manager', 'delete'));
  console.log();
  
  console.log('Viewer can read:', hasPermission(rbac, 'Viewer', 'read'));
  console.log('Viewer can create:', hasPermission(rbac, 'Viewer', 'create'));
  console.log();
}

/**
 * Demo: JSON validation from external source
 */
export function demoJSONValidation() {
  console.log('=== Demo: Validate JSON from External Source ===\n');
  
  const jsonString = `{
    "name": "Employee",
    "fields": [
      { "name": "name", "type": "string", "required": true },
      { "name": "age", "type": "number" },
      { "name": "isActive", "type": "boolean", "default": true }
    ],
    "ownerField": "ownerId",
    "rbac": {
      "Admin": ["all"],
      "Manager": ["create", "read", "update"],
      "Viewer": ["read"]
    }
  }`;
  
  try {
    const parsed = JSON.parse(jsonString);
    
    // Add missing field that was referenced as ownerField
    parsed.fields.push({
      name: 'ownerId',
      type: 'number',
      required: true
    });
    
    const result = validateModelDefinition(parsed);
    
    if (result.success) {
      console.log('✓ JSON model is valid!');
      console.log('Parsed model:', JSON.stringify(result.data, null, 2));
    } else {
      console.log('✗ Validation failed:');
      result.errors?.forEach(err => {
        console.log(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
  } catch (error) {
    console.log('✗ JSON parsing failed:', error);
  }
  console.log();
}

/**
 * Run all demos
 */
export function runAllDemos() {
  demoValidateSingleModel();
  demoValidateInvalidModel();
  demoValidateMultipleModels();
  demoValidateBrokenRelations();
  demoRBACPermissions();
  demoJSONValidation();
}

// Uncomment to run demos when file is executed directly
// if (require.main === module) {
//   runAllDemos();
// }
