import { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/http.js';

async function planSlugForClient(clientCompanyId: string) {
  const client = await prisma.clientCompany.findUnique({ where: { id: clientCompanyId }, include: { productPlan: true } });
  if (!client) throw new HttpError(403, 'Client not found');

  if (client.productPlan?.slug) return client.productPlan.slug;

  const subscription = await prisma.subscription.findUnique({ where: { clientCompanyId: client.id }, include: { planRef: true } });
  return subscription?.planRef?.slug;
}

function requestClientCompanyId(req: Request) {
  const queryClientCompanyId = req.query.clientCompanyId;
  const queryValue = Array.isArray(queryClientCompanyId) ? queryClientCompanyId[0] : queryClientCompanyId;
  const paramClientCompanyId = Array.isArray(req.params.clientCompanyId) ? req.params.clientCompanyId[0] : req.params.clientCompanyId;
  const paramId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  return paramClientCompanyId
    || paramId
    || String(req.body?.clientCompanyId || '')
    || (typeof queryValue === 'string' ? queryValue : undefined)
    || req.user?.clientCompanyId
    || undefined;
}

export function requireTier(allowedPlanSlugs: string[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user?.clientCompanyId) return next(new HttpError(403, 'Client company context required'));
      const planSlug = await planSlugForClient(req.user.clientCompanyId);
      if (planSlug && allowedPlanSlugs.includes(planSlug)) return next();
      return next(new HttpError(403, 'Product tier does not grant access to this resource'));
    } catch (error) {
      return next(error);
    }
  };
}

export function requireClientTier(allowedPlanSlugs: string[], options: { optionalClientContext?: boolean } = {}) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const clientCompanyId = requestClientCompanyId(req);
      if (!clientCompanyId) {
        if (options.optionalClientContext) return next();
        return next(new HttpError(403, 'Client company context required'));
      }

      const planSlug = await planSlugForClient(clientCompanyId);
      if (planSlug && allowedPlanSlugs.includes(planSlug)) return next();
      return next(new HttpError(403, 'Product tier does not grant access to this resource'));
    } catch (error) {
      return next(error);
    }
  };
}
