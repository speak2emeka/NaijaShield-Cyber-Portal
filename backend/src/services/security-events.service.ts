import { SecuritySeverity } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { InternalServiceEvent } from '../types/service-boundaries.js';
import { paged } from '../utils/pagination.js';

export async function recordSecurityEvent(event: InternalServiceEvent & { type: string; severity?: SecuritySeverity; message: string; source?: string }) {
  return prisma.securityEvent.create({
    data: {
      clientCompanyId: event.clientCompanyId || undefined,
      type: event.type,
      severity: event.severity || SecuritySeverity.LOW,
      source: event.source || event.module,
      message: event.message,
      metadata: event.metadata as never,
      correlationId: event.correlationId
    }
  });
}

export async function listSecurityEvents(filters: { clientCompanyId?: string; type?: string; severity?: SecuritySeverity; source?: string }) {
  return prisma.securityEvent.findMany({
    where: filters,
    orderBy: { createdAt: 'desc' },
    take: 100
  });
}

export async function searchSecurityEvents(filters: {
  clientCompanyId?: string;
  type?: string;
  severity?: SecuritySeverity;
  source?: string;
  search?: string;
  from?: Date;
  to?: Date;
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}) {
  const where = {
    clientCompanyId: filters.clientCompanyId,
    type: filters.type,
    severity: filters.severity,
    source: filters.source,
    message: filters.search ? { contains: filters.search, mode: 'insensitive' as const } : undefined,
    createdAt: filters.from || filters.to ? { gte: filters.from, lte: filters.to } : undefined
  };
  const [items, total, severityDistribution, topTypes] = await Promise.all([
    prisma.securityEvent.findMany({
      where,
      include: { clientCompany: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      skip: filters.skip,
      take: filters.take
    }),
    prisma.securityEvent.count({ where }),
    prisma.securityEvent.groupBy({ by: ['severity'], where, _count: { severity: true } }),
    prisma.securityEvent.groupBy({ by: ['type'], where, _count: { type: true }, orderBy: { _count: { type: 'desc' } }, take: 8 })
  ]);

  const correlations = items.reduce<Record<string, number>>((acc, event) => {
    const metadata = (event.metadata || {}) as Record<string, unknown>;
    for (const key of ['ipAddress', 'deviceFingerprint', 'sessionId']) {
      const value = metadata[key];
      if (typeof value === 'string' && value) acc[`${key}:${value}`] = (acc[`${key}:${value}`] || 0) + 1;
    }
    return acc;
  }, {});

  return { ...paged(items, total, filters.page, filters.pageSize), analytics: { severityDistribution, topTypes, correlations } };
}
