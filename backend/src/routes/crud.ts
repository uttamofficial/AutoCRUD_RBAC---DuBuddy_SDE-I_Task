import { Router, Request, Response } from 'express';
import { authenticate, checkPermission, checkOwnership } from '../middleware/rbac';
import { promises as fs } from 'fs';
import path from 'path';
import prisma from '../prisma';

const router = Router();

// Path to audit logs
const AUDIT_DIR = path.join(__dirname, '../../../audit-logs');

/**
 * Write audit log for record operations
 */
async function writeRecordAuditLog(
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'READ',
  modelName: string,
  recordId: number | null,
  userId?: number,
  userEmail?: string,
  details?: any
): Promise<void> {
  try {
    // Ensure audit directory exists
    try {
      await fs.access(AUDIT_DIR);
    } catch {
      await fs.mkdir(AUDIT_DIR, { recursive: true });
    }
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      resourceType: 'record',
      resourceName: `${modelName}${recordId ? `#${recordId}` : ''}`,
      modelName,
      recordId,
      userId: userId || null,
      userEmail: userEmail || 'anonymous',
      details: details || {}
    };
    
    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(AUDIT_DIR, `audit-${date}.json`);
    
    let logs = [];
    try {
      const content = await fs.readFile(logFile, 'utf-8');
      logs = JSON.parse(content);
    } catch {
      // File doesn't exist yet
    }
    
    logs.push(logEntry);
    await fs.writeFile(logFile, JSON.stringify(logs, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write record audit log:', error);
  }
}



// Interface for record data
interface RecordData {
  id: number;
  [key: string]: any;
}

/**
 * Helper to parse record from database
 */
function parseRecord(dbRecord: any): RecordData {
  return {
    id: dbRecord.id,
    ...JSON.parse(dbRecord.data),
    createdAt: dbRecord.createdAt,
    updatedAt: dbRecord.updatedAt
  };
}

/**
 * Helper to get record owner ID
 */
async function getRecordOwnerId(modelName: string, recordId: number, ownerField: string): Promise<number | null> {
  const dbRecord = await prisma.record.findFirst({
    where: {
      id: recordId,
      modelName: modelName
    }
  });
  
  if (!dbRecord) return null;
  
  const record = parseRecord(dbRecord);
  return record[ownerField] || null;
}

/**
 * GET /api/crud/:modelName
 * List all records for a model (with RBAC)
 */
router.get('/:modelName', authenticate, checkPermission(), async (req: Request, res: Response) => {
  try {
    const { modelName } = req.params;
    
    // Fetch all records for this model from database
    const dbRecords = await prisma.record.findMany({
      where: { modelName },
      orderBy: { createdAt: 'desc' }
    });
    
    const records = dbRecords.map(parseRecord);
    
    // If not admin and model has ownerField, filter by ownership
    const model = req.modelDefinition;
    if (model?.ownerField && req.user?.role !== 'Admin') {
      const ownerField = model.ownerField;
      const userRecords = records.filter(r => r[ownerField] === req.user?.userId);
      
      // Audit log
      await writeRecordAuditLog('READ', modelName, null, req.user?.userId, req.user?.email, {
        count: userRecords.length,
        filtered: true
      });
      
      return res.json({
        success: true,
        count: userRecords.length,
        data: userRecords
      });
    }
    
    // Audit log
    await writeRecordAuditLog('READ', modelName, null, req.user?.userId, req.user?.email, {
      count: records.length
    });
    
    res.json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch records',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/crud/:modelName/:id
 * Get a specific record by ID (with RBAC)
 */
router.get('/:modelName/:id', authenticate, checkPermission(), async (req: Request, res: Response) => {
  try {
    const { modelName, id } = req.params;
    
    const dbRecord = await prisma.record.findFirst({
      where: {
        id: parseInt(id),
        modelName: modelName
      }
    });
    
    if (!dbRecord) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }
    
    const record = parseRecord(dbRecord);
    
    // Check ownership for non-admin users
    const model = req.modelDefinition;
    if (model?.ownerField && req.user?.role !== 'Admin') {
      if (record[model.ownerField] !== req.user?.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only view your own records'
        });
      }
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch record',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/crud/:modelName
 * Create a new record (with RBAC)
 */
router.post('/:modelName', authenticate, checkPermission(), async (req: Request, res: Response) => {
  try {
    const { modelName } = req.params;
    const recordData = req.body;
    
    // Auto-assign owner if model has ownerField
    const model = req.modelDefinition;
    if (model?.ownerField) {
      recordData[model.ownerField] = req.user?.userId;
    }
    
    // Create record in database
    const dbRecord = await prisma.record.create({
      data: {
        modelName,
        data: JSON.stringify(recordData)
      }
    });
    
    const newRecord = parseRecord(dbRecord);
    
    // Audit log
    await writeRecordAuditLog('CREATE', modelName, newRecord.id, req.user?.userId, req.user?.email, {
      record: newRecord
    });
    
    res.status(201).json({
      success: true,
      message: 'Record created successfully',
      data: newRecord
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create record',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/crud/:modelName/:id
 * Update a record (with RBAC and ownership check)
 */
router.put(
  '/:modelName/:id',
  authenticate,
  checkPermission(),
  async (req: Request, res: Response) => {
    try {
      const { modelName, id } = req.params;
      const updateData = req.body;
      
      // Find record in database
      const dbRecord = await prisma.record.findFirst({
        where: {
          id: parseInt(id),
          modelName: modelName
        }
      });
      
      if (!dbRecord) {
        return res.status(404).json({
          success: false,
          message: 'Record not found'
        });
      }
      
      const record = parseRecord(dbRecord);
      
      // Check ownership for non-admin users
      const model = req.modelDefinition;
      if (model?.ownerField && req.user?.role !== 'Admin') {
        if (record[model.ownerField] !== req.user?.userId) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: You can only update your own records'
          });
        }
      }
      
      // Merge update data (preserve owner field)
      const updatedData = { ...record, ...updateData };
      
      if (model?.ownerField) {
        updatedData[model.ownerField] = record[model.ownerField];
      }
      
      // Remove metadata fields before storing
      const { id: _, createdAt, updatedAt, ...dataToStore } = updatedData;
      
      // Update in database
      const updatedDbRecord = await prisma.record.update({
        where: { id: parseInt(id) },
        data: {
          data: JSON.stringify(dataToStore)
        }
      });
      
      const updatedRecord = parseRecord(updatedDbRecord);
      
      // Audit log
      await writeRecordAuditLog('UPDATE', modelName, parseInt(id), req.user?.userId, req.user?.email, {
        before: record,
        after: updatedRecord,
        changes: Object.keys(updateData)
      });
      
      res.json({
        success: true,
        message: 'Record updated successfully',
        data: updatedRecord
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update record',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * DELETE /api/crud/:modelName/:id
 * Delete a record (with RBAC and ownership check)
 */
router.delete(
  '/:modelName/:id',
  authenticate,
  checkPermission(),
  async (req: Request, res: Response) => {
    try {
      const { modelName, id } = req.params;
      
      // Find record in database
      const dbRecord = await prisma.record.findFirst({
        where: {
          id: parseInt(id),
          modelName: modelName
        }
      });
      
      if (!dbRecord) {
        return res.status(404).json({
          success: false,
          message: 'Record not found'
        });
      }
      
      const record = parseRecord(dbRecord);
      
      // Check ownership for non-admin users
      const model = req.modelDefinition;
      if (model?.ownerField && req.user?.role !== 'Admin') {
        if (record[model.ownerField] !== req.user?.userId) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: You can only delete your own records'
          });
        }
      }
      
      // Delete from database
      await prisma.record.delete({
        where: { id: parseInt(id) }
      });
      
      // Audit log
      await writeRecordAuditLog('DELETE', modelName, parseInt(id), req.user?.userId, req.user?.email, {
        deletedRecord: record
      });
      
      res.json({
        success: true,
        message: 'Record deleted successfully',
        data: record
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete record',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;
