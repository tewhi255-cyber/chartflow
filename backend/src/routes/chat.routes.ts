import { Router } from 'express';
import { chatController } from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /chat/conversations:
 *   get:
 *     tags: [Chat]
 *     summary: Get user conversations
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of conversations }
 */
router.get('/conversations', chatController.getConversations);
router.post('/conversations/direct', chatController.createDirectConversation);
router.post('/conversations/group', chatController.createGroupConversation);
router.get('/conversations/:conversationId/messages', chatController.getMessages);
router.post('/conversations/:conversationId/messages', chatController.sendMessage);
router.post('/messages/:messageId/reactions', chatController.addReaction);
router.delete('/messages/:messageId/reactions', chatController.removeReaction);
router.post('/messages/:messageId/pin', chatController.pinMessage);
router.get('/conversations/:conversationId/search', chatController.searchMessages);

export default router;
