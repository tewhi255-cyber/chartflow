import pool from '../config/database';

export class NotificationService {
  async createNotification(data: {
    userId: string; type: string; title: string; body?: string; data?: any;
  }) {
    const notificationId = require('uuid').v4();
    await pool.execute(
      'INSERT INTO notifications (id, user_id, type, title, body, data) VALUES (?, ?, ?, ?, ?, ?)',
      [notificationId, data.userId, data.type, data.title, data.body || null, data.data ? JSON.stringify(data.data) : null]
    );
    return { id: notificationId };
  }

  async getUserNotifications(userId: string, limit: number = 50, offset: number = 0) {
    const [rows] = await pool.execute(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [userId, limit, offset]
    );
    const [unread] = await pool.execute(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
    return { notifications: rows, unreadCount: (unread as any[])[0].count };
  }

  async markAsRead(notificationId: string, userId: string) {
    await pool.execute(
      'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );
  }

  async markAllAsRead(userId: string) {
    await pool.execute(
      'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
  }

  async getSettings(userId: string) {
    const [rows] = await pool.execute('SELECT * FROM notification_settings WHERE user_id = ?', [userId]);
    if ((rows as any[]).length === 0) {
      await pool.execute('INSERT INTO notification_settings (user_id) VALUES (?)', [userId]);
      const [newRows] = await pool.execute('SELECT * FROM notification_settings WHERE user_id = ?', [userId]);
      return (newRows as any[])[0];
    }
    return (rows as any[])[0];
  }

  async updateSettings(userId: string, settings: any) {
    const updates: string[] = [];
    const values: any[] = [];
    const fields = ['email_notifications', 'push_notifications', 'mention_notifications', 'message_notifications', 'project_updates', 'team_updates'];
    for (const field of fields) {
      if (settings[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(settings[field]);
      }
    }
    if (updates.length === 0) return;
    values.push(userId);
    await pool.execute(`UPDATE notification_settings SET ${updates.join(', ')} WHERE user_id = ?`, values);
    return this.getSettings(userId);
  }
}

export const notificationService = new NotificationService();
