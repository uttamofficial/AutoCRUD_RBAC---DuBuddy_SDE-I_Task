import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /
 * Home page endpoint - returns welcome information and API details
 */
router.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Welcome to AutoCRUD-RBAC API',
    description: 'A powerful dynamic model builder with automatic CRUD operations and role-based access control',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    features: [
      'Dynamic model creation',
      'Automatic CRUD operations',
      'Role-based access control',
      'Model versioning',
      'Hot reload support',
      'Comprehensive audit logs'
    ],
    endpoints: {
      health: {
        path: '/health',
        method: 'GET',
        description: 'Health check endpoint'
      },
      home: {
        path: '/api/home',
        method: 'GET',
        description: 'Home page information'
      },
      auth: {
        path: '/auth/*',
        description: 'Authentication endpoints'
      },
      models: {
        path: '/api/models/*',
        description: 'Model management endpoints'
      },
      crud: {
        path: '/api/crud/:modelName/*',
        description: 'CRUD operations for dynamic models'
      }
    },
    documentation: {
      api: 'See API_DOCUMENTATION.md for detailed API documentation',
      rbac: 'See RBAC_DOCUMENTATION.md for role-based access control documentation'
    },
    links: {
      models: '/api/models',
      health: '/health'
    }
  });
});

/**
 * GET /info
 * Detailed API information endpoint
 */
router.get('/info', (_req: Request, res: Response) => {
  res.json({
    name: 'AutoCRUD-RBAC API',
    version: '1.0.0',
    description: 'Dynamic model builder with automatic CRUD operations and role-based access control',
    author: 'DuBuddy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    features: {
      dynamicModels: {
        description: 'Create and manage data models dynamically',
        capabilities: [
          'Define fields with types and validation',
          'Establish relationships between models',
          'Version control for model schemas',
          'Hot reload model changes'
        ]
      },
      crud: {
        description: 'Automatic CRUD operations for all models',
        operations: ['Create', 'Read', 'Update', 'Delete', 'List with pagination']
      },
      rbac: {
        description: 'Role-based access control',
        capabilities: [
          'Define custom roles',
          'Granular permissions per model',
          'Field-level access control',
          'Operation-level permissions'
        ]
      },
      auditing: {
        description: 'Comprehensive audit logging',
        tracked: ['All CRUD operations', 'Model schema changes', 'RBAC configuration changes']
      }
    }
  });
});

export default router;
