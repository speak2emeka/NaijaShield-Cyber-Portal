import { HttpError } from '../utils/http.js';
import { env } from '../config/env.js';
import { recordSecurityEvent } from './security-events.service.js';
import { prisma } from '../config/prisma.js';
import { lookupOsint } from './osint-integration.service.js';

interface ProviderConfig {
  baseUrl?: string;
  apiKey?: string;
  provider?: string;
}

const providerConfigs: Record<string, ProviderConfig> = {
  osint: {
    baseUrl: env.OSINT_API_BASE_URL,
    apiKey: env.OSINT_API_KEY,
    provider: env.OSINT_API_PROVIDER
  },
  threatIntel: {
    baseUrl: env.TI_API_BASE_URL,
    apiKey: env.TI_API_KEY,
    provider: env.TI_API_PROVIDER
  },
  cloud: {
    baseUrl: env.CLOUD_API_BASE_URL,
    apiKey: env.CLOUD_API_KEY,
    provider: env.CLOUD_API_PROVIDER
  },
  phishing: {
    baseUrl: env.PHISHING_API_BASE_URL,
    apiKey: env.PHISHING_API_KEY,
    provider: env.PHISHING_API_PROVIDER
  },
  emailSecurity: {
    baseUrl: env.EMAIL_SECURITY_API_BASE_URL,
    apiKey: env.EMAIL_SECURITY_API_KEY,
    provider: env.EMAIL_SECURITY_API_PROVIDER
  },
  compliance: {
    baseUrl: env.COMPLIANCE_API_BASE_URL,
    apiKey: env.COMPLIANCE_API_KEY,
    provider: env.COMPLIANCE_API_PROVIDER
  }
};

function createProviderHeaders(apiKey?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
  return headers;
}

async function externalRequest(serviceName: string, endpoint: string, method = 'GET', body?: unknown) {
  if (!env.EXTERNAL_INTEGRATIONS_ENABLED) {
    throw new HttpError(503, 'External integrations are disabled');
  }

  const config = providerConfigs[serviceName];
  if (!config || !config.baseUrl) {
    throw new HttpError(503, `External ${serviceName} integration is not configured`);
  }

  const url = `${config.baseUrl.replace(/\/$/, '')}${endpoint}`;
  const response = await fetch(url, {
    method,
    headers: createProviderHeaders(config.apiKey),
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await response.text();
  const payload = response.headers.get('content-type')?.includes('application/json') ? JSON.parse(text || '{}') : text;

  if (!response.ok) {
    throw new HttpError(response.status, `External ${serviceName} request failed`, { serviceName, statusText: response.statusText, body: payload });
  }

  return payload;
}

export const externalIntegrationService = {
  async osintLookup(query: string, clientCompanyId?: string) {
    const result = await lookupOsint({ query, clientCompanyId });
    await recordSecurityEvent({ module: 'security-events', action: 'external.osint.lookup', type: 'OSINT_LOOKUP', message: 'External OSINT lookup executed', clientCompanyId, metadata: { query } });
    return result;
  },

  async threatIntelLookup(indicator: string, type?: string, clientCompanyId?: string) {
    const payload = { indicator, type };
    const result = await externalRequest('threatIntel', '/indicators/lookup', 'POST', payload);
    await recordSecurityEvent({ module: 'security-events', action: 'external.threat-intel.lookup', type: 'THREAT_INTEL_LOOKUP', message: 'Threat intelligence lookup executed', clientCompanyId, metadata: payload });
    return result;
  },

  async fetchCloudInventory(clientCompanyId: string, accountId?: string) {
    const endpoint = accountId ? `/inventory/${encodeURIComponent(accountId)}` : '/inventory';
    const result = await externalRequest('cloud', endpoint);
    await recordSecurityEvent({ module: 'security-events', action: 'external.cloud.inventory', type: 'CLOUD_INVENTORY_FETCH', message: 'Cloud inventory lookup executed', clientCompanyId, metadata: { accountId } });
    return result;
  },

  async analyzePhishingEmail(email: { subject: string; body: string; headers?: unknown; attachments?: unknown[] }, clientCompanyId?: string) {
    const result = await externalRequest('phishing', '/analyze', 'POST', email);
    await recordSecurityEvent({ module: 'security-events', action: 'external.phishing.analysis', type: 'PHISHING_ANALYSIS', message: 'Phishing email analysis executed', clientCompanyId, metadata: { subject: email.subject } });
    return result;
  },

  async ingestEmailSecurityEvent(event: unknown, clientCompanyId?: string) {
    const result = await externalRequest('emailSecurity', '/events', 'POST', event);
    await recordSecurityEvent({ module: 'security-events', action: 'external.email-security.event', type: 'EMAIL_SECURITY_EVENT', message: 'Email security event ingested', clientCompanyId, metadata: { source: (event as any)?.source } });
    return result;
  },

  async complianceFrameworkStatus(clientCompanyId: string, framework?: string) {
    const endpoint = framework ? `/frameworks/${encodeURIComponent(framework)}` : '/frameworks';
    const result = await externalRequest('compliance', endpoint);
    await recordSecurityEvent({ module: 'security-events', action: 'external.compliance.framework', type: 'COMPLIANCE_FRAMEWORK_STATUS', message: 'Compliance framework status retrieved', clientCompanyId, metadata: { framework } });
    return result;
  },

  async submitComplianceEvidence(clientCompanyId: string, evidence: unknown) {
    const result = await externalRequest('compliance', '/evidence', 'POST', evidence);
    await prisma.complianceEvidence.create({
      data: {
        complianceStatusId: String((evidence as any).complianceStatusId),
        title: String((evidence as any).title),
        reportId: (evidence as any).reportId || undefined,
        fileUrl: (evidence as any).fileUrl || undefined
      }
    });
    await recordSecurityEvent({ module: 'security-events', action: 'external.compliance.evidence', type: 'COMPLIANCE_EVIDENCE_SUBMISSION', message: 'Compliance evidence submitted to external provider', clientCompanyId, metadata: { complianceStatusId: (evidence as any).complianceStatusId } });
    return result;
  }
};
