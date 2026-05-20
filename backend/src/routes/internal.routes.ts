import { Router } from 'express';
import { SecuritySeverity } from '@prisma/client';
import { env } from '../config/env.js';
import { recordSecurityEvent } from '../services/security-events.service.js';
import { HttpError } from '../utils/http.js';

export const internalRoutes = Router();

internalRoutes.post('/security-events', async (req, res, next) => {
  try {
    const configuredToken = process.env.INTERNAL_API_TOKEN;
    if (configuredToken && req.headers['x-internal-token'] !== configuredToken) throw new HttpError(401, 'Invalid internal token');
    if (env.NODE_ENV === 'production' && !configuredToken) throw new HttpError(500, 'Internal token is not configured');
    const event = await recordSecurityEvent({
      module: req.body.module || 'security-events',
      action: req.body.action || 'security_event.ingest',
      type: req.body.type,
      severity: req.body.severity as SecuritySeverity,
      clientCompanyId: req.body.clientCompanyId,
      userId: req.body.userId,
      correlationId: req.body.correlationId,
      message: req.body.message,
      metadata: req.body.metadata,
      source: req.body.source
    });
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
});
