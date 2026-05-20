import { ScanTool } from '@prisma/client';

type Severity = 'informational' | 'low' | 'medium' | 'high' | 'critical';

export interface NormalizedFinding {
  title: string;
  severity: Severity;
  asset?: string;
  location?: string;
  description?: string;
  remediation?: string;
  evidence?: unknown;
}

export interface NormalizedScanResult {
  sourceTool: ScanTool;
  parser: 'zap' | 'nmap' | 'semgrep' | 'dependency' | 'generic';
  normalizedAt: string;
  counts: Record<Severity, number>;
  findings: NormalizedFinding[];
  affectedAssets: string[];
}

const emptyCounts = (): Record<Severity, number> => ({ informational: 0, low: 0, medium: 0, high: 0, critical: 0 });

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function list(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function text(value: unknown) {
  return typeof value === 'string' ? value : value == null ? undefined : String(value);
}

function severity(value: unknown): Severity {
  const normalized = String(value || '').toLowerCase();
  if (['critical', 'crit'].includes(normalized)) return 'critical';
  if (['high', 'error'].includes(normalized)) return 'high';
  if (['medium', 'moderate', 'warning', 'warn'].includes(normalized)) return 'medium';
  if (['low'].includes(normalized)) return 'low';
  return 'informational';
}

function finish(sourceTool: ScanTool, parser: NormalizedScanResult['parser'], findings: NormalizedFinding[]): NormalizedScanResult {
  const counts = emptyCounts();
  const affectedAssets = new Set<string>();
  findings.forEach(finding => {
    counts[finding.severity] += 1;
    if (finding.asset) affectedAssets.add(finding.asset);
  });
  return { sourceTool, parser, normalizedAt: new Date().toISOString(), counts, findings, affectedAssets: [...affectedAssets] };
}

function normalizeZap(raw: unknown) {
  const body = objectValue(raw);
  const alerts = list(body.alerts).length
    ? list(body.alerts)
    : list(body.site).flatMap(site => list(objectValue(site).alerts));

  return alerts.map(alert => {
    const item = objectValue(alert);
    return {
      title: text(item.name || item.alert) || 'ZAP alert',
      severity: severity(item.risk || item.riskdesc),
      asset: text(item.url || item.uri || item.host),
      location: text(item.url || item.uri),
      description: text(item.desc || item.description),
      remediation: text(item.solution),
      evidence: item
    };
  });
}

function normalizeNmap(raw: unknown) {
  const body = objectValue(raw);
  const hosts = list(body.hosts).length ? list(body.hosts) : [body];
  return hosts.flatMap(host => {
    const item = objectValue(host);
    const hostname = text(item.host || item.address || item.ip || item.hostname);
    return list(item.ports || item.services).map(port => {
      const service = objectValue(port);
      const portNumber = text(service.port || service.portid);
      const state = text(service.state) || 'unknown';
      return {
        title: `${text(service.service || service.name || service.product) || 'Service'} on ${portNumber || 'unknown port'}`,
        severity: state.toLowerCase() === 'open' ? 'low' as Severity : 'informational' as Severity,
        asset: hostname,
        location: portNumber ? `${hostname || 'host'}:${portNumber}` : hostname,
        description: `Service inventory item reported with state ${state}.`,
        remediation: 'Review asset inventory, exposure justification, and approved service baseline.',
        evidence: service
      };
    });
  });
}

function normalizeSemgrep(raw: unknown) {
  return list(objectValue(raw).results).map(result => {
    const item = objectValue(result);
    const extra = objectValue(item.extra);
    const start = objectValue(item.start);
    return {
      title: text(item.check_id || extra.message) || 'Semgrep finding',
      severity: severity(extra.severity || objectValue(extra.metadata).severity),
      asset: text(item.path),
      location: `${text(item.path) || 'source'}:${text(start.line) || '0'}`,
      description: text(extra.message),
      remediation: text(objectValue(extra.metadata).fix || objectValue(extra.metadata).remediation),
      evidence: item
    };
  });
}

function normalizeDependency(raw: unknown) {
  const body = objectValue(raw);
  const items = list(body.vulnerabilities).length ? list(body.vulnerabilities) : list(body.findings);
  return items.map(vulnerability => {
    const item = objectValue(vulnerability);
    const pkg = text(item.package || item.name || item.moduleName);
    return {
      title: text(item.title || item.id || item.cve) || `Dependency issue${pkg ? ` in ${pkg}` : ''}`,
      severity: severity(item.severity),
      asset: pkg,
      location: text(item.version),
      description: text(item.description || item.summary),
      remediation: text(item.fixedVersion || item.recommendation || item.remediation),
      evidence: item
    };
  });
}

function collectGeneric(value: unknown, findings: NormalizedFinding[] = []): NormalizedFinding[] {
  if (Array.isArray(value)) {
    value.forEach(item => collectGeneric(item, findings));
    return findings;
  }

  const item = objectValue(value);
  if (!Object.keys(item).length) return findings;
  if ('severity' in item || 'risk' in item) {
    findings.push({
      title: text(item.title || item.name || item.message || item.id) || 'Security scanner finding',
      severity: severity(item.severity || item.risk),
      asset: text(item.asset || item.target || item.host || item.url || item.path),
      description: text(item.description || item.message || item.summary),
      remediation: text(item.remediation || item.solution || item.recommendation),
      evidence: item
    });
  }
  Object.values(item).forEach(child => {
    if (child && typeof child === 'object') collectGeneric(child, findings);
  });
  return findings;
}

export function normalizeScanResult(tool: ScanTool, raw: unknown): NormalizedScanResult {
  if (tool === ScanTool.ZAP) return finish(tool, 'zap', normalizeZap(raw));
  if (tool === ScanTool.NMAP) return finish(tool, 'nmap', normalizeNmap(raw));
  if (tool === ScanTool.SEMGREP) return finish(tool, 'semgrep', normalizeSemgrep(raw));
  if (tool === ScanTool.DEPENDENCY) return finish(tool, 'dependency', normalizeDependency(raw));
  return finish(tool, 'generic', collectGeneric(raw));
}
