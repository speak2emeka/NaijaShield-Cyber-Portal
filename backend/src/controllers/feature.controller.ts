import { Request, Response } from 'express';
import { featureFlagService } from '../services/feature-flag.service.js';

export const featureController = {
  async listFlags(_req: Request, res: Response) {
    res.json(await featureFlagService.listFlags());
  },

  async listClientFlags(req: Request, res: Response) {
    res.json(await featureFlagService.listClientFlags(String(req.params.clientCompanyId)));
  },

  async setClientFlag(req: Request, res: Response) {
    res.json(await featureFlagService.setClientFlag(String(req.params.clientCompanyId), String(req.params.featureFlagId), req.body.enabled));
  }
};
