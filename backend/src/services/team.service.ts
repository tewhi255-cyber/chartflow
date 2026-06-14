import pool from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { generateRandomToken } from '../utils/helpers';
import { sendTeamInviteEmail } from '../utils/email';
import { createAuditLog } from '../utils/audit';

export class TeamService {
  async createTeam(data: { name: string; description?: string; ownerId: string; isPrivate?: boolean }) {
    const teamId = require('uuid').v4();
    await pool.execute(
      'INSERT INTO teams (id, name, description, owner_id, is_private) VALUES (?, ?, ?, ?, ?)',
      [teamId, data.name, data.description || null, data.ownerId, data.isPrivate || false]
    );
    await pool.execute(
      'INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)',
      [teamId, data.ownerId, 'owner']
    );

    await createAuditLog({
      userId: data.ownerId,
      action: 'TEAM_CREATED',
      entityType: 'team',
      entityId: teamId,
      description: `Created team ${data.name}`,
    });

    return { id: teamId, name: data.name };
  }

  async getTeams(userId: string) {
    const [rows] = await pool.execute(
      `SELECT t.*,
        (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count,
        (SELECT COUNT(*) FROM projects WHERE team_id = t.id) as project_count
       FROM teams t
       JOIN team_members tm ON t.id = tm.team_id
       WHERE tm.user_id = ? AND t.deleted_at IS NULL
       ORDER BY t.created_at DESC`,
      [userId]
    );
    return rows;
  }

  async getTeam(teamId: string, userId: string) {
    const [rows] = await pool.execute(
      `SELECT t.*,
        (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count
       FROM teams t WHERE t.id = ? AND t.deleted_at IS NULL`,
      [teamId]
    );
    if ((rows as any[]).length === 0) throw new AppError('Team not found', 404);

    const [members] = await pool.execute(
      `SELECT u.id, u.username, u.display_name, u.avatar_url, u.email, u.status,
        tm.role, tm.joined_at
       FROM team_members tm
       JOIN users u ON tm.user_id = u.id
       WHERE tm.team_id = ?
       ORDER BY tm.role, tm.joined_at`,
      [teamId]
    );

    return { ...(rows as any[])[0], members };
  }

  async updateTeam(teamId: string, data: any) {
    const updates: string[] = [];
    const values: any[] = [];
    if (data.name) { updates.push('name = ?'); values.push(data.name); }
    if (data.description !== undefined) { updates.push('description = ?'); values.push(data.description); }
    if (data.is_private !== undefined) { updates.push('is_private = ?'); values.push(data.is_private); }
    if (updates.length === 0) return;

    values.push(teamId);
    await pool.execute(`UPDATE teams SET ${updates.join(', ')} WHERE id = ?`, values);
  }

  async inviteMember(teamId: string, inviterId: string, inviteeEmail: string) {
    const [team] = await pool.execute('SELECT * FROM teams WHERE id = ?', [teamId]);
    const teams = team as any[];
    if (teams.length === 0) throw new AppError('Team not found', 404);

    const token = generateRandomToken();
    await pool.execute(
      'INSERT INTO team_invitations (team_id, inviter_id, invitee_email, token, expires_at) VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))',
      [teamId, inviterId, inviteeEmail, token]
    );

    const [inviter] = await pool.execute('SELECT display_name, username FROM users WHERE id = ?', [inviterId]);
    const inviterName = (inviter as any[])[0]?.display_name || (inviter as any[])[0]?.username;

    await sendTeamInviteEmail(inviteeEmail, teams[0].name, inviterName, token);
    return { message: 'Invitation sent' };
  }

  async acceptInvitation(token: string, userId: string) {
    const [rows] = await pool.execute(
      'SELECT * FROM team_invitations WHERE token = ? AND status = ? AND expires_at > NOW()',
      [token, 'pending']
    );
    const invitations = rows as any[];
    if (invitations.length === 0) throw new AppError('Invalid or expired invitation', 400);

    const invite = invitations[0];
    const [user] = await pool.execute('SELECT email FROM users WHERE id = ?', [userId]);
    if ((user as any[])[0]?.email !== invite.invitee_email) {
      throw new AppError('This invitation was sent to a different email', 403);
    }

    await pool.execute(
      'INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)',
      [invite.team_id, userId, 'member']
    );
    await pool.execute(
      'UPDATE team_invitations SET status = ? WHERE id = ?',
      ['accepted', invite.id]
    );
  }

  async removeMember(teamId: string, memberId: string) {
    await pool.execute(
      'DELETE FROM team_members WHERE team_id = ? AND user_id = ? AND role != ?',
      [teamId, memberId, 'owner']
    );
  }

  async getTeamAnalytics(teamId: string) {
    const [projects] = await pool.execute(
      'SELECT COUNT(*) as total FROM projects WHERE team_id = ? AND deleted_at IS NULL',
      [teamId]
    );
    const [tasks] = await pool.execute(
      `SELECT COUNT(*) as total,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as completed
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE p.team_id = ? AND t.deleted_at IS NULL`,
      [teamId]
    );
    const [members] = await pool.execute(
      'SELECT COUNT(*) as total FROM team_members WHERE team_id = ?',
      [teamId]
    );
    const [files] = await pool.execute(
      'SELECT COUNT(*) as total, COALESCE(SUM(size), 0) as total_size FROM files WHERE team_id = ? AND deleted_at IS NULL',
      [teamId]
    );
    const [activity] = await pool.execute(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM activity_logs WHERE entity_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at) ORDER BY date`,
      [teamId]
    );

    return {
      projects: (projects as any[])[0],
      tasks: (tasks as any[])[0],
      members: (members as any[])[0],
      files: (files as any[])[0],
      activity: activity,
    };
  }
}

export const teamService = new TeamService();
