import { Router } from 'express';
import authRoutes from './auth.routes';
import chatRoutes from './chat.routes';
import fileRoutes from './file.routes';
import teamRoutes from './team.routes';
import projectRoutes from './project.routes';
import notificationRoutes from './notification.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/files', fileRoutes);
router.use('/teams', teamRoutes);
router.use('/projects', projectRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);

export default router;
