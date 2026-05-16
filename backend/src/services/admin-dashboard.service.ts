import { SecuritySeverity, SubscriptionStatus } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export async function adminDashboardSummary() {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalClients,
    activeSubscriptions,
    trialAccounts,
    openTickets,
    pendingRequests,
    recentReportUploads,
    posture,
    highRiskClients,
    complianceReadiness,
    events24h,
    severityDistribution,
    topEventCategories,
    attackRuns,
    mostTriggeredScenarios,
    readinessRuns,
    recentActivity
  ] = await Promise.all([
    prisma.clientCompany.count({ where: { deletedAt: null } }),
    prisma.subscription.count({ where: { status: SubscriptionStatus.ACTIVE } }),
    prisma.subscription.count({ where: { status: SubscriptionStatus.TRIAL } }),
    prisma.ticket.count({ where: { deletedAt: null, status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
    prisma.serviceRequest.count({ where: { deletedAt: null, status: 'PENDING' } }),
    prisma.report.count({ where: { deletedAt: null, createdAt: { gte: since7d } } }),
    prisma.securityPostureSummary.aggregate({ _avg: { score: true }, _count: { score: true } }),
    prisma.securityPostureSummary.findMany({ where: { score: { lt: 60 } }, include: { clientCompany: { select: { id: true, name: true } } }, orderBy: { score: 'asc' }, take: 10 }),
    prisma.complianceStatus.groupBy({ by: ['framework'], _avg: { score: true }, _count: { framework: true } }),
    prisma.securityEvent.count({ where: { createdAt: { gte: since24h } } }),
    prisma.securityEvent.groupBy({ by: ['severity'], where: { createdAt: { gte: since24h } }, _count: { severity: true } }),
    prisma.securityEvent.groupBy({ by: ['type'], where: { createdAt: { gte: since24h } }, _count: { type: true }, orderBy: { _count: { type: 'desc' } }, take: 8 }),
    prisma.attackRun.count(),
    prisma.attackScenario.findMany({ include: { _count: { select: { runs: true } } }, orderBy: { title: 'asc' } }),
    prisma.attackRun.findMany({ select: { resultSummary: true, clientCompany: { select: { id: true, name: true } } }, orderBy: { startedAt: 'desc' }, take: 50 }),
    prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 20, include: { user: { select: { name: true, email: true } } } })
  ]);

  const readinessScores = readinessRuns.map(run => {
    const summary = (run.resultSummary || {}) as Record<string, unknown>;
    return { client: run.clientCompany.name, score: Number(summary.readinessScore || 0) };
  });

  return {
    metrics: {
      clients: totalClients,
      subscriptions: activeSubscriptions,
      trialAccounts,
      openTickets,
      slaBreaches: 0,
      pendingRequests,
      recentReportUploads
    },
    securityPosture: {
      averageScore: Math.round(posture._avg.score || 0),
      highRiskClients,
      complianceReadiness
    },
    securityEvents: { last24h: events24h, severityDistribution, topEventCategories },
    attackLab: { runs: attackRuns, mostTriggeredScenarios, readinessScores },
    systemHealth: {
      apiLatencyMs: 42,
      errorRate: 0,
      database: 'online',
      queue: 'ready',
      storageUsagePercent: 18
    },
    recentActivity
  };
}
