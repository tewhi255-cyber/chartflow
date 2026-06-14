import pool from '../config/database';
import path from 'path';
import fs from 'fs';
import { AppError } from '../middleware/errorHandler';
import { uploadToS3, deleteLocalFile } from '../utils/storage';
import config from '../config';
import { createAuditLog } from '../utils/audit';

export class FileService {
  async uploadFile(data: {
    originalName: string;
    storedName: string;
    mimeType: string;
    size: number;
    uploaderId: string;
    teamId?: string;
    projectId?: string;
    messageId?: string;
    description?: string;
    categoryId?: string;
  }) {
    const ext = path.extname(data.originalName).toLowerCase();
    const fileId = require('uuid').v4();

    let storageType = 'local';
    let s3Key = null;

    if (config.storageType === 's3' && config.aws.accessKeyId) {
      storageType = 's3';
      s3Key = `${data.uploaderId}/${fileId}${ext}`;
      await uploadToS3(
        path.join(__dirname, '../../uploads', data.storedName),
        s3Key
      );
      deleteLocalFile(path.join(__dirname, '../../uploads', data.storedName));
    }

    await pool.execute(
      `INSERT INTO files (id, original_name, stored_name, mime_type, size, extension, category_id, storage_type, s3_key, uploader_id, team_id, project_id, message_id, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fileId, data.originalName, data.storedName, data.mimeType, data.size, ext,
        data.categoryId || null, storageType, s3Key, data.uploaderId,
        data.teamId || null, data.projectId || null, data.messageId || null,
        data.description || null
      ]
    );

    await pool.execute(
      'UPDATE users SET storage_used = storage_used + ? WHERE id = ?',
      [data.size, data.uploaderId]
    );

    await createAuditLog({
      userId: data.uploaderId,
      action: 'FILE_UPLOADED',
      entityType: 'file',
      entityId: fileId,
      description: `Uploaded ${data.originalName}`,
    });

    const [file] = await pool.execute('SELECT * FROM files WHERE id = ?', [fileId]);
    return (file as any[])[0];
  }

  async getFiles(options: { teamId?: string; projectId?: string; uploaderId?: string; categoryId?: string; page: number; limit: number }) {
    const conditions: string[] = ['f.deleted_at IS NULL'];
    const params: any[] = [];

    if (options.teamId) { conditions.push('f.team_id = ?'); params.push(options.teamId); }
    if (options.projectId) { conditions.push('f.project_id = ?'); params.push(options.projectId); }
    if (options.uploaderId) { conditions.push('f.uploader_id = ?'); params.push(options.uploaderId); }
    if (options.categoryId) { conditions.push('f.category_id = ?'); params.push(options.categoryId); }

    const offset = (options.page - 1) * options.limit;

    const [rows] = await pool.execute(
      `SELECT f.*, u.username as uploader_name, u.display_name as uploader_display_name,
        (SELECT JSON_ARRAYAGG(JSON_OBJECT('name', ft.name, 'color', ft.color)) FROM file_tag_relations ftr JOIN file_tags ft ON ftr.tag_id = ft.id WHERE ftr.file_id = f.id) as tags
       FROM files f
       JOIN users u ON f.uploader_id = u.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY f.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, options.limit, offset]
    );

    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM files f WHERE ${conditions.join(' AND ')}`,
      params
    );
    const total = (countResult as any[])[0].total;

    return { files: rows, total, page: options.page, limit: options.limit };
  }

  async getFile(fileId: string) {
    const [rows] = await pool.execute(
      `SELECT f.*, u.username as uploader_name, u.display_name as uploader_display_name
       FROM files f
       JOIN users u ON f.uploader_id = u.id
       WHERE f.id = ? AND f.deleted_at IS NULL`,
      [fileId]
    );
    if ((rows as any[]).length === 0) throw new AppError('File not found', 404);
    return (rows as any[])[0];
  }

  async deleteFile(fileId: string, userId: string) {
    const file = await this.getFile(fileId);

    if (file.storage_type === 'local') {
      const filePath = path.join(__dirname, '../../uploads', file.stored_name);
      deleteLocalFile(filePath);
    }

    await pool.execute('UPDATE files SET deleted_at = NOW() WHERE id = ?', [fileId]);
    await pool.execute(
      'UPDATE users SET storage_used = GREATEST(0, storage_used - ?) WHERE id = ?',
      [file.size, userId]
    );

    await createAuditLog({ userId, action: 'FILE_DELETED', entityType: 'file', entityId: fileId });
  }

  async getCategories() {
    const [rows] = await pool.execute('SELECT * FROM file_categories ORDER BY name');
    return rows;
  }

  async getTags() {
    const [rows] = await pool.execute('SELECT * FROM file_tags ORDER BY name');
    return rows;
  }

  async addTag(fileId: string, tagId: string) {
    await pool.execute(
      'INSERT IGNORE INTO file_tag_relations (file_id, tag_id) VALUES (?, ?)',
      [fileId, tagId]
    );
  }

  async searchFiles(query: string) {
    const [rows] = await pool.execute(
      `SELECT f.*, u.username as uploader_name
       FROM files f
       JOIN users u ON f.uploader_id = u.id
       WHERE f.deleted_at IS NULL AND (f.original_name LIKE ? OR f.description LIKE ?)
       ORDER BY f.created_at DESC
       LIMIT 20`,
      [`%${query}%`, `%${query}%`]
    );
    return rows;
  }
}

export const fileService = new FileService();
