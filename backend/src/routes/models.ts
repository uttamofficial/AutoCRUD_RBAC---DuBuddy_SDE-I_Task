import { Router, Request, Response } from 'express';
import { validateModelDefinition, ModelDefinition } from '../models/schema';

const router = Router();

/**
 * Example: POST /api/models/validate
 * Validates a model definition sent in the request body
 */
router.post('/validate', (req: Request, res: Response) => {
  try {
    const modelJson = req.body;
    const result = validateModelDefinition(modelJson);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Model definition is valid',
        model: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Model definition validation failed',
        errors: result.errors
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Example: POST /api/models/create
 * Creates and saves a new model definition (placeholder - needs storage implementation)
 */
router.post('/create', (req: Request, res: Response) => {
  try {
    const modelJson = req.body;
    const result = validateModelDefinition(modelJson);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid model definition',
        errors: result.errors
      });
    }
    
    // TODO: Save the model definition to database or file system
    // For now, just return success
    res.status(201).json({
      success: true,
      message: 'Model definition created successfully',
      model: result.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Example: GET /api/models/example/:name
 * Returns an example model definition
 */
router.get('/example/:name', (req: Request, res: Response) => {
  const { name } = req.params;
  
  const examples: Record<string, ModelDefinition> = {
    employee: {
      name: 'Employee',
      fields: [
        { name: 'id', type: 'number', required: true, unique: true },
        { name: 'name', type: 'string', required: true },
        { name: 'email', type: 'string', required: true, unique: true },
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
    },
    product: {
      name: 'Product',
      fields: [
        { name: 'id', type: 'number', required: true, unique: true },
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'string' },
        { name: 'price', type: 'number', required: true },
        { name: 'inStock', type: 'boolean', default: true }
      ],
      rbac: {
        Admin: ['all'],
        Staff: ['read', 'update']
      }
    }
  };
  
  const example = examples[name.toLowerCase()];
  
  if (example) {
    res.json({
      success: true,
      model: example
    });
  } else {
    res.status(404).json({
      success: false,
      message: `Example model '${name}' not found`,
      available: Object.keys(examples)
    });
  }
});

export default router;
