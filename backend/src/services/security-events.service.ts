import { SecuritySeverity } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { InternalServiceEvent } from '../types/service-boundaries.js';

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
