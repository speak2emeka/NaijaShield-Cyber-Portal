import { Request, Response } from 'express';
import { StaffScope } from '@prisma/client';
import { aiSecurityService } from '../services/ai-security.service.js';

export const aiSecurityController = {
  async threatModel(req: Request, res: Response) {
    res.json(await aiSecurityService.threatModel(req.body, req.user?.id));
  },
  async attackSurface(req: Request, res: Response) {
    res.json(await aiSecurityService.attackSurface(req.body, req.user?.id));
  },
  async testCases(req: Request, res: Response) {
    res.json(await aiSecurityService.testCases(req.body, req.user?.id));
  },
  async vulnerability(req: Request, res: Response) {
    res.json(await aiSecurityService.vulnerabilityAnalysis(req.body, req.user?.id));
  },
  async report(req: Request, res: Response) {
    res.json(await aiSecurityService.report(req.body, req.user?.id));
  },
  async runScan(req: Request, res: Response) {
    res.status(201).json(await aiSecurityService.runScan(req.body));
  },
  async scanResults(_req: Request, res: Response) {
    res.json(await aiSecurityService.scanResults());
  },
  async ciSubmit(req: Request, res: Response) {
    res.status(201).json(await aiSecurityService.ciSubmit(req.body));
  },
  async ciSummary(_req: Request, res: Response) {
    res.json(await aiSecurityService.ciSummary());
  },
  async uploadEvidence(req: Request, res: Response) {
    res.status(201).json(await aiSecurityService.evidence(req.body, req.user?.id, req.file));
  },
  async evidenceList(_req: Request, res: Response) {
    res.json(await aiSecurityService.evidenceList());
  },
  async evidenceDetail(req: Request, res: Response) {
    res.json(await aiSecurityService.evidenceById(String(req.params.id)));
  },
  async staff(req: Request, res: Response) {
    res.json(await aiSecurityService.staffAssignments(req.query.scope as StaffScope | undefined, req.query.clientCompanyId as string | undefined));
  },
  async assignStaff(req: Request, res: Response) {
    res.status(201).json(await aiSecurityService.assignStaff(req.body));
  },
  async clientStaff(req: Request, res: Response) {
    res.json(await aiSecurityService.staffAssignments(StaffScope.CLIENT, req.user!.clientCompanyId || undefined));
  },
  async assignClientStaff(req: Request, res: Response) {
    res.status(201).json(await aiSecurityService.assignStaff({
      ...req.body,
      scope: StaffScope.CLIENT,
      role: 'CLIENT',
      clientCompanyId: req.user!.clientCompanyId,
      permissions: req.body.permissions || ['client:dashboard', 'client:tickets', 'client:reports']
    }));
  }
};
