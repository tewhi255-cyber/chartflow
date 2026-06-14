import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { searchController } from '../controllers/search.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorize('admin', 'super_admin'));

router.get('/users', adminController.getUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);
router.get('/dashboard', adminController.getDashboardStats);
router.get('/logs', adminController.getSystemLogs);
router.get('/search', searchController.globalSearch);

export default router;
