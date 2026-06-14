import { Response, NextFunction } from 'express';
import { fileService } from '../services/file.service';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export class FileController {
  async upload(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new AppError('No file provided', 400);
      const { originalname, filename, mimetype, size } = req.file;
      const { teamId, projectId, messageId, description, categoryId } = req.body;

      const file = await fileService.uploadFile({
        originalName: originalname,
        storedName: filename,
        mimeType: mimetype,
        size,
        uploaderId: req.user!.id,
        teamId, projectId, messageId, description, categoryId,
      });

      res.status(201).json({ status: 'success', data: file });
    } catch (error) { next(error); }
  }

  async uploadMultiple(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.files || (req.files as any[]).length === 0) {
        throw new AppError('No files provided', 400);
      }
      const files = await Promise.all(
        (req.files as Express.Multer.File[]).map(file =>
          fileService.uploadFile({
            originalName: file.originalname,
            storedName: file.filename,
            mimeType: file.mimetype,
            size: file.size,
            uploaderId: req.user!.id,
            teamId: req.body.teamId,
            projectId: req.body.projectId,
          })
        )
      );
      res.status(201).json({ status: 'success', data: files });
    } catch (error) { next(error); }
  }

  async getFiles(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { teamId, projectId, categoryId, page = '1', limit = '20' } = req.query;
      const result = await fileService.getFiles({
        teamId: teamId as string, projectId: projectId as string,
        uploaderId: req.user!.id, categoryId: categoryId as string,
        page: parseInt(page as string), limit: parseInt(limit as string),
      });
      res.json({ status: 'success', data: result });
    } catch (error) { next(error); }
  }

  async getFile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const file = await fileService.getFile(req.params.id);
      res.json({ status: 'success', data: file });
    } catch (error) { next(error); }
  }

  async deleteFile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await fileService.deleteFile(req.params.id, req.user!.id);
      res.json({ status: 'success', message: 'File deleted' });
    } catch (error) { next(error); }
  }

  async getCategories(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const categories = await fileService.getCategories();
      res.json({ status: 'success', data: categories });
    } catch (error) { next(error); }
  }

  async getTags(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tags = await fileService.getTags();
      res.json({ status: 'success', data: tags });
    } catch (error) { next(error); }
  }

  async searchFiles(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;
      const files = await fileService.searchFiles(q as string);
      res.json({ status: 'success', data: files });
    } catch (error) { next(error); }
  }
}

export const fileController = new FileController();
