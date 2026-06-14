import { Response, NextFunction } from 'express';
import { teamService } from '../services/team.service';
import { AuthRequest } from '../middleware/auth';

export class TeamController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, description, isPrivate } = req.body;
      const team = await teamService.createTeam({ name, description, ownerId: req.user!.id, isPrivate });
      res.status(201).json({ status: 'success', data: team });
    } catch (error) { next(error); }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const teams = await teamService.getTeams(req.user!.id);
      res.json({ status: 'success', data: teams });
    } catch (error) { next(error); }
  }

  async getOne(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const team = await teamService.getTeam(req.params.id, req.user!.id);
      res.json({ status: 'success', data: team });
    } catch (error) { next(error); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await teamService.updateTeam(req.params.id, req.body);
      res.json({ status: 'success', message: 'Team updated' });
    } catch (error) { next(error); }
  }

  async inviteMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await teamService.inviteMember(req.params.id, req.user!.id, email);
      res.json({ status: 'success', data: result });
    } catch (error) { next(error); }
  }

  async acceptInvitation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { token } = req.query;
      await teamService.acceptInvitation(token as string, req.user!.id);
      res.json({ status: 'success', message: 'Joined team successfully' });
    } catch (error) { next(error); }
  }

  async removeMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await teamService.removeMember(req.params.id, req.params.memberId);
      res.json({ status: 'success', message: 'Member removed' });
    } catch (error) { next(error); }
  }

  async getAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const analytics = await teamService.getTeamAnalytics(req.params.id);
      res.json({ status: 'success', data: analytics });
    } catch (error) { next(error); }
  }
}

export const teamController = new TeamController();
