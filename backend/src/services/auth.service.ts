import pool from '../config/database';
import { hashPassword, comparePassword, generateToken, generateRefreshToken, verifyRefreshToken, generateRandomToken } from '../utils/helpers';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email';
import { AppError } from '../middleware/errorHandler';
import { createAuditLog } from '../utils/audit';

export class AuthService {
  async register(data: { username: string; email: string; password: string; display_name?: string }) {
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [data.email, data.username]
    );
    if ((existing as any[]).length > 0) {
      throw new AppError('User with this email or username already exists', 400);
    }

    const password_hash = await hashPassword(data.password);
    const verificationToken = generateRandomToken();

    await pool.execute(
      `INSERT INTO users (username, email, password_hash, display_name)
       VALUES (?, ?, ?, ?)`,
      [data.username, data.email, password_hash, data.display_name || data.username]
    );

    const [newUser] = await pool.execute('SELECT id FROM users WHERE username = ?', [data.username]);
    const userId = (newUser as any[])[0]?.id;

    await pool.execute(
      'INSERT INTO email_verifications (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))',
      [userId, verificationToken]
    );

    await pool.execute(
      'INSERT INTO notification_settings (user_id) VALUES (?)',
      [userId]
    );

    await sendVerificationEmail(data.email, verificationToken);

    const accessToken = generateToken(userId);
    const refreshToken = generateRefreshToken(userId);

    await pool.execute(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))',
      [userId, refreshToken]
    );

    return { userId, accessToken, refreshToken };
  }

  async login(email: string, password: string, ipAddress?: string, userAgent?: string) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ? AND deleted_at IS NULL',
      [email]
    );
    const users = rows as any[];
    if (users.length === 0) {
      throw new AppError('Invalid email or password', 401);
    }

    const user = users[0];
    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      await createAuditLog({ userId: user.id, action: 'LOGIN_FAILED', ipAddress, userAgent });
      throw new AppError('Invalid email or password', 401);
    }

    const accessToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await pool.execute(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))',
      [user.id, refreshToken]
    );

    await pool.execute(
      'INSERT INTO login_history (user_id, ip_address, user_agent, is_successful) VALUES (?, ?, ?, TRUE)',
      [user.id, ipAddress, userAgent]
    );

    await pool.execute(
      'UPDATE users SET last_login_at = NOW(), status = ? WHERE id = ?',
      ['online', user.id]
    );

    await createAuditLog({ userId: user.id, action: 'LOGIN', ipAddress, userAgent });

    const { password_hash, two_factor_secret, ...safeUser } = user;
    return { user: safeUser, accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string) {
    const decoded = verifyRefreshToken(refreshToken);

    const [rows] = await pool.execute(
      'SELECT * FROM refresh_tokens WHERE token = ? AND user_id = ? AND expires_at > NOW()',
      [refreshToken, decoded.userId]
    );
    const tokens = rows as any[];
    if (tokens.length === 0) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    await pool.execute('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);

    const newAccessToken = generateToken(decoded.userId);
    const newRefreshToken = generateRefreshToken(decoded.userId);

    await pool.execute(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))',
      [decoded.userId, newRefreshToken]
    );

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await pool.execute('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);
    }
    await pool.execute('UPDATE users SET status = ? WHERE id = ?', ['offline', userId]);
    await createAuditLog({ userId, action: 'LOGOUT' });
  }

  async forgotPassword(email: string) {
    const [rows] = await pool.execute(
      'SELECT id FROM users WHERE email = ? AND deleted_at IS NULL',
      [email]
    );
    const users = rows as any[];
    if (users.length === 0) {
      return;
    }

    const token = generateRandomToken();
    await pool.execute(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))',
      [users[0].id, token]
    );

    await sendPasswordResetEmail(email, token);
  }

  async resetPassword(token: string, newPassword: string) {
    const [rows] = await pool.execute(
      'SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW() AND used_at IS NULL',
      [token]
    );
    const resets = rows as any[];
    if (resets.length === 0) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const password_hash = await hashPassword(newPassword);
    await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, resets[0].user_id]);
    await pool.execute('UPDATE password_resets SET used_at = NOW() WHERE id = ?', [resets[0].id]);
    await pool.execute('DELETE FROM refresh_tokens WHERE user_id = ?', [resets[0].user_id]);
  }

  async verifyEmail(token: string) {
    const [rows] = await pool.execute(
      'SELECT * FROM email_verifications WHERE token = ? AND expires_at > NOW() AND verified_at IS NULL',
      [token]
    );
    const verifications = rows as any[];
    if (verifications.length === 0) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    await pool.execute('UPDATE email_verifications SET verified_at = NOW() WHERE id = ?', [verifications[0].id]);
    await pool.execute('UPDATE users SET is_verified = TRUE WHERE id = ?', [verifications[0].user_id]);
  }

  async getProfile(userId: string) {
    const [rows] = await pool.execute(
      `SELECT u.*,
        (SELECT COUNT(*) FROM team_members WHERE user_id = u.id) as team_count,
        (SELECT COUNT(*) FROM projects WHERE owner_id = u.id) as project_count
       FROM users u WHERE u.id = ? AND u.deleted_at IS NULL`,
      [userId]
    );
    const users = rows as any[];
    if (users.length === 0) throw new AppError('User not found', 404);
    const { password_hash, two_factor_secret, ...safeUser } = users[0];
    return safeUser;
  }

  async updateProfile(userId: string, data: any) {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.display_name) { updates.push('display_name = ?'); values.push(data.display_name); }
    if (data.bio !== undefined) { updates.push('bio = ?'); values.push(data.bio); }
    if (data.phone !== undefined) { updates.push('phone = ?'); values.push(data.phone); }
    if (data.avatar_url) { updates.push('avatar_url = ?'); values.push(data.avatar_url); }

    if (updates.length === 0) throw new AppError('No fields to update', 400);

    values.push(userId);
    await pool.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    await createAuditLog({ userId, action: 'PROFILE_UPDATED' });
    return this.getProfile(userId);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const [rows] = await pool.execute('SELECT password_hash FROM users WHERE id = ?', [userId]);
    const users = rows as any[];
    const isValid = await comparePassword(currentPassword, users[0].password_hash);
    if (!isValid) throw new AppError('Current password is incorrect', 400);

    const password_hash = await hashPassword(newPassword);
    await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, userId]);
    await pool.execute('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
    await createAuditLog({ userId, action: 'PASSWORD_CHANGED' });
  }
}

export const authService = new AuthService();
