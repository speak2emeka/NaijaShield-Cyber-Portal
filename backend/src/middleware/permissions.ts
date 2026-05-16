import { NextFunction, Request, Response } from 'express';
import { hasPermission } from '../services/permissions.service.js';

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !hasPermission(req.user.role, permission)) return res.status(403).json({ error: 'Insufficient permission' });
    next();
  };
}
