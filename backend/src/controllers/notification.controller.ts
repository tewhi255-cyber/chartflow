import { Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service';
import { AuthRequest } from '../middleware/auth';

export class NotificationController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const result = await notificationService.getUserNotifications(req.user!.id, limit, offset);
      res.json({ status: 'success', data: result });
    } catch (error) { next(error); }
  }

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await notificationService.markAsRead(req.params.id, req.user!.id);
      res.json({ status: 'success', message: 'Notification marked as read' });
    } catch (error) { next(error); }
  }

  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllAsRead(req.user!.id);
      res.json({ status: 'success', message: 'All notifications marked as read' });
    } catch (error) { next(error); }
  }

  async getSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const settings = await notificationService.getSettings(req.user!.id);
      res.json({ status: 'success', data: settings });
    } catch (error) { next(error); }
  }

  async updateSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const settings = await notificationService.updateSettings(req.user!.id, req.body);
      res.json({ status: 'success', data: settings });
    } catch (error) { next(error); }
  }
}

export const notificationController = new NotificationController();
