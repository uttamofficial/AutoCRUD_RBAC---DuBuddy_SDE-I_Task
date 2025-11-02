"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAllDemos = exports.demoJSONValidation = exports.demoRBACPermissions = exports.demoValidateBrokenRelations = exports.demoValidateMultipleModels = exports.demoValidateInvalidModel = exports.demoValidateSingleModel = exports.exampleModels = exports.projectModel = exports.departmentModel = exports.employeeModel = exports.hasPermission = exports.expandPermissions = exports.validateModelDefinitions = exports.validateModelDefinition = exports.ModelDefinitionSchema = exports.RBACRulesSchema = exports.PermissionSchema = exports.FieldDefinitionSchema = exports.RelationConfigSchema = exports.FieldTypeSchema = void 0;
// Export all schema types and validators
var modelSchema_1 = require("./modelSchema");
// Schemas
Object.defineProperty(exports, "FieldTypeSchema", { enumerable: true, get: function () { return modelSchema_1.FieldTypeSchema; } });
Object.defineProperty(exports, "RelationConfigSchema", { enumerable: true, get: function () { return modelSchema_1.RelationConfigSchema; } });
Object.defineProperty(exports, "FieldDefinitionSchema", { enumerable: true, get: function () { return modelSchema_1.FieldDefinitionSchema; } });
Object.defineProperty(exports, "PermissionSchema", { enumerable: true, get: function () { return modelSchema_1.PermissionSchema; } });
Object.defineProperty(exports, "RBACRulesSchema", { enumerable: true, get: function () { return modelSchema_1.RBACRulesSchema; } });
Object.defineProperty(exports, "ModelDefinitionSchema", { enumerable: true, get: function () { return modelSchema_1.ModelDefinitionSchema; } });
// Validation functions
Object.defineProperty(exports, "validateModelDefinition", { enumerable: true, get: function () { return modelSchema_1.validateModelDefinition; } });
Object.defineProperty(exports, "validateModelDefinitions", { enumerable: true, get: function () { return modelSchema_1.validateModelDefinitions; } });
// Utility functions
Object.defineProperty(exports, "expandPermissions", { enumerable: true, get: function () { return modelSchema_1.expandPermissions; } });
Object.defineProperty(exports, "hasPermission", { enumerable: true, get: function () { return modelSchema_1.hasPermission; } });
// Export examples (useful for testing and documentation)
var examples_1 = require("./examples");
Object.defineProperty(exports, "employeeModel", { enumerable: true, get: function () { return examples_1.employeeModel; } });
Object.defineProperty(exports, "departmentModel", { enumerable: true, get: function () { return examples_1.departmentModel; } });
Object.defineProperty(exports, "projectModel", { enumerable: true, get: function () { return examples_1.projectModel; } });
Object.defineProperty(exports, "exampleModels", { enumerable: true, get: function () { return examples_1.exampleModels; } });
// Export demo functions (useful for testing)
var demo_1 = require("./demo");
Object.defineProperty(exports, "demoValidateSingleModel", { enumerable: true, get: function () { return demo_1.demoValidateSingleModel; } });
Object.defineProperty(exports, "demoValidateInvalidModel", { enumerable: true, get: function () { return demo_1.demoValidateInvalidModel; } });
Object.defineProperty(exports, "demoValidateMultipleModels", { enumerable: true, get: function () { return demo_1.demoValidateMultipleModels; } });
Object.defineProperty(exports, "demoValidateBrokenRelations", { enumerable: true, get: function () { return demo_1.demoValidateBrokenRelations; } });
Object.defineProperty(exports, "demoRBACPermissions", { enumerable: true, get: function () { return demo_1.demoRBACPermissions; } });
Object.defineProperty(exports, "demoJSONValidation", { enumerable: true, get: function () { return demo_1.demoJSONValidation; } });
Object.defineProperty(exports, "runAllDemos", { enumerable: true, get: function () { return demo_1.runAllDemos; } });
