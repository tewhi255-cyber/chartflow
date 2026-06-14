import { Response, NextFunction } from 'express';
import { projectService } from '../services/project.service';
import { AuthRequest } from '../middleware/auth';

export class ProjectController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, description, teamId, startDate, endDate, priority, isPrivate } = req.body;
      const project = await projectService.createProject({
        name, description, teamId, ownerId: req.user!.id,
        startDate, endDate, priority, isPrivate,
      });
      res.status(201).json({ status: 'success', data: project });
    } catch (error) { next(error); }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.query;
      const projects = await projectService.getProjects(req.user!.id, teamId as string);
      res.json({ status: 'success', data: projects });
    } catch (error) { next(error); }
  }

  async getOne(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const project = await projectService.getProject(req.params.id);
      res.json({ status: 'success', data: project });
    } catch (error) { next(error); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await projectService.updateProject(req.params.id, req.body);
      res.json({ status: 'success', message: 'Project updated' });
    } catch (error) { next(error); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await projectService.deleteProject(req.params.id);
      res.json({ status: 'success', message: 'Project deleted' });
    } catch (error) { next(error); }
  }

  async createTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const { title, description, assigneeId, priority, dueDate, estimatedHours, parentTaskId } = req.body;
      const task = await projectService.createTask({
        projectId, title, description, assigneeId, reporterId: req.user!.id,
        priority, dueDate, estimatedHours, parentTaskId,
      });
      res.status(201).json({ status: 'success', data: task });
    } catch (error) { next(error); }
  }

  async getTasks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const { status, assigneeId, priority } = req.query;
      const tasks = await projectService.getTasks(projectId, {
        status: status as string, assigneeId: assigneeId as string, priority: priority as string,
      });
      res.json({ status: 'success', data: tasks });
    } catch (error) { next(error); }
  }

  async updateTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await projectService.updateTask(req.params.taskId, req.body);
      res.json({ status: 'success', message: 'Task updated' });
    } catch (error) { next(error); }
  }

  async deleteTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await projectService.deleteTask(req.params.taskId);
      res.json({ status: 'success', message: 'Task deleted' });
    } catch (error) { next(error); }
  }

  async addTaskComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const comment = await projectService.addTaskComment(req.params.taskId, req.user!.id, req.body.content);
      res.status(201).json({ status: 'success', data: comment });
    } catch (error) { next(error); }
  }

  async addMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId, role } = req.body;
      await projectService.addMember(req.params.id, userId, role);
      res.json({ status: 'success', message: 'Member added' });
    } catch (error) { next(error); }
  }

  async getAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const analytics = await projectService.getProjectAnalytics(req.params.id);
      res.json({ status: 'success', data: analytics });
    } catch (error) { next(error); }
  }
}

export const projectController = new ProjectController();
