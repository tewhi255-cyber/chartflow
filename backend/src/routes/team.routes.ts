import { Router } from 'express';
import { teamController } from '../controllers/team.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /teams:
 *   get:
 *     tags: [Teams]
 *     summary: Get user teams
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of teams }
 */
router.get('/', teamController.getAll);
router.post('/', teamController.create);
router.get('/invitations/accept', teamController.acceptInvitation);
router.get('/:id', teamController.getOne);
router.put('/:id', teamController.update);
router.post('/:id/invite', teamController.inviteMember);
router.delete('/:id/members/:memberId', teamController.removeMember);
router.get('/:id/analytics', teamController.getAnalytics);

export default router;
