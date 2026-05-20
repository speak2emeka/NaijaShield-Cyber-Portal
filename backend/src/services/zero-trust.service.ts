import crypto from 'crypto';
import { Request } from 'express';
import { StepUpAction } from '../types/service-boundaries.js';

export function fingerprintRequest(req: Request) {
  return crypto.createHash('sha256').update([
    req.headers['user-agent'] || '',
    req.headers['accept-language'] || '',
    req.ip || ''
  ].join('|')).digest('hex');
}

export function evaluateSessionRisk(input: { knownDevice?: boolean; countryChanged?: boolean; failedMfa?: boolean; abnormalVolume?: boolean }) {
  const flags: string[] = [];
  let riskScore = 0;
  if (!input.knownDevice) { riskScore += 35; flags.push('new_device'); }
  if (input.countryChanged) { riskScore += 30; flags.push('country_change'); }
  if (input.failedMfa) { riskScore += 25; flags.push('mfa_failure'); }
  if (input.abnormalVolume) { riskScore += 20; flags.push('abnormal_volume'); }
  return { riskScore: Math.min(riskScore, 100), flags, stepUpRequired: riskScore >= 40 };
}

export function requiresStepUp(action: StepUpAction, riskScore = 0) {
  return ['report.download', 'roles.change', 'audit.view'].includes(action) || riskScore >= 40;
}
