import { prisma } from '../config/prisma.js';

export async function calculateSecurityPosture(clientCompanyId: string) {
  const [openTickets, reports, highEvents] = await Promise.all([
    prisma.ticket.count({ where: { clientCompanyId, status: { in: ['OPEN', 'IN_PROGRESS'] }, deletedAt: null } }),
    prisma.report.count({ where: { clientCompanyId, createdAt: { gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) }, deletedAt: null } }),
    prisma.securityEvent.count({ where: { clientCompanyId, severity: { in: ['HIGH', 'CRITICAL'] }, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } })
  ]);
  const incidents = Math.max(100 - highEvents * 12, 0);
  const response = Math.max(100 - openTickets * 8, 0);
  const coverage = reports > 0 ? 88 : 55;
  const score = Math.round((incidents + response + coverage) / 3);
  const breakdown = { incidents, response, coverage, openTickets, recentReports: reports };

  await prisma.securityScoreHistory.create({ data: { clientCompanyId, score, notes: 'Scheduled posture calculation stub.' } });
  return prisma.securityPostureSummary.upsert({
    where: { clientCompanyId },
    update: { score, breakdown, lastCalculatedAt: new Date() },
    create: { clientCompanyId, score, breakdown }
  });
}
