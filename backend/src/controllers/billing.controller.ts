import { Request, Response } from 'express';
import { BillingProvider, SubscriptionStatus } from '@prisma/client';
import { billingService } from '../services/billing.service.js';

export const billingController = {
  async checkout(req: Request, res: Response) {
    res.json(await billingService.checkout(req.user!.clientCompanyId!, req.body.planId, req.body.provider || BillingProvider.STRIPE));
  },
  async webhook(req: Request, res: Response) {
    res.json(await billingService.handleWebhook(req.body));
  },
  async adminSubscriptions(_req: Request, res: Response) {
    res.json(await billingService.adminSubscriptions());
  },
  async changePlan(req: Request, res: Response) {
    res.json(await billingService.changePlan(String(req.params.id), req.body.plan, req.body.billingInterval));
  },
  async updateStatus(req: Request, res: Response) {
    res.json(await billingService.updateStatus(String(req.params.id), req.body.status as SubscriptionStatus));
  },
  async setTenantProductPlan(req: Request, res: Response) {
    res.json(await billingService.setTenantProductPlan(String(req.params.clientCompanyId), req.body.planSlug));
  },
  async retryInvoice(req: Request, res: Response) {
    res.json(await billingService.retryInvoice(String(req.params.id)));
  },
  async clientSubscription(req: Request, res: Response) {
    res.json(await billingService.subscription(req.user!.clientCompanyId!));
  }
};
