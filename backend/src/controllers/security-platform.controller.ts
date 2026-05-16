import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { calculateSecurityPosture } from '../services/security-posture.service.js';
import { listSecurityEvents } from '../services/security-events.service.js';
import { attackLabService } from '../services/attack-lab.service.js';
import { tenantCryptoService } from '../services/tenant-crypto.service.js';
import { evaluateSessionRisk } from '../services/zero-trust.service.js';

function companyId(req: Request) {
  return req.user!.clientCompanyId!;
}

export const securityPlatformController = {
  async posture(req: Request, res: Response) {
    const summary = await prisma.securityPostureSummary.findUnique({ where: { clientCompanyId: companyId(req) } }) || await calculateSecurityPosture(companyId(req));
    const history = await prisma.securityScoreHistory.findMany({ where: { clientCompanyId: companyId(req) }, orderBy: { calculatedAt: 'asc' } });
    res.json({ summary, history });
  },

  async recalculatePosture(req: Request, res: Response) {
    res.json(await calculateSecurityPosture(companyId(req)));
  },

  async clientEvents(req: Request, res: Response) {
    res.json(await listSecurityEvents({ clientCompanyId: companyId(req), type: req.query.type as string | undefined }));
  },

  async adminEvents(req: Request, res: Response) {
    res.json(await listSecurityEvents({ type: req.query.type as string | undefined, source: req.query.source as string | undefined }));
  },

  async assets(req: Request, res: Response) {
    res.json(await prisma.clientAsset.findMany({ where: { clientCompanyId: companyId(req), riskLevel: req.query.riskLevel as never }, orderBy: { lastSeenAt: 'desc' } }));
  },

  async compliance(req: Request, res: Response) {
    res.json(await prisma.complianceStatus.findMany({ where: { clientCompanyId: companyId(req) }, include: { evidence: true }, orderBy: { framework: 'asc' } }));
  },

  async addEvidence(req: Request, res: Response) {
    res.status(201).json(await prisma.complianceEvidence.create({ data: { complianceStatusId: String(req.params.id), title: req.body.title, reportId: req.body.reportId, fileUrl: req.body.fileUrl } }));
  },

  async scenarios(_req: Request, res: Response) {
    res.json(await attackLabService.scenarios());
  },

  async startRun(req: Request, res: Response) {
    res.status(201).json(await attackLabService.startRun(companyId(req), req.body.scenarioId));
  },

  async runs(req: Request, res: Response) {
    res.json(await attackLabService.runs(companyId(req)));
  },

  async runDetail(req: Request, res: Response) {
    res.json(await attackLabService.runDetail(companyId(req), String(req.params.id)));
  },

  async drill(req: Request, res: Response) {
    res.json(attackLabService.drill(String(req.query.kind || 'phishing')));
  },

  async scoreDrill(req: Request, res: Response) {
    res.json(attackLabService.scoreDrill(req.body.kind || 'phishing', req.body.answers || []));
  },

  async adminAttackOverview(_req: Request, res: Response) {
    const [runs, scenarios, events] = await Promise.all([
      prisma.attackRun.count(),
      prisma.attackScenario.findMany({ include: { _count: { select: { runs: true } } }, orderBy: { title: 'asc' } }),
      prisma.securityEvent.groupBy({ by: ['type'], _count: { type: true }, orderBy: { _count: { type: 'desc' } }, take: 8 })
    ]);
    res.json({ runs, scenarios, commonEventTypes: events });
  },

  async tenantKey(req: Request, res: Response) {
    res.json(await tenantCryptoService.keyMetadata(companyId(req)));
  },

  async rotateTenantKey(req: Request, res: Response) {
    res.json(await tenantCryptoService.rotateKey(String(req.params.clientCompanyId)));
  },

  async sessionRisk(req: Request, res: Response) {
    res.json(evaluateSessionRisk(req.body));
  }
};
