import pool from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class ChatService {
  async getConversations(userId: string) {
    const [rows] = await pool.execute(
      `SELECT c.*, 
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_at,
        (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.created_at > COALESCE(cp.last_read_at, '1970-01-01')) as unread_count
       FROM conversations c
       JOIN conversation_participants cp ON c.id = cp.conversation_id
       WHERE cp.user_id = ? AND c.is_archived = FALSE
       ORDER BY last_message_at DESC`,
      [userId]
    );
    return rows;
  }

  async createDirectConversation(userId: string, targetUserId: string) {
    const [existing] = await pool.execute(
      `SELECT c.id FROM conversations c
       JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
       JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
       WHERE c.type = 'direct' AND cp1.user_id = ? AND cp2.user_id = ?`,
      [userId, targetUserId]
    );

    if ((existing as any[]).length > 0) {
      return (existing as any[])[0];
    }

    const conversationId = require('uuid').v4();
    await pool.execute(
      'INSERT INTO conversations (id, type, created_by) VALUES (?, ?, ?)',
      [conversationId, 'direct', userId]
    );
    await pool.execute(
      'INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?), (?, ?)',
      [conversationId, userId, conversationId, targetUserId]
    );

    return { id: conversationId, type: 'direct' };
  }

  async createGroupConversation(userId: string, name: string, memberIds: string[]) {
    const conversationId = require('uuid').v4();
    await pool.execute(
      'INSERT INTO conversations (id, type, name, created_by) VALUES (?, ?, ?, ?)',
      [conversationId, 'group', name, userId]
    );

    const allMembers = [userId, ...memberIds.filter(id => id !== userId)];
    for (const memberId of allMembers) {
      await pool.execute(
        'INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)',
        [conversationId, memberId]
      );
    }

    return { id: conversationId, type: 'group', name };
  }

  async sendMessage(conversationId: string, senderId: string, content: string, messageType: string = 'text', replyToId?: string) {
    const [participants] = await pool.execute(
      'SELECT user_id FROM conversation_participants WHERE conversation_id = ?',
      [conversationId]
    );
    const participantList = participants as any[];
    if (!participantList.find((p: any) => p.user_id === senderId)) {
      throw new AppError('Not a participant of this conversation', 403);
    }

    const messageId = require('uuid').v4();
    await pool.execute(
      `INSERT INTO messages (id, conversation_id, sender_id, content, message_type, reply_to_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [messageId, conversationId, senderId, content, messageType, replyToId || null]
    );

    await pool.execute(
      'UPDATE conversation_participants SET last_read_at = NOW() WHERE conversation_id = ? AND user_id = ?',
      [conversationId, senderId]
    );

    const [message] = await pool.execute(
      `SELECT m.*, u.username, u.display_name, u.avatar_url
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.id = ?`,
      [messageId]
    );

    return (message as any[])[0];
  }

  async getMessages(conversationId: string, userId: string, limit: number = 50, offset: number = 0) {
    const [participants] = await pool.execute(
      'SELECT user_id FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
      [conversationId, userId]
    );
    if ((participants as any[]).length === 0) {
      throw new AppError('Not a participant', 403);
    }

    const [rows] = await pool.execute(
      `SELECT m.*, u.username, u.display_name, u.avatar_url,
        (SELECT JSON_ARRAYAGG(JSON_OBJECT('emoji', mr.emoji, 'user_id', mr.user_id)) FROM message_reactions mr WHERE mr.message_id = m.id) as reactions
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = ? AND m.deleted_at IS NULL
       ORDER BY m.created_at DESC
       LIMIT ? OFFSET ?`,
      [conversationId, limit, offset]
    );

    await pool.execute(
      'UPDATE conversation_participants SET last_read_at = NOW() WHERE conversation_id = ? AND user_id = ?',
      [conversationId, userId]
    );

    return (rows as any[]).reverse();
  }

  async addReaction(messageId: string, userId: string, emoji: string) {
    await pool.execute(
      'INSERT INTO message_reactions (message_id, user_id, emoji) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE emoji = emoji',
      [messageId, userId, emoji]
    );
  }

  async removeReaction(messageId: string, userId: string, emoji: string) {
    await pool.execute(
      'DELETE FROM message_reactions WHERE message_id = ? AND user_id = ? AND emoji = ?',
      [messageId, userId, emoji]
    );
  }

  async pinMessage(messageId: string) {
    await pool.execute('UPDATE messages SET is_pinned = TRUE WHERE id = ?', [messageId]);
  }

  async unpinMessage(messageId: string) {
    await pool.execute('UPDATE messages SET is_pinned = FALSE WHERE id = ?', [messageId]);
  }

  async searchMessages(conversationId: string, query: string) {
    const [rows] = await pool.execute(
      `SELECT m.*, u.username, u.display_name, u.avatar_url
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = ? AND m.content LIKE ? AND m.deleted_at IS NULL
       ORDER BY m.created_at DESC
       LIMIT 50`,
      [conversationId, `%${query}%`]
    );
    return rows;
  }
}

export const chatService = new ChatService();
