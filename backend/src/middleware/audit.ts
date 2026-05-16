import { Request } from 'express';
import { prisma } from '../config/prisma.js';

export async function auditLog(req: Request, action: string, entityType: string, entityId?: string, metadata?: Record<string, unknown>) {
  await prisma.auditLog.create({
    data: {
      userId: req.user?.id,
      action,
      entityType,
      entityId,
      metadata: metadata as never,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    }
  });
}
