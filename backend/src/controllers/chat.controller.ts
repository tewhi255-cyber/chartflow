import { Response, NextFunction } from 'express';
import { chatService } from '../services/chat.service';
import { AuthRequest } from '../middleware/auth';

export class ChatController {
  async getConversations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const conversations = await chatService.getConversations(req.user!.id);
      res.json({ status: 'success', data: conversations });
    } catch (error) { next(error); }
  }

  async createDirectConversation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.body;
      const conversation = await chatService.createDirectConversation(req.user!.id, userId);
      res.json({ status: 'success', data: conversation });
    } catch (error) { next(error); }
  }

  async createGroupConversation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, memberIds } = req.body;
      const conversation = await chatService.createGroupConversation(req.user!.id, name, memberIds);
      res.status(201).json({ status: 'success', data: conversation });
    } catch (error) { next(error); }
  }

  async getMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { conversationId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const messages = await chatService.getMessages(conversationId, req.user!.id, limit, offset);
      res.json({ status: 'success', data: messages });
    } catch (error) { next(error); }
  }

  async sendMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { conversationId } = req.params;
      const { content, messageType, replyToId } = req.body;
      const message = await chatService.sendMessage(conversationId, req.user!.id, content, messageType, replyToId);
      res.status(201).json({ status: 'success', data: message });
    } catch (error) { next(error); }
  }

  async addReaction(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { messageId } = req.params;
      const { emoji } = req.body;
      await chatService.addReaction(messageId, req.user!.id, emoji);
      res.json({ status: 'success', message: 'Reaction added' });
    } catch (error) { next(error); }
  }

  async removeReaction(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { messageId } = req.params;
      const { emoji } = req.body;
      await chatService.removeReaction(messageId, req.user!.id, emoji);
      res.json({ status: 'success', message: 'Reaction removed' });
    } catch (error) { next(error); }
  }

  async pinMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { messageId } = req.params;
      await chatService.pinMessage(messageId);
      res.json({ status: 'success', message: 'Message pinned' });
    } catch (error) { next(error); }
  }

  async searchMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { conversationId } = req.params;
      const { q } = req.query;
      const messages = await chatService.searchMessages(conversationId, q as string);
      res.json({ status: 'success', data: messages });
    } catch (error) { next(error); }
  }
}

export const chatController = new ChatController();
