import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from '../config';
import pool from '../config/database';
import logger from '../config/logger';

let io: Server;

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

export const initializeSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: config.frontendUrl,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token as string, config.jwt.secret) as { userId: string };
      const [rows] = await pool.execute(
        'SELECT id, username, display_name, status FROM users WHERE id = ? AND deleted_at IS NULL',
        [decoded.userId]
      );
      const users = rows as any[];
      if (users.length === 0) {
        return next(new Error('User not found'));
      }

      socket.userId = users[0].id;
      socket.username = users[0].display_name || users[0].username;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket: AuthenticatedSocket) => {
    logger.info(`User connected: ${socket.username} (${socket.userId})`);

    await pool.execute('UPDATE users SET status = ? WHERE id = ?', ['online', socket.userId]);

    socket.join(`user:${socket.userId}`);
    io.emit('user:status', { userId: socket.userId, status: 'online' });

    socket.on('conversation:join', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('conversation:leave', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on('message:send', async (data: { conversationId: string; content: string; messageType?: string; replyToId?: string }) => {
      try {
        const messageId = require('uuid').v4();
        const messageType = data.messageType || 'text';

        await pool.execute(
          `INSERT INTO messages (id, conversation_id, sender_id, content, message_type, reply_to_id)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [messageId, data.conversationId, socket.userId, data.content, messageType, data.replyToId || null]
        );

        const [message] = await pool.execute(
          `SELECT m.*, u.username, u.display_name, u.avatar_url
           FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.id = ?`,
          [messageId]
        );

        const msg = (message as any[])[0];

        const [participants] = await pool.execute(
          'SELECT user_id FROM conversation_participants WHERE conversation_id = ?',
          [data.conversationId]
        );

        io.to(`conversation:${data.conversationId}`).emit('message:new', msg);

        for (const p of participants as any[]) {
          if (p.user_id !== socket.userId) {
            io.to(`user:${p.user_id}`).emit('notification:new', {
              type: 'new_message',
              title: msg.display_name || msg.username,
              body: msg.content,
              data: { conversationId: data.conversationId, messageId },
            });
          }
        }
      } catch (error) {
        logger.error('Message send error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('message:typing', (data: { conversationId: string; isTyping: boolean }) => {
      socket.to(`conversation:${data.conversationId}`).emit('message:typing', {
        userId: socket.userId,
        username: socket.username,
        isTyping: data.isTyping,
      });
    });

    socket.on('message:read', async (data: { conversationId: string; messageIds: string[] }) => {
      for (const messageId of data.messageIds) {
        await pool.execute(
          'INSERT INTO message_reads (message_id, user_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE read_at = NOW()',
          [messageId, socket.userId]
        );
      }
      io.to(`conversation:${data.conversationId}`).emit('message:read', {
        userId: socket.userId,
        messageIds: data.messageIds,
      });
    });

    socket.on('reaction:add', async (data: { conversationId: string; messageId: string; emoji: string }) => {
      try {
        await pool.execute(
          'INSERT INTO message_reactions (message_id, user_id, emoji) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE emoji = emoji',
          [data.messageId, socket.userId, data.emoji]
        );
        socket.to(`conversation:${data.conversationId}`).emit('reaction:updated', {
          messageId: data.messageId,
          userId: socket.userId,
          emoji: data.emoji,
          action: 'add',
        });
      } catch (error) {
        logger.error('Reaction error:', error);
      }
    });

    socket.on('disconnect', async () => {
      logger.info(`User disconnected: ${socket.username} (${socket.userId})`);
      await pool.execute('UPDATE users SET status = ? WHERE id = ?', ['offline', socket.userId]);
      io.emit('user:status', { userId: socket.userId, status: 'offline' });
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};
