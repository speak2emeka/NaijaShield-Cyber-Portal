import { Request, Response } from 'express';
import { externalIntegrationService } from '../services/external-integrations.service.js';
import { HttpError } from '../utils/http.js';

function companyId(req: Request): string;
function companyId(req: Request, required: false): string | undefined;
function companyId(req: Request, required = true) {
  const value = req.user?.clientCompanyId
    || req.params.clientCompanyId
    || String(req.query.clientCompanyId || '')
    || String(req.body?.clientCompanyId || '');

  if (!value && required) throw new HttpError(400, 'clientCompanyId is required');
  return value || undefined;
}

export const integrationsController = {
  async osintLookup(req: Request, res: Response) {
    res.json(await externalIntegrationService.osintLookup(String(req.query.query || ''), companyId(req, false)));
  },

  async threatIntelLookup(req: Request, res: Response) {
    res.json(await externalIntegrationService.threatIntelLookup(String(req.query.indicator || ''), String(req.query.type || ''), companyId(req, false)));
  },

  async cloudInventory(req: Request, res: Response) {
    res.json(await externalIntegrationService.fetchCloudInventory(companyId(req), req.query.accountId as string | undefined));
  },

  async phishingAnalyze(req: Request, res: Response) {
    res.json(await externalIntegrationService.analyzePhishingEmail(req.body, companyId(req)));
  },

  async emailSecurityEvent(req: Request, res: Response) {
    res.status(201).json(await externalIntegrationService.ingestEmailSecurityEvent(req.body, companyId(req)));
  },

  async complianceFrameworks(req: Request, res: Response) {
    res.json(await externalIntegrationService.complianceFrameworkStatus(companyId(req), req.query.framework as string | undefined));
  },

  async submitComplianceEvidence(req: Request, res: Response) {
    res.status(201).json(await externalIntegrationService.submitComplianceEvidence(companyId(req), req.body));
  }
};
