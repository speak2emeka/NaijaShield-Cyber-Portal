import { Request, Response } from 'express';
import { auditLog } from '../middleware/audit.js';
import { authService } from '../services/auth.service.js';

export const authController = {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body, res, req.headers['user-agent'], req.ip);
    await auditLog(req, 'auth.register', 'User', result.user.id, { email: result.user.email });
    res.status(201).json(result);
  },

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body.email, req.body.password, res, req.headers['user-agent'], req.ip);
    req.user = result.user;
    await auditLog(req, 'auth.login', 'User', result.user.id, { email: result.user.email });
    res.json(result);
  },

  async refresh(req: Request, res: Response) {
    const result = await authService.refresh(req.cookies?.ns_refresh, res, req.headers['user-agent'], req.ip);
    res.json(result);
  },

  async logout(req: Request, res: Response) {
    const result = await authService.logout(req.cookies?.ns_refresh, res);
    await auditLog(req, 'auth.logout', 'User', req.user?.id);
    res.json(result);
  },

  async me(req: Request, res: Response) {
    res.json({ user: req.user });
  }
};
