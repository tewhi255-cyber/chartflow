import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, email, password, display_name } = req.body;
      const result = await authService.register({ username, email, password, display_name });
      res.status(201).json({ status: 'success', data: result });
    } catch (error) { next(error); }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];
      const result = await authService.login(email, password, ipAddress, userAgent);
      res.json({ status: 'success', data: result });
    } catch (error) { next(error); }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshTokens(refreshToken);
      res.json({ status: 'success', data: result });
    } catch (error) { next(error); }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      await authService.logout(req.user!.id, refreshToken);
      res.json({ status: 'success', message: 'Logged out successfully' });
    } catch (error) { next(error); }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);
      res.json({ status: 'success', message: 'If the email exists, a reset link has been sent' });
    } catch (error) { next(error); }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;
      await authService.resetPassword(token, password);
      res.json({ status: 'success', message: 'Password reset successfully' });
    } catch (error) { next(error); }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.query;
      await authService.verifyEmail(token as string);
      res.json({ status: 'success', message: 'Email verified successfully' });
    } catch (error) { next(error); }
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getProfile(req.user!.id);
      res.json({ status: 'success', data: user });
    } catch (error) { next(error); }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.updateProfile(req.user!.id, req.body);
      res.json({ status: 'success', data: user });
    } catch (error) { next(error); }
  }

  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(req.user!.id, currentPassword, newPassword);
      res.json({ status: 'success', message: 'Password changed successfully' });
    } catch (error) { next(error); }
  }
}

export const authController = new AuthController();
