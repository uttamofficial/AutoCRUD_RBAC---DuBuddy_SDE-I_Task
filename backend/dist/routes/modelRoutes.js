"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const schema_1 = require("../models/schema");
const router = (0, express_1.Router)();
// Path to the models directory (relative to project root)
const MODELS_DIR = path_1.default.join(__dirname, '../../../models');
const VERSIONS_DIR = path_1.default.join(MODELS_DIR, 'versions');
const AUDIT_DIR = path_1.default.join(__dirname, '../../../audit-logs');
// Model cache for hot reload
let modelCache = new Map();
/**
 * Ensure directories exist
 */
async function ensureDirectories() {
    for (const dir of [MODELS_DIR, VERSIONS_DIR, AUDIT_DIR]) {
        try {
            await fs_1.promises.access(dir);
        }
        catch {
            await fs_1.promises.mkdir(dir, { recursive: true });
        }
    }
}
/**
 * Write audit log entry
 */
async function writeAuditLog(action, resourceType, resourceName, userId, userEmail, details) {
    try {
        await ensureDirectories();
        const logEntry = {
            timestamp: new Date().toISOString(),
            action,
            resourceType,
            resourceName,
            userId: userId || null,
            userEmail: userEmail || 'system',
            details: details || {},
            ip: null // Can be added from req.ip
        };
        const date = new Date().toISOString().split('T')[0];
        const logFile = path_1.default.join(AUDIT_DIR, `audit-${date}.json`);
        let logs = [];
        try {
            const content = await fs_1.promises.readFile(logFile, 'utf-8');
            logs = JSON.parse(content);
        }
        catch {
            // File doesn't exist yet
        }
        logs.push(logEntry);
        await fs_1.promises.writeFile(logFile, JSON.stringify(logs, null, 2), 'utf-8');
    }
    catch (error) {
        console.error('Failed to write audit log:', error);
    }
}
/**
 * Save versioned model
 */
async function saveVersionedModel(model) {
    await ensureDirectories();
    const versionFiles = await fs_1.promises.readdir(VERSIONS_DIR);
    const modelVersions = versionFiles.filter(f => f.startsWith(`${model.name}_v`) && f.endsWith('.json'));
    // Get next version number
    let nextVersion = 1;
    if (modelVersions.length > 0) {
        const versions = modelVersions.map(f => {
            const match = f.match(/_v(\d+)\.json$/);
            return match ? parseInt(match[1]) : 0;
        });
        nextVersion = Math.max(...versions) + 1;
    }
    // Save versioned file
    const versionedModel = {
        ...model,
        _version: nextVersion,
        _timestamp: new Date().toISOString()
    };
    const versionFile = path_1.default.join(VERSIONS_DIR, `${model.name}_v${nextVersion}.json`);
    await fs_1.promises.writeFile(versionFile, JSON.stringify(versionedModel, null, 2), 'utf-8');
    return nextVersion;
}
/**
 * Ensure the models directory exists
 */
async function ensureModelsDirectory() {
    await ensureDirectories();
}
/**
 * POST /api/models/save
 * Validates and saves a model definition to /models/<modelName>.json
 * Also creates versioned copy in /models/versions/
 */
