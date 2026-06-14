import { Router } from 'express';
import { projectController } from '../controllers/project.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /projects:
 *   get:
 *     tags: [Projects]
 *     summary: Get user projects
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of projects }
 */
router.get('/', projectController.getAll);
router.post('/', projectController.create);
router.get('/:id', projectController.getOne);
router.put('/:id', projectController.update);
router.delete('/:id', projectController.delete);
router.get('/:id/analytics', projectController.getAnalytics);
router.post('/:id/members', projectController.addMember);

router.get('/:projectId/tasks', projectController.getTasks);
router.post('/:projectId/tasks', projectController.createTask);
router.put('/tasks/:taskId', projectController.updateTask);
router.delete('/tasks/:taskId', projectController.deleteTask);
router.post('/tasks/:taskId/comments', projectController.addTaskComment);

export default router;
