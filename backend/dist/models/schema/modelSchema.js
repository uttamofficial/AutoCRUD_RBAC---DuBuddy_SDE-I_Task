"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelDefinitionSchema = exports.RBACRulesSchema = exports.PermissionSchema = exports.FieldDefinitionSchema = exports.RelationConfigSchema = exports.FieldTypeSchema = void 0;
exports.validateModelDefinition = validateModelDefinition;
exports.validateModelDefinitions = validateModelDefinitions;
exports.expandPermissions = expandPermissions;
exports.hasPermission = hasPermission;
const zod_1 = require("zod");
/**
 * Supported field types for dynamic models
 */
exports.FieldTypeSchema = zod_1.z.enum([
    'string',
    'number',
    'boolean',
    'date',
    'json',
    'relation'
]);
/**
 * Relation configuration for related models
 */
exports.RelationConfigSchema = zod_1.z.object({
    model: zod_1.z.string().min(1, 'Related model name is required'),
    type: zod_1.z.enum(['one-to-one', 'one-to-many', 'many-to-many']),
    foreignKey: zod_1.z.string().optional(),
    references: zod_1.z.string().optional()
});
/**
 * Field definition for a model
 */
exports.FieldDefinitionSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(1, 'Field name is required')
        .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Field name must be a valid identifier'),
    type: exports.FieldTypeSchema,
    required: zod_1.z.boolean().default(false).optional(),
    unique: zod_1.z.boolean().default(false).optional(),
    default: zod_1.z.union([zod_1.z.string(), zod_1.z.number(), zod_1.z.boolean(), zod_1.z.null()]).optional(),
    relation: exports.RelationConfigSchema.optional()
}).refine((data) => {
    // If type is relation, relation config must be provided
    if (data.type === 'relation' && !data.relation) {
        return false;
    }
    // If type is not relation, relation config should not be provided
    if (data.type !== 'relation' && data.relation) {
        return false;
    }
    return true;
}, {
    message: 'Relation type fields must have relation config, and vice versa'
});
/**
 * RBAC permission types
 */
exports.PermissionSchema = zod_1.z.enum([
    'create',
    'read',
    'update',
    'delete',
    'all'
]);
/**
 * RBAC rules mapping role names to permissions
 */
exports.RBACRulesSchema = zod_1.z.record(zod_1.z.string().min(1, 'Role name is required'), zod_1.z.array(exports.PermissionSchema).min(1, 'At least one permission is required'));
/**
 * Complete dynamic model definition
 */
exports.ModelDefinitionSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(1, 'Model name is required')
        .regex(/^[A-Z][a-zA-Z0-9]*$/, 'Model name must be PascalCase'),
    fields: zod_1.z.array(exports.FieldDefinitionSchema)
        .min(1, 'At least one field is required')
        .refine((fields) => {
        // Check for duplicate field names
        const names = fields.map(f => f.name);
        return names.length === new Set(names).size;
    }, {
        message: 'Field names must be unique'
    }),
    ownerField: zod_1.z.string().optional(),
    rbac: exports.RBACRulesSchema.optional(),
    timestamps: zod_1.z.boolean().default(true).optional()
}).refine((data) => {
    // If ownerField is specified, it must exist in fields
    if (data.ownerField) {
        const hasOwnerField = data.fields.some(f => f.name === data.ownerField);
        return hasOwnerField;
    }
    return true;
}, {
    message: 'ownerField must reference an existing field'
});
/**
 * Validates a model definition JSON structure
 * @param modelJson - The model definition object to validate
 * @returns ValidationResult with parsed data or errors
 */
function validateModelDefinition(modelJson) {
    try {
        const result = exports.ModelDefinitionSchema.safeParse(modelJson);
        if (result.success) {
            return {
                success: true,
                data: result.data
            };
        }
        else {
            return {
                success: false,
                errors: result.error.issues.map(err => ({
                    path: err.path.map(String),
                    message: err.message
                }))
            };
        }
    }
    catch (error) {
        return {
            success: false,
            errors: [{
                    path: [],
                    message: error instanceof Error ? error.message : 'Unknown validation error'
                }]
        };
    }
}
/**
 * Validates multiple model definitions and checks for cross-model relation integrity
 * @param models - Array of model definitions to validate
 * @returns ValidationResult with all models or errors
 */
function validateModelDefinitions(models) {
    const validatedModels = [];
    const allErrors = [];
    // First pass: validate each model individually
    for (let i = 0; i < models.length; i++) {
        const result = validateModelDefinition(models[i]);
        if (!result.success) {
            allErrors.push(...(result.errors || []).map(err => ({
                path: [`models[${i}]`, ...err.path],
                message: err.message
            })));
        }
        else if (result.data) {
            validatedModels.push(result.data);
        }
    }
    if (allErrors.length > 0) {
        return {
            success: false,
            errors: allErrors
        };
    }
    // Second pass: validate relations reference existing models
    const modelNames = new Set(validatedModels.map(m => m.name));
    for (let i = 0; i < validatedModels.length; i++) {
        const model = validatedModels[i];
        for (const field of model.fields) {
            if (field.type === 'relation' && field.relation) {
                if (!modelNames.has(field.relation.model)) {
                    allErrors.push({
                        path: [`models[${i}]`, 'fields', field.name, 'relation', 'model'],
                        message: `Relation references unknown model: ${field.relation.model}`
                    });
                }
            }
        }
    }
    if (allErrors.length > 0) {
        return {
            success: false,
            errors: allErrors
        };
    }
    return {
        success: true,
        data: validatedModels
    };
}
/**
 * Expands 'all' permission to individual permissions
 * @param permissions - Array of permissions that may include 'all'
 * @returns Array of individual permissions
 */
function expandPermissions(permissions) {
    if (permissions.includes('all')) {
        return ['create', 'read', 'update', 'delete'];
    }
    return permissions.filter(p => p !== 'all');
}
/**
 * Checks if a role has a specific permission
 * @param rbac - RBAC rules object
 * @param role - Role name to check
 * @param permission - Permission to check for
 * @returns true if role has permission
 */
function hasPermission(rbac, role, permission) {
    if (!rbac || !rbac[role]) {
        return false;
    }
    const permissions = expandPermissions(rbac[role]);
    return permissions.includes(permission);
}
