import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/http.js';
import { isFeatureEnabledForClient } from '../services/feature.service.js';

function resolveClientCompanyId(req: Request) {
  return req.user?.clientCompanyId || req.query.clientCompanyId as string | undefined || req.body.clientCompanyId as string | undefined || req.params.clientCompanyId as string | undefined;
}

export function requireFeature(featureCode: string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const clientCompanyId = resolveClientCompanyId(req);

    if (!clientCompanyId) {
      // Admin-level and global routes may not be attached to a specific tenant, so allow if no client context.
      return next();
    }

    const enabled = await isFeatureEnabledForClient(clientCompanyId, featureCode);

    if (!enabled) {
      return next(new HttpError(403, `Feature ${featureCode} is not enabled for this subscription`));
    }

    return next();
  };
}
