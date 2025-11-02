import { z } from 'zod';

/**
 * Supported field types for dynamic models
 */
export const FieldTypeSchema = z.enum([
  'string',
  'number',
  'boolean',
  'date',
  'json',
  'relation'
]);

export type FieldType = z.infer<typeof FieldTypeSchema>;

/**
 * Relation configuration for related models
 */
export const RelationConfigSchema = z.object({
  model: z.string().min(1, 'Related model name is required'),
  type: z.enum(['one-to-one', 'one-to-many', 'many-to-many']),
  foreignKey: z.string().optional(),
  references: z.string().optional()
});

export type RelationConfig = z.infer<typeof RelationConfigSchema>;

/**
 * Field definition for a model
 */
export const FieldDefinitionSchema = z.object({
  name: z.string()
    .min(1, 'Field name is required')
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Field name must be a valid identifier'),
  type: FieldTypeSchema,
  required: z.boolean().default(false).optional(),
  unique: z.boolean().default(false).optional(),
  default: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
  relation: RelationConfigSchema.optional()
}).refine(
  (data) => {
    // If type is relation, relation config must be provided
    if (data.type === 'relation' && !data.relation) {
      return false;
    }
    // If type is not relation, relation config should not be provided
    if (data.type !== 'relation' && data.relation) {
      return false;
    }
    return true;
  },
  {
    message: 'Relation type fields must have relation config, and vice versa'
  }
);

export type FieldDefinition = z.infer<typeof FieldDefinitionSchema>;

/**
 * RBAC permission types
 */
export const PermissionSchema = z.enum([
  'create',
  'read',
  'update',
  'delete',
  'all'
]);

export type Permission = z.infer<typeof PermissionSchema>;

/**
 * RBAC rules mapping role names to permissions
 */
export const RBACRulesSchema = z.record(
  z.string().min(1, 'Role name is required'),
  z.array(PermissionSchema).min(1, 'At least one permission is required')
);

export type RBACRules = z.infer<typeof RBACRulesSchema>;

/**
 * Complete dynamic model definition
 */
export const ModelDefinitionSchema = z.object({
  name: z.string()
    .min(1, 'Model name is required')
    .regex(/^[A-Z][a-zA-Z0-9]*$/, 'Model name must be PascalCase'),
  fields: z.array(FieldDefinitionSchema)
    .min(1, 'At least one field is required')
    .refine(
      (fields) => {
        // Check for duplicate field names
        const names = fields.map(f => f.name);
        return names.length === new Set(names).size;
      },
      {
        message: 'Field names must be unique'
      }
    ),
  ownerField: z.string().optional(),
  rbac: RBACRulesSchema.optional(),
  timestamps: z.boolean().default(true).optional()
}).refine(
  (data) => {
    // If ownerField is specified, it must exist in fields
    if (data.ownerField) {
      const hasOwnerField = data.fields.some(f => f.name === data.ownerField);
      return hasOwnerField;
    }
    return true;
  },
  {
    message: 'ownerField must reference an existing field'
  }
);

export type ModelDefinition = z.infer<typeof ModelDefinitionSchema>;

/**
 * Validation result type
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Array<{
    path: string[];
    message: string;
  }>;
}

/**
 * Validates a model definition JSON structure
 * @param modelJson - The model definition object to validate
 * @returns ValidationResult with parsed data or errors
 */
export function validateModelDefinition(modelJson: unknown): ValidationResult<ModelDefinition> {
  try {
    const result = ModelDefinitionSchema.safeParse(modelJson);
    
    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    } else {
      return {
        success: false,
        errors: result.error.issues.map(err => ({
          path: err.path.map(String),
          message: err.message
        }))
      };
    }
  } catch (error) {
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
export function validateModelDefinitions(models: unknown[]): ValidationResult<ModelDefinition[]> {
  const validatedModels: ModelDefinition[] = [];
  const allErrors: Array<{ path: string[]; message: string }> = [];

  // First pass: validate each model individually
  for (let i = 0; i < models.length; i++) {
    const result = validateModelDefinition(models[i]);
    
    if (!result.success) {
      allErrors.push(...(result.errors || []).map(err => ({
        path: [`models[${i}]`, ...err.path],
        message: err.message
      })));
    } else if (result.data) {
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
export function expandPermissions(permissions: Permission[]): Permission[] {
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
export function hasPermission(
  rbac: RBACRules | undefined,
  role: string,
  permission: Permission
): boolean {
  if (!rbac || !rbac[role]) {
    return false;
  }
  
  const permissions = expandPermissions(rbac[role]);
  return permissions.includes(permission);
}
