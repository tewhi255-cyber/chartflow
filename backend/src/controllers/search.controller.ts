import { Response, NextFunction } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export class SearchController {
  async globalSearch(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;
      if (!q) {
        return res.json({ status: 'success', data: { users: [], files: [], messages: [], teams: [], projects: [] } });
      }

      const query = `%${q}%`;

      const [users] = await pool.execute(
        'SELECT id, username, display_name, avatar_url, status FROM users WHERE (username LIKE ? OR display_name LIKE ?) AND deleted_at IS NULL LIMIT 10',
        [query, query]
      );

      const [files] = await pool.execute(
        'SELECT id, original_name, mime_type, size, created_at FROM files WHERE original_name LIKE ? AND deleted_at IS NULL LIMIT 10',
        [query]
      );

      const [teams] = await pool.execute(
        `SELECT t.id, t.name, t.avatar_url, t.description
         FROM teams t JOIN team_members tm ON t.id = tm.team_id
         WHERE tm.user_id = ? AND t.name LIKE ? AND t.deleted_at IS NULL LIMIT 10`,
        [req.user!.id, query]
      );

      const [projects] = await pool.execute(
        `SELECT p.id, p.name, p.status
         FROM projects p JOIN project_members pm ON p.id = pm.project_id
         WHERE pm.user_id = ? AND p.name LIKE ? AND p.deleted_at IS NULL LIMIT 10`,
        [req.user!.id, query]
      );

      const [messages] = await pool.execute(
        `SELECT m.id, m.content, m.created_at, c.type as conversation_type, u.display_name as sender_name
         FROM messages m
         JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
         JOIN conversations c ON m.conversation_id = c.id
         JOIN users u ON m.sender_id = u.id
         WHERE cp.user_id = ? AND m.content LIKE ? AND m.deleted_at IS NULL
         ORDER BY m.created_at DESC LIMIT 10`,
        [req.user!.id, query]
      );

      res.json({ status: 'success', data: { users, files, teams, projects, messages } });
    } catch (error) { next(error); }
  }
}

export const searchController = new SearchController();
