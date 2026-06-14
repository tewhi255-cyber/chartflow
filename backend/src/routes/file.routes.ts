import { Router } from 'express';
import { fileController } from '../controllers/file.controller';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /files:
 *   post:
 *     tags: [Files]
 *     summary: Upload a file
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       201: { description: File uploaded }
 */
router.post('/', upload.single('file'), fileController.upload);
router.post('/multiple', upload.array('files', 10), fileController.uploadMultiple);
router.get('/', fileController.getFiles);
router.get('/categories', fileController.getCategories);
router.get('/tags', fileController.getTags);
router.get('/search', fileController.searchFiles);
router.get('/:id', fileController.getFile);
router.delete('/:id', fileController.deleteFile);

export default router;