router.post('/save', async (req, res) => {
    try {
        const modelJson = req.body;
        // Validate the model definition
        const validationResult = (0, schema_1.validateModelDefinition)(modelJson);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: 'Model validation failed',
                errors: validationResult.errors
            });
        }
        const model = validationResult.data;
        const fileName = `${model.name}.json`;
        const filePath = path_1.default.join(MODELS_DIR, fileName);
        // Ensure models directory exists
        await ensureModelsDirectory();
        // Check if file already exists
        let isUpdate = false;
        try {
            await fs_1.promises.access(filePath);
            isUpdate = true;
        }
        catch {
            // File doesn't exist, this is a new model
        }
        // Save versioned copy
        const version = await saveVersionedModel(model);
        // Add metadata
        const modelWithMetadata = {
            ...model,
            _version: version,
            _lastModified: new Date().toISOString(),
            _createdAt: isUpdate ? undefined : new Date().toISOString()
        };
        // Remove _createdAt if updating (keep original)
        if (isUpdate) {
            try {
                const existing = await fs_1.promises.readFile(filePath, 'utf-8');
                const existingModel = JSON.parse(existing);
                if (existingModel._createdAt) {
                    modelWithMetadata._createdAt = existingModel._createdAt;
                }
            }
            catch {
                // Ignore if can't read existing
            }
        }
        // Write the model to file with pretty formatting
        await fs_1.promises.writeFile(filePath, JSON.stringify(modelWithMetadata, null, 2), 'utf-8');
        // Update cache for hot reload
        modelCache.set(model.name, {
            model: modelWithMetadata,
            lastModified: Date.now()
        });
        // Write audit log
        await writeAuditLog(isUpdate ? 'UPDATE' : 'CREATE', 'model', model.name, undefined, 'system', { version, fieldCount: model.fields.length });
        res.status(isUpdate ? 200 : 201).json({
            success: true,
            message: isUpdate
                ? `Model '${model.name}' updated successfully`
                : `Model '${model.name}' created successfully`,
            model: modelWithMetadata,
            version,
            path: `/models/${fileName}`
        });
    }
    catch (error) {
        console.error('Error saving model:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save model',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
/**
 * GET /api/models
 * Returns a list of all available model names and their file paths
 */
router.get('/', async (req, res) => {
    try {
        // Ensure models directory exists
        await ensureModelsDirectory();
        // Read all files in the models directory
        const files = await fs_1.promises.readdir(MODELS_DIR);
        // Filter for JSON files only
        const modelFiles = files.filter(file => file.endsWith('.json'));
        // Read each model file to get its name and basic info
        const models = await Promise.all(modelFiles.map(async (file) => {
            try {
                const filePath = path_1.default.join(MODELS_DIR, file);
                const content = await fs_1.promises.readFile(filePath, 'utf-8');
                const model = JSON.parse(content);
                return {
                    name: model.name,
                    fields: model.fields || [],
                    rbac: model.rbac,
                    ownerField: model.ownerField,
                    timestamps: model.timestamps,
                    fileName: file,
                    path: `/models/${file}`,
                    fieldCount: model.fields?.length || 0,
                    hasRBAC: !!model.rbac
                };
            }
            catch (error) {
                // If a file is corrupted, skip it
                console.error(`Error reading model file ${file}:`, error);
                return null;
            }
        }));
        // Filter out any null values (corrupted files)
        const validModels = models.filter(m => m !== null);
        res.json({
            success: true,
            count: validModels.length,
            data: validModels
        });
    }
    catch (error) {
        console.error('Error listing models:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to list models',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
/**
 * GET /api/models/:name
 * Returns the full definition of a specific model
 */
router.get('/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const fileName = name.endsWith('.json') ? name : `${name}.json`;
        const filePath = path_1.default.join(MODELS_DIR, fileName);
        try {
            const content = await fs_1.promises.readFile(filePath, 'utf-8');
            const model = JSON.parse(content);
            // Validate the model to ensure it's still valid
            const validationResult = (0, schema_1.validateModelDefinition)(model);
            if (!validationResult.success) {
                return res.status(500).json({
                    success: false,
                    message: 'Model file is corrupted or invalid',
                    errors: validationResult.errors
                });
            }
            res.json({
                success: true,
                model: validationResult.data
            });
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                return res.status(404).json({
                    success: false,
                    message: `Model '${name}' not found`
                });
            }
            throw error;
        }
    }
    catch (error) {
        console.error('Error reading model:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to read model',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
/**
 * DELETE /api/models/:name
 * Deletes a model definition file
 */
router.delete('/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const fileName = name.endsWith('.json') ? name : `${name}.json`;
        const filePath = path_1.default.join(MODELS_DIR, fileName);
        try {
            await fs_1.promises.unlink(filePath);
            res.json({
                success: true,
                message: `Model '${name}' deleted successfully`
            });
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                return res.status(404).json({
                    success: false,
                    message: `Model '${name}' not found`
                });
            }
            throw error;
        }
    }
    catch (error) {
        console.error('Error deleting model:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete model',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
/**
 * POST /api/models/validate
 * Validates a model definition without saving it
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
                message: 'Model validation failed',
                errors: result.errors
            });
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Validation error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
/**
 * GET /api/models/:name/versions
 * Get all versions of a model
 */
router.get('/:name/versions', async (req, res) => {
    try {
        const { name } = req.params;
        await ensureDirectories();
        const versionFiles = await fs_1.promises.readdir(VERSIONS_DIR);
        const modelVersions = versionFiles.filter(f => f.startsWith(`${name}_v`) && f.endsWith('.json'));
        const versions = await Promise.all(modelVersions.map(async (file) => {
            try {
                const filePath = path_1.default.join(VERSIONS_DIR, file);
                const content = await fs_1.promises.readFile(filePath, 'utf-8');
                const model = JSON.parse(content);
                const stats = await fs_1.promises.stat(filePath);
                return {
                    version: model._version,
                    timestamp: model._timestamp,
                    fileName: file,
                    size: stats.size,
                    fieldCount: model.fields?.length || 0
                };
            }
            catch {
                return null;
            }
        }));
        const validVersions = versions.filter(v => v !== null).sort((a, b) => b.version - a.version);
        res.json({
            success: true,
            modelName: name,
            count: validVersions.length,
            versions: validVersions
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch versions',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
/**
 * GET /api/models/:name/versions/:version
 * Get a specific version of a model
 */
router.get('/:name/versions/:version', async (req, res) => {
    try {
        const { name, version } = req.params;
        const versionFile = path_1.default.join(VERSIONS_DIR, `${name}_v${version}.json`);
        const content = await fs_1.promises.readFile(versionFile, 'utf-8');
        const model = JSON.parse(content);
        res.json({
            success: true,
            model
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            message: `Version ${req.params.version} of model '${req.params.name}' not found`
        });
    }
});
/**
 * POST /api/models/reload
 * Force reload all models from disk (hot reload)
 */
router.post('/reload', async (req, res) => {
    try {
        await ensureDirectories();
        // Clear cache
        modelCache.clear();
        // Read all model files
        const files = await fs_1.promises.readdir(MODELS_DIR);
        const modelFiles = files.filter(file => file.endsWith('.json'));
        let reloaded = 0;
        for (const file of modelFiles) {
            try {
                const filePath = path_1.default.join(MODELS_DIR, file);
                const content = await fs_1.promises.readFile(filePath, 'utf-8');
                const model = JSON.parse(content);
                const stats = await fs_1.promises.stat(filePath);
                modelCache.set(model.name, {
                    model,
                    lastModified: stats.mtimeMs
                });
                reloaded++;
            }
            catch (error) {
                console.error(`Failed to reload model ${file}:`, error);
            }
        }
        await writeAuditLog('READ', 'model', 'all', undefined, 'system', {
            action: 'reload',
            count: reloaded
        });
        res.json({
            success: true,
            message: `Reloaded ${reloaded} models`,
            count: reloaded
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to reload models',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
/**
 * GET /api/audit-logs
 * Get audit logs (optionally filtered by date, action, or resource)
 */
router.get('/audit-logs', async (req, res) => {
    try {
        await ensureDirectories();
        const { date, action, resourceType, limit = 100 } = req.query;
        let logFiles = await fs_1.promises.readdir(AUDIT_DIR);
        logFiles = logFiles.filter(f => f.startsWith('audit-') && f.endsWith('.json'));
        // Filter by date if provided
        if (date) {
            logFiles = logFiles.filter(f => f.includes(date));
        }
        // Sort by date (newest first)
        logFiles.sort().reverse();
        // Read and combine logs
        let allLogs = [];
        for (const file of logFiles) {
            try {
                const filePath = path_1.default.join(AUDIT_DIR, file);
                const content = await fs_1.promises.readFile(filePath, 'utf-8');
                const logs = JSON.parse(content);
                allLogs = allLogs.concat(logs);
            }
            catch {
                continue;
            }
        }
        // Filter by action if provided
        if (action) {
            allLogs = allLogs.filter(log => log.action === action);
        }
        // Filter by resourceType if provided
        if (resourceType) {
            allLogs = allLogs.filter(log => log.resourceType === resourceType);
        }
        // Sort by timestamp (newest first)
        allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        // Limit results
        const limitNum = parseInt(limit);
        allLogs = allLogs.slice(0, limitNum);
        res.json({
            success: true,
            count: allLogs.length,
            logs: allLogs
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch audit logs',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
