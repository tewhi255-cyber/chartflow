import pool from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { createAuditLog } from '../utils/audit';

export class ProjectService {
  async createProject(data: {
    name: string; description?: string; teamId?: string; ownerId: string;
    startDate?: string; endDate?: string; priority?: string; isPrivate?: boolean;
  }) {
    const projectId = require('uuid').v4();
    await pool.execute(
      `INSERT INTO projects (id, team_id, name, description, start_date, end_date, priority, owner_id, is_private)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [projectId, data.teamId || null, data.name, data.description || null,
       data.startDate || null, data.endDate || null, data.priority || 'medium',
       data.ownerId, data.isPrivate || false]
    );
    await pool.execute(
      'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
      [projectId, data.ownerId, 'owner']
    );

    await createAuditLog({
      userId: data.ownerId, action: 'PROJECT_CREATED',
      entityType: 'project', entityId: projectId,
      description: `Created project ${data.name}`,
    });

    return { id: projectId, name: data.name };
  }

  async getProjects(userId: string, teamId?: string) {
    let query = `SELECT p.*,
      (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND deleted_at IS NULL) as task_count,
      (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'done' AND deleted_at IS NULL) as completed_tasks,
      (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as member_count
     FROM projects p
     JOIN project_members pm ON p.id = pm.project_id
     WHERE pm.user_id = ? AND p.deleted_at IS NULL`;
    const params: any[] = [userId];

    if (teamId) {
      query += ' AND p.team_id = ?';
      params.push(teamId);
    }

    query += ' ORDER BY p.created_at DESC';
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  async getProject(projectId: string) {
    const [rows] = await pool.execute(
      `SELECT p.*,
        (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', u.id, 'username', u.username, 'display_name', u.display_name, 'avatar_url', u.avatar_url, 'role', pm.role))
         FROM project_members pm JOIN users u ON pm.user_id = u.id WHERE pm.project_id = p.id) as members
       FROM projects p WHERE p.id = ? AND p.deleted_at IS NULL`,
      [projectId]
    );
    if ((rows as any[]).length === 0) throw new AppError('Project not found', 404);
    return (rows as any[])[0];
  }

  async updateProject(projectId: string, data: any) {
    const updates: string[] = [];
    const values: any[] = [];
    const fields = ['name', 'description', 'status', 'priority', 'start_date', 'end_date', 'cover_image'];
    for (const field of fields) {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(data[field]);
      }
    }
    if (updates.length === 0) return;
    values.push(projectId);
    await pool.execute(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`, values);
  }

  async deleteProject(projectId: string) {
    await pool.execute('UPDATE projects SET deleted_at = NOW() WHERE id = ?', [projectId]);
  }

  async addMember(projectId: string, userId: string, role: string = 'member') {
    await pool.execute(
      'INSERT IGNORE INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
      [projectId, userId, role]
    );
  }

  async removeMember(projectId: string, userId: string) {
    await pool.execute(
      'DELETE FROM project_members WHERE project_id = ? AND user_id = ? AND role != ?',
      [projectId, userId, 'owner']
    );
  }

  async createTask(data: {
    projectId: string; title: string; description?: string; assigneeId?: string; reporterId: string;
    priority?: string; dueDate?: string; estimatedHours?: number; parentTaskId?: string;
  }) {
    const taskId = require('uuid').v4();

    const [maxSort] = await pool.execute(
      'SELECT COALESCE(MAX(sort_order), 0) + 1 as next FROM tasks WHERE project_id = ?',
      [data.projectId]
    );

    await pool.execute(
      `INSERT INTO tasks (id, project_id, parent_task_id, title, description, assignee_id, reporter_id, priority, due_date, estimated_hours, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [taskId, data.projectId, data.parentTaskId || null, data.title, data.description || null,
       data.assigneeId || null, data.reporterId, data.priority || 'medium',
       data.dueDate || null, data.estimatedHours || null, (maxSort as any[])[0].next]
    );

    return { id: taskId };
  }

  async getTasks(projectId: string, filters?: { status?: string; assigneeId?: string; priority?: string }) {
    let query = `SELECT t.*,
      u1.display_name as assignee_name, u1.avatar_url as assignee_avatar,
      u2.display_name as reporter_name,
      (SELECT COUNT(*) FROM tasks WHERE parent_task_id = t.id AND deleted_at IS NULL) as subtask_count
     FROM tasks t
     LEFT JOIN users u1 ON t.assignee_id = u1.id
     LEFT JOIN users u2 ON t.reporter_id = u2.id
     WHERE t.project_id = ? AND t.deleted_at IS NULL`;
    const params: any[] = [projectId];

    if (filters?.status) { query += ' AND t.status = ?'; params.push(filters.status); }
    if (filters?.assigneeId) { query += ' AND t.assignee_id = ?'; params.push(filters.assigneeId); }
    if (filters?.priority) { query += ' AND t.priority = ?'; params.push(filters.priority); }

    query += ' ORDER BY t.sort_order, t.created_at DESC';
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  async updateTask(taskId: string, data: any) {
    const updates: string[] = [];
    const values: any[] = [];
    const fields = ['title', 'description', 'status', 'priority', 'assignee_id', 'due_date', 'estimated_hours', 'actual_hours', 'sort_order'];
    for (const field of fields) {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(data[field]);
      }
    }
    if (updates.length === 0) return;
    values.push(taskId);
    await pool.execute(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`, values);
  }

  async deleteTask(taskId: string) {
    await pool.execute('UPDATE tasks SET deleted_at = NOW() WHERE id = ?', [taskId]);
  }

  async addTaskComment(taskId: string, userId: string, content: string) {
    const commentId = require('uuid').v4();
    await pool.execute(
      'INSERT INTO task_comments (id, task_id, user_id, content) VALUES (?, ?, ?, ?)',
      [commentId, taskId, userId, content]
    );
    const [comment] = await pool.execute(
      `SELECT tc.*, u.username, u.display_name, u.avatar_url
       FROM task_comments tc JOIN users u ON tc.user_id = u.id WHERE tc.id = ?`,
      [commentId]
    );
    return (comment as any[])[0];
  }

  async getProjectAnalytics(projectId: string) {
    const [tasks] = await pool.execute(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) as todo,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'review' THEN 1 ELSE 0 END) as review,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done,
        SUM(CASE WHEN due_date < CURDATE() AND status != 'done' THEN 1 ELSE 0 END) as overdue
       FROM tasks WHERE project_id = ? AND deleted_at IS NULL`,
      [projectId]
    );
    return tasks;
  }
}

export const projectService = new ProjectService();
