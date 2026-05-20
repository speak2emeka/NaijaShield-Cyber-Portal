import { randomUUID } from 'node:crypto';
import { env } from '../config/env.js';
import { HttpError } from '../utils/http.js';

export interface OsintLookupInput {
  query: string;
  clientCompanyId?: string;
  signal?: AbortSignal;
}

export interface NormalizedOsintResult {
  provider: string;
  requestId: string;
  query: string;
  executedAt: string;
  records: unknown[];
  raw: unknown;
}

function headers(apiKey?: string) {
  const value: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) value.Authorization = `Bearer ${apiKey}`;
  return value;
}

function asRecords(payload: unknown) {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object') {
    const body = payload as Record<string, unknown>;
    for (const key of ['records', 'results', 'data', 'items']) {
      if (Array.isArray(body[key])) return body[key] as unknown[];
    }
  }
  return payload ? [payload] : [];
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: init.signal || controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function lookupOsint(input: OsintLookupInput): Promise<NormalizedOsintResult> {
  if (!env.EXTERNAL_INTEGRATIONS_ENABLED) throw new HttpError(503, 'External integrations are disabled');
  if (!env.OSINT_API_BASE_URL) throw new HttpError(503, 'External OSINT integration is not configured');

  const provider = env.OSINT_API_PROVIDER || 'configured-osint-provider';
  const requestId = randomUUID();
  const url = `${env.OSINT_API_BASE_URL.replace(/\/$/, '')}/search?query=${encodeURIComponent(input.query)}`;
  const response = await fetchWithTimeout(url, { method: 'GET', headers: headers(env.OSINT_API_KEY), signal: input.signal });
  const text = await response.text();
  const payload = response.headers.get('content-type')?.includes('application/json') ? JSON.parse(text || '{}') : text;

  if (!response.ok) {
    throw new HttpError(response.status, 'External OSINT request failed', { provider, requestId, statusText: response.statusText });
  }

  return {
    provider,
    requestId,
    query: input.query,
    executedAt: new Date().toISOString(),
    records: asRecords(payload),
    raw: payload
  };
}
