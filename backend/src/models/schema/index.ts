/**
 * Dynamic Model Schema System
 * 
 * This module provides TypeScript interfaces and Zod validators for defining
 * dynamic models with RBAC rules at runtime.
 * 
 * @example
 * ```typescript
 * import { validateModelDefinition, ModelDefinition } from './models/schema';
 * 
 * const model: ModelDefinition = {
 *   name: 'Employee',
 *   fields: [
 *     { name: 'name', type: 'string', required: true },
 *     { name: 'age', type: 'number' }
 *   ],
 *   rbac: {
 *     Admin: ['all'],
 *     Manager: ['create', 'read', 'update']
 *   }
 * };
 * 
 * const result = validateModelDefinition(model);
 * if (result.success) {
 *   console.log('Model is valid!', result.data);
 * }
 * ```
 */

// Export all schema types and validators
export {
  // Schemas
  FieldTypeSchema,
  RelationConfigSchema,
  FieldDefinitionSchema,
  PermissionSchema,
  RBACRulesSchema,
  ModelDefinitionSchema,
  
  // Types
  FieldType,
  RelationConfig,
  FieldDefinition,
  Permission,
  RBACRules,
  ModelDefinition,
  ValidationResult,
  
  // Validation functions
  validateModelDefinition,
  validateModelDefinitions,
  
  // Utility functions
  expandPermissions,
  hasPermission
} from './modelSchema';

// Export examples (useful for testing and documentation)
export {
  employeeModel,
  departmentModel,
  projectModel,
  exampleModels
} from './examples';

// Export demo functions (useful for testing)
export {
  demoValidateSingleModel,
  demoValidateInvalidModel,
  demoValidateMultipleModels,
  demoValidateBrokenRelations,
  demoRBACPermissions,
  demoJSONValidation,
  runAllDemos
} from './demo';
