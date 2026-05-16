import { AiArtifactType, EvidenceType, ScanStatus, ScanTool, StaffScope, UserRole } from '@prisma/client';
import argon2 from 'argon2';
import { prisma } from '../config/prisma.js';

const stride = ['Spoofing', 'Tampering', 'Repudiation', 'Information Disclosure', 'Denial of Service', 'Elevation of Privilege'];

function riskScore(seed: number) {
  return Math.max(35, Math.min(95, 55 + seed * 7));
}

async function artifact(type: AiArtifactType, title: string, input: unknown, output: unknown, userId?: string, clientCompanyId?: string) {
  return prisma.aiArtifact.create({ data: { type, title, input: input as never, output: output as never, createdByUserId: userId, clientCompanyId } });
}

export const aiSecurityService = {
  async threatModel(input: any, userId?: string) {
    const assets = input.assets || [];
    const threats = stride.map((category, index) => ({
      id: `tm-${index + 1}`,
      category,
      component: assets[index % Math.max(assets.length, 1)]?.identifier || input.architecture?.name || 'Application boundary',
      risk: riskScore(index),
      description: `${category} risk requiring architecture review and control validation.`,
      suggestedTestAreas: ['authentication controls', 'authorization boundaries', 'logging coverage', 'configuration review']
    }));
    const output = {
      threats,
      attackPaths: [
        { id: 'path-1', name: 'Identity to sensitive data path', steps: ['User entry point', 'Session boundary', 'Privileged API', 'Data store'], risk: 'HIGH' },
        { id: 'path-2', name: 'Public asset to operations path', steps: ['Internet-facing asset', 'API gateway', 'service tier', 'audit trail'], risk: 'MEDIUM' }
      ],
      riskSummary: { score: Math.round(threats.reduce((sum, item) => sum + item.risk, 0) / threats.length), methodology: 'STRIDE-assisted review' }
    };
    await artifact(AiArtifactType.THREAT_MODEL, 'AI-assisted threat model', input, output, userId, input.clientCompanyId);
    return output;
  },

  async attackSurface(input: any, userId?: string) {
    const assets = input.assets || [];
    const output = {
      assets: assets.map((asset: any) => ({
        ...asset,
        classification: asset.type === 'CLOUD' ? 'cloud control plane' : asset.type === 'APP' ? 'application endpoint' : 'network identity',
        exposurePoints: ['public metadata review', 'TLS posture review', 'authentication surface review'],
        suggestedReconSteps: ['confirm asset ownership', 'review passive DNS metadata', 'map declared service inventory'],
        riskLevel: asset.riskLevel || 'MEDIUM'
      })),
      ingestionStubs: { dnsWhois: 'ready', serviceMetadata: 'ready' },
      summary: { highRiskComponents: assets.filter((asset: any) => ['HIGH', 'CRITICAL'].includes(asset.riskLevel)).length, note: 'Passive and declared-asset analysis only.' }
    };
    await artifact(AiArtifactType.ATTACK_SURFACE, 'AI-assisted attack surface analysis', input, output, userId, input.clientCompanyId);
    return output;
  },

  async testCases(input: any, userId?: string) {
    const threats = input.threats || [];
    const testCases = (threats.length ? threats : stride.map(category => ({ category }))).map((threat: any, index: number) => ({
      id: `tc-${index + 1}`,
      objective: `Validate controls for ${threat.category || 'security risk'}`,
      preconditions: ['Authorized test window', 'Approved scope', 'Test account with expected role'],
      requestStructure: { method: 'DESIGN_REVIEW', target: threat.component || 'in-scope component', payload: 'No exploit payloads generated' },
      expectedBehavior: 'Control blocks unauthorized or unsafe behavior and logs the attempt.',
      indicatorsOfVulnerability: ['unexpected access', 'missing audit log', 'excessive error detail', 'weak authorization decision'],
      severity: index < 2 ? 'HIGH' : 'MEDIUM',
      impactNotes: 'Business impact should be validated with asset owner before reporting.'
    }));
    const output = { testCases, safetyNote: 'Generated cases are validation plans only and contain no exploit payloads.' };
    await artifact(AiArtifactType.TEST_CASES, 'AI-assisted test cases', input, output, userId, input.clientCompanyId);
    return output;
  },

  async vulnerabilityAnalysis(input: any, userId?: string) {
    const output = {
      classification: input.category || 'Security misconfiguration',
      likelihood: input.severity === 'CRITICAL' ? 'High' : 'Medium',
      impact: 'Potential control weakness requiring confirmed reproduction in an authorized environment.',
      remediation: ['Validate secure configuration baseline', 'Add regression test coverage', 'Improve monitoring and alerting'],
      evidenceSummary: { sources: Object.keys(input).filter(key => ['logs', 'responses', 'errors', 'scanOutputs'].includes(key)), confidence: 'medium' }
    };
    await artifact(AiArtifactType.VULN_ANALYSIS, 'AI-assisted vulnerability analysis', input, output, userId, input.clientCompanyId);
    return output;
  },

  async report(input: any, userId?: string) {
    const findings = input.findings || [];
    const output = {
      executiveSummary: `Assessment identified ${findings.length} confirmed finding(s), with remediation prioritized by business risk.`,
      technicalFindings: findings,
      impactAnalysis: 'Impact is derived from affected assets, likelihood, and control maturity.',
      remediationGuidance: ['Prioritize critical/high issues', 'Track remediation owners', 'Run validation testing after fixes'],
      riskScoring: { overall: findings.some((finding: any) => finding.severity === 'CRITICAL') ? 'CRITICAL' : 'MEDIUM' },
      pdfExport: { status: 'stubbed', message: 'PDF export worker can render this JSON into a branded report.' }
    };
    await artifact(AiArtifactType.REPORT, 'AI-assisted pentest report', input, output, userId, input.clientCompanyId);
    return output;
  },

  async runScan(input: any) {
    const run = await prisma.securityScanRun.create({
      data: {
        clientCompanyId: input.clientCompanyId,
        tool: input.tool as ScanTool,
        target: input.target,
        status: ScanStatus.COMPLETED,
        finishedAt: new Date(),
        summary: {
          stubbed: true,
          message: `${input.tool} orchestration completed in dry-run mode.`,
          counts: { informational: 3, low: 2, medium: 1, high: 0, critical: 0 }
        },
        rawResult: { scanner: input.tool, target: input.target, safeMode: true }
      }
    });
    return run;
  },

  scanResults() {
    return prisma.securityScanRun.findMany({ include: { clientCompany: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' }, take: 100 });
  },

  async ciSubmit(input: any) {
    const findings = input.findings || [];
    const critical = findings.filter((finding: any) => finding.severity === 'CRITICAL').length;
    const high = findings.filter((finding: any) => finding.severity === 'HIGH').length;
    const score = Math.max(0, 100 - critical * 35 - high * 15 - findings.length * 3);
    return prisma.ciSecurityResult.create({
      data: {
        clientCompanyId: input.clientCompanyId,
        repository: input.repository,
        branch: input.branch || 'main',
        commitSha: input.commitSha,
        pipelineId: input.pipelineId,
        score,
        status: score >= 70 ? 'PASS' : 'FAIL',
        findings,
        summary: { critical, high, total: findings.length, policy: 'fail below 70 or any critical finding' }
      }
    });
  },

  ciSummary() {
    return prisma.ciSecurityResult.findMany({ include: { clientCompany: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' }, take: 50 });
  },

  async evidence(input: any, userId?: string, file?: Express.Multer.File) {
    return prisma.evidenceItem.create({
      data: {
        clientCompanyId: input.clientCompanyId,
        uploadedByUserId: userId,
        type: (input.type || EvidenceType.OTHER) as EvidenceType,
        title: input.title,
        description: input.description,
        tags: typeof input.tags === 'string' ? input.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : input.tags || [],
        findingRef: input.findingRef,
        fileUrl: file ? `/uploads/reports/${file.filename}` : input.fileUrl,
        storageKey: file?.filename,
        summary: { generated: true, text: `Evidence '${input.title}' is ready for analyst review.` }
      }
    });
  },

  evidenceById(id: string) {
    return prisma.evidenceItem.findUniqueOrThrow({ where: { id }, include: { uploadedBy: { select: { id: true, name: true, email: true } }, clientCompany: true } });
  },

  evidenceList() {
    return prisma.evidenceItem.findMany({ include: { uploadedBy: { select: { id: true, name: true, email: true } }, clientCompany: true }, orderBy: { createdAt: 'desc' }, take: 100 });
  },

  staffAssignments(scope?: StaffScope, clientCompanyId?: string) {
    return prisma.staffAssignment.findMany({ where: { scope, clientCompanyId, active: true }, include: { user: { select: { id: true, name: true, email: true, role: true } }, clientCompany: true }, orderBy: { createdAt: 'desc' } });
  },

  async assignStaff(input: any) {
    const passwordHash = await argon2.hash(input.password || 'ChangeMe123');
    const permissions = typeof input.permissions === 'string' ? input.permissions.split(',').map((item: string) => item.trim()).filter(Boolean) : input.permissions || [];
    const user = await prisma.user.upsert({
      where: { email: input.email.toLowerCase() },
      update: { name: input.name, role: input.role as UserRole, clientCompanyId: input.scope === StaffScope.CLIENT ? input.clientCompanyId : null },
      create: { email: input.email.toLowerCase(), name: input.name, passwordHash, role: input.role as UserRole, clientCompanyId: input.scope === StaffScope.CLIENT ? input.clientCompanyId : null }
    });
    return prisma.staffAssignment.upsert({
      where: { userId_clientCompanyId_scope: { userId: user.id, clientCompanyId: input.clientCompanyId || null, scope: input.scope as StaffScope } },
      update: { role: input.role as UserRole, permissions, active: true },
      create: { userId: user.id, clientCompanyId: input.clientCompanyId || null, scope: input.scope as StaffScope, role: input.role as UserRole, permissions },
      include: { user: { select: { id: true, name: true, email: true, role: true } }, clientCompany: true }
    });
  }
};
