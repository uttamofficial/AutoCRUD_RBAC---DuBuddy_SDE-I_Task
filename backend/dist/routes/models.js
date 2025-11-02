"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const schema_1 = require("../models/schema");
const router = (0, express_1.Router)();
/**
 * Example: POST /api/models/validate
 * Validates a model definition sent in the request body
 */
router.post('/validate', (req, res) => {
    try {
        const modelJson = req.body;
        const result = (0, schema_1.validateModelDefinition)(modelJson);
        if (result.success) {
            res.json({
                success: true,
                message: 'Model definition is valid',
                model: result.data
            });
        }
        else {
            res.status(400).json({
                success: false,
                message: 'Model definition validation failed',
                errors: result.errors
            });
        }
    }
    catch (error) {
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
router.post('/create', (req, res) => {
    try {
        const modelJson = req.body;
        const result = (0, schema_1.validateModelDefinition)(modelJson);
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
    }
    catch (error) {
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
router.get('/example/:name', (req, res) => {
    const { name } = req.params;
    const examples = {
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
    }
    else {
        res.status(404).json({
            success: false,
            message: `Example model '${name}' not found`,
            available: Object.keys(examples)
        });
    }
});
exports.default = router;
