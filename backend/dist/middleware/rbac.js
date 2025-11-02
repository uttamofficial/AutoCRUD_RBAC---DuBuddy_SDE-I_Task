"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultRole = void 0;
exports.authenticate = authenticate;
exports.isAdmin = isAdmin;
exports.checkPermission = checkPermission;
exports.checkOwnership = checkOwnership;
exports.requireRole = requireRole;
exports.requireAdmin = requireAdmin;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const jwt_1 = require("../utils/jwt");
const schema_1 = require("../models/schema");
// Default roles
var DefaultRole;
(function (DefaultRole) {
    DefaultRole["ADMIN"] = "Admin";
    DefaultRole["MANAGER"] = "Manager";
    DefaultRole["VIEWER"] = "Viewer";
})(DefaultRole || (exports.DefaultRole = DefaultRole = {}));
// Path to models directory
const MODELS_DIR = path_1.default.join(__dirname, '../../../models');
/**
 * Authenticate middleware - extracts and verifies JWT token
 */
function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const token = (0, jwt_1.extractTokenFromHeader)(authHeader);
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
                error: 'No token provided'
            });
            return;
        }
        // Verify and decode token
        const payload = (0, jwt_1.verifyToken)(token);
        req.user = payload;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Authentication failed',
            error: error instanceof Error ? error.message : 'Invalid token'
        });
    }
}
/**
 * Load model definition from file
 */
async function loadModelDefinition(modelName) {
    try {
        const fileName = modelName.endsWith('.json') ? modelName : `${modelName}.json`;
        const filePath = path_1.default.join(MODELS_DIR, fileName);
        const content = await fs_1.promises.readFile(filePath, 'utf-8');
        return JSON.parse(content);
    }
    catch (error) {
        return null;
    }
}
/**
 * Map HTTP methods to CRUD permissions
 */
function mapMethodToPermission(method) {
    const mapping = {
        'POST': 'create',
        'GET': 'read',
        'PUT': 'update',
        'PATCH': 'update',
        'DELETE': 'delete'
    };
    return mapping[method.toUpperCase()] || null;
}
/**
 * Check if user is admin
 */
function isAdmin(role) {
    return role === DefaultRole.ADMIN;
}
/**
 * RBAC middleware factory - creates middleware for a specific model
 * @param modelName - Name of the model to check permissions for (or use route param)
 */
function checkPermission(modelName) {
    return async (req, res, next) => {
        try {
            // Ensure user is authenticated
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }
            const { role, userId } = req.user;
            // Get model name from parameter or route params
            const actualModelName = modelName || req.params.modelName;
            if (!actualModelName) {
                res.status(400).json({
                    success: false,
                    message: 'Model name is required'
                });
                return;
            }
            // Admin has all permissions
            if (isAdmin(role)) {
                next();
                return;
            }
            // Load model definition
            const model = await loadModelDefinition(actualModelName);
            if (!model) {
                res.status(404).json({
                    success: false,
                    message: `Model '${actualModelName}' not found`
                });
                return;
            }
            // Determine required permission based on HTTP method
            const permission = mapMethodToPermission(req.method);
            if (!permission) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid HTTP method'
                });
                return;
            }
            // Check if user's role has the required permission
            if (!(0, schema_1.hasPermission)(model.rbac, role, permission)) {
                res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions',
                    required: permission,
                    role,
                    model: actualModelName
                });
                return;
            }
            // For update/delete operations, check ownership if ownerField is defined
            if ((permission === 'update' || permission === 'delete') && model.ownerField) {
                // Store model and permission info for ownership check in route handler
                req.modelDefinition = model;
                req.requiredPermission = permission;
            }
            next();
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Permission check failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
}
/**
 * Ownership validation middleware
 * Checks if the user owns the record they're trying to modify
 * Should be used after checkPermission for update/delete operations
 */
function checkOwnership(modelName, getRecordOwnerId) {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }
            const { role, userId } = req.user;
            // Admin bypasses ownership check
            if (isAdmin(role)) {
                next();
                return;
            }
            // Load model definition
            const model = await loadModelDefinition(modelName);
            if (!model || !model.ownerField) {
                // No ownership field defined, skip check
                next();
                return;
            }
            // Get the record's owner ID
            const recordOwnerId = await getRecordOwnerId(req);
            if (recordOwnerId === null) {
                res.status(404).json({
                    success: false,
                    message: 'Record not found'
                });
                return;
            }
            // Check if user owns the record
            if (recordOwnerId !== userId) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied: You can only modify your own records',
                    ownerField: model.ownerField
                });
                return;
            }
            next();
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Ownership check failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
}
/**
 * Role validation middleware - ensures user has one of the allowed roles
 */
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }
        const { role } = req.user;
        if (!allowedRoles.includes(role)) {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
                requiredRoles: allowedRoles,
                userRole: role
            });
            return;
        }
        next();
    };
}
/**
 * Admin-only middleware
 */
function requireAdmin(req, res, next) {
    requireRole(DefaultRole.ADMIN)(req, res, next);
}
