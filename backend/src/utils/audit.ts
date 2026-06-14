import pool from '../config/database';

interface AuditLogParams {
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  description?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

export const createAuditLog = async (params: AuditLogParams): Promise<void> => {
  try {
    await pool.execute(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description, metadata, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        params.userId || null,
        params.action,
        params.entityType || null,
        params.entityId || null,
        params.description || null,
        params.metadata ? JSON.stringify(params.metadata) : null,
        params.ipAddress || null,
        params.userAgent || null,
      ]
    );
  } catch (error) {
    console.error('Audit log failed:', error);
  }
};
