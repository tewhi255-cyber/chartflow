import { Response, NextFunction } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export class AdminController {
  async getUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '20', search, role, status } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      let query = 'SELECT id, username, email, display_name, role, status, is_verified, storage_used, storage_limit, created_at, last_login_at FROM users WHERE deleted_at IS NULL';
      const params: any[] = [];

      if (search) { query += ' AND (username LIKE ? OR email LIKE ? OR display_name LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
      if (role) { query += ' AND role = ?'; params.push(role); }
      if (status) { query += ' AND status = ?'; params.push(status); }

      const [rows] = await pool.execute(query + ' ORDER BY created_at DESC LIMIT ? OFFSET ?', [...params, parseInt(limit as string), offset]);
      const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM users WHERE deleted_at IS NULL');
      res.json({ status: 'success', data: { users: rows, total: (countResult as any[])[0].total, page: parseInt(page as string), limit: parseInt(limit as string) } });
    } catch (error) { next(error); }
  }

  async updateUserRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { role } = req.body;
      await pool.execute('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
      res.json({ status: 'success', message: 'User role updated' });
    } catch (error) { next(error); }
  }

  async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await pool.execute('UPDATE users SET deleted_at = NOW() WHERE id = ?', [req.params.id]);
      res.json({ status: 'success', message: 'User deleted' });
    } catch (error) { next(error); }
  }

  async getDashboardStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const [[users], [teams], [projects], [tasks], [files], [storage]] = await Promise.all([
        pool.execute('SELECT COUNT(*) as total, SUM(CASE WHEN is_verified = 1 THEN 1 ELSE 0 END) as verified, SUM(CASE WHEN created_at > DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as new_this_week FROM users WHERE deleted_at IS NULL'),
        pool.execute('SELECT COUNT(*) as total FROM teams WHERE deleted_at IS NULL'),
        pool.execute('SELECT COUNT(*) as total FROM projects WHERE deleted_at IS NULL'),
        pool.execute('SELECT COUNT(*) as total, SUM(CASE WHEN status = "done" THEN 1 ELSE 0 END) as completed FROM tasks WHERE deleted_at IS NULL'),
        pool.execute('SELECT COUNT(*) as total FROM files WHERE deleted_at IS NULL'),
        pool.execute('SELECT COALESCE(SUM(size), 0) as total_storage FROM files WHERE deleted_at IS NULL'),
      ]);

      const [recentActivity] = await pool.execute(
        'SELECT al.*, u.username, u.display_name FROM activity_logs al JOIN users u ON al.user_id = u.id ORDER BY al.created_at DESC LIMIT 20'
      );

      res.json({
        status: 'success',
        data: {
          stats: {
            users: (users as any[])[0],
            teams: (teams as any[])[0],
            projects: (projects as any[])[0],
            tasks: (tasks as any[])[0],
            files: (files as any[])[0],
            storage: (storage as any[])[0],
          },
          recentActivity,
        },
      });
    } catch (error) { next(error); }
  }

  async getSystemLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '50' } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      const [rows] = await pool.execute(
        'SELECT al.*, u.username, u.display_name FROM activity_logs al LEFT JOIN users u ON al.user_id = u.id ORDER BY al.created_at DESC LIMIT ? OFFSET ?',
        [parseInt(limit as string), offset]
      );
      res.json({ status: 'success', data: rows });
    } catch (error) { next(error); }
  }
}

export const adminController = new AdminController();
