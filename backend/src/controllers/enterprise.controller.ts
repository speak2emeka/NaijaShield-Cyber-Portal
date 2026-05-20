import { Request, Response } from 'express';
import { BillingProvider } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { permissionMatrix } from '../services/permissions.service.js';
import { billingService } from '../services/billing.service.js';
import { securityService } from '../services/security.service.js';
import { signedReportUrl } from '../services/storage.service.js';

export const enterpriseController = {
  async requestEmailVerification(req: Request, res: Response) {
    res.json(await securityService.requestEmailVerification(req.body.email));
  },
  async verifyEmail(req: Request, res: Response) {
    res.json(await securityService.verifyEmail(req.body.token));
  },
  async requestPasswordReset(req: Request, res: Response) {
    res.json(await securityService.requestPasswordReset(req.body.email));
  },
  async resetPassword(req: Request, res: Response) {
    res.json(await securityService.resetPassword(req.body.token, req.body.password));
  },
  async setupMfa(req: Request, res: Response) {
    res.json(await securityService.setupTotp(req.user!.id));
  },
  async verifyMfa(req: Request, res: Response) {
    res.json(await securityService.verifyTotp(req.user!.id, req.body.token));
  },
  async sessions(req: Request, res: Response) {
    res.json(await securityService.sessions(req.user!.id));
  },
  async permissions(_req: Request, res: Response) {
    res.json(permissionMatrix);
  },
  async plans(_req: Request, res: Response) {
    res.json(await billingService.getPlans());
  },
  async checkout(req: Request, res: Response) {
    res.json(await billingService.checkout(req.user!.clientCompanyId!, req.body.planId, req.body.provider || BillingProvider.STRIPE));
  },
  async invoices(req: Request, res: Response) {
    res.json(await billingService.invoices(req.user!.clientCompanyId!));
  },
  async signedReport(req: Request, res: Response) {
    const report = await prisma.report.findFirstOrThrow({ where: { id: String(req.params.id), clientCompanyId: req.user!.clientCompanyId || undefined } });
    res.json({ url: await signedReportUrl(report.storageKey, report.filePath), checksum: report.checksum });
  },
  async ssoConfig(_req: Request, res: Response) {
    res.json({ providers: ['azure-ad', 'google-workspace', 'okta'], status: 'configuration-required' });
  },
  async auditCsv(_req: Request, res: Response) {
    const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 1000, include: { user: { select: { email: true } } } });
    const rows = ['createdAt,correlationId,user,action,entityType,entityId,ipAddress,userAgent'];
    for (const log of logs) rows.push([log.createdAt.toISOString(), log.correlationId || '', log.user?.email || '', log.action, log.entityType, log.entityId || '', log.ipAddress || '', JSON.stringify(log.userAgent || '')].join(','));
    res.setHeader('content-type', 'text/csv');
    res.setHeader('content-disposition', 'attachment; filename="audit-logs.csv"');
    res.send(rows.join('\n'));
  }
};
