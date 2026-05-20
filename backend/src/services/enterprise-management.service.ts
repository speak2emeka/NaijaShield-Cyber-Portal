import {
  ClearanceLevel,
  CrmLifecycleStage,
  CrmTaskPriority,
  CrmTaskStatus,
  CustomerHealth,
  EmploymentStatus,
  MeetingType,
  PentestStatus,
  RenewalStage,
  SecuritySeverity,
  ShiftType,
  SocIncidentStatus,
  StaffDepartment,
  StaffLevel
} from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/http.js';

function csv(value: unknown) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split(',').map(item => item.trim()).filter(Boolean);
  return [];
}

function healthScore(record: { health: CustomerHealth; slaStatus: string; feedbackScore: number | null; clientCompany?: { securityPosture?: { score: number } | null; subscription?: { status: string } | null; complianceStatuses?: Array<{ score: number }> } }) {
  const healthBase = record.health === CustomerHealth.GREEN ? 90 : record.health === CustomerHealth.AMBER ? 68 : 42;
  const posture = record.clientCompany?.securityPosture?.score ?? healthBase;
  const feedback = record.feedbackScore ? Math.min(100, Math.max(0, record.feedbackScore * 10)) : 75;
  const slaPenalty = record.slaStatus === 'ON_TRACK' ? 0 : record.slaStatus === 'AT_RISK' ? 10 : 22;
  const subscriptionPenalty = record.clientCompany?.subscription?.status === 'PAST_DUE' ? 18 : record.clientCompany?.subscription?.status === 'CANCELLED' ? 35 : 0;
  const compliancePenalty = (record.clientCompany?.complianceStatuses || []).filter(item => item.score < 70).length * 5;
  return Math.max(0, Math.min(100, Math.round((healthBase * 0.35) + (posture * 0.4) + (feedback * 0.25) - slaPenalty - subscriptionPenalty - compliancePenalty)));
}

function recommendedCsrActions(record: { onboardingStage: string; slaStatus: string; renewalDate: Date | null; feedbackScore: number | null }, score: number) {
  const actions = [];
  if (score < 75) actions.push('Schedule executive health review');
  if (record.slaStatus !== 'ON_TRACK') actions.push('Review SLA breach queue and assign owner');
  if (record.feedbackScore !== null && record.feedbackScore < 7) actions.push('Open CSAT recovery plan');
  if (record.renewalDate && record.renewalDate.getTime() - Date.now() < 90 * 24 * 60 * 60 * 1000) actions.push('Prepare renewal risk and value realization brief');
  if (!record.onboardingStage || record.onboardingStage === 'DISCOVERY') actions.push('Complete onboarding implementation checklist');
  return actions.length ? actions : ['Maintain QBR cadence and monitor operational signals'];
}

export const enterpriseManagementService = {
  async overview() {
    const [staff, shifts, csr, soc, pentests, meetings] = await Promise.all([
      prisma.staffProfile.count({ where: { employmentStatus: EmploymentStatus.ACTIVE } }),
      prisma.staffShift.count({ where: { startsAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
      prisma.customerSuccessRecord.groupBy({ by: ['health'], _count: { health: true } }),
      prisma.socIncident.groupBy({ by: ['status'], _count: { status: true } }),
      prisma.pentestProject.groupBy({ by: ['status'], _count: { status: true } }),
      prisma.staffMeeting.count({ where: { startsAt: { gte: new Date() } } })
    ]);
    return { staff, shifts, csr, soc, pentests, meetings };
  },

  staffDirectory() {
    return prisma.user.findMany({
      where: { role: { not: 'CLIENT' }, deletedAt: null },
      select: { id: true, name: true, email: true, role: true, staffProfile: true, staffAssignments: true },
      orderBy: { name: 'asc' }
    });
  },

  upsertStaffProfile(input: any) {
    return prisma.staffProfile.upsert({
      where: { userId: input.userId },
      update: {
        jobTitle: input.jobTitle,
        department: input.department as StaffDepartment,
        level: input.level as StaffLevel,
        clearanceLevel: input.clearanceLevel as ClearanceLevel,
        employmentStatus: input.employmentStatus as EmploymentStatus,
        certifications: csv(input.certifications),
        skills: csv(input.skills),
        kpis: input.kpis || { ticketHandling: 0, responseTime: 0, satisfaction: 0 }
      },
      create: {
        userId: input.userId,
        jobTitle: input.jobTitle,
        department: input.department as StaffDepartment,
        level: input.level as StaffLevel,
        clearanceLevel: input.clearanceLevel as ClearanceLevel,
        employmentStatus: input.employmentStatus as EmploymentStatus,
        certifications: csv(input.certifications),
        skills: csv(input.skills),
        kpis: input.kpis || { ticketHandling: 0, responseTime: 0, satisfaction: 0 }
      }
    });
  },

  createShift(input: any) {
    return prisma.$transaction(async tx => {
      const overlap = await tx.staffShift.findFirst({
        where: {
          userId: input.userId,
          startsAt: { lt: new Date(input.endsAt) },
          endsAt: { gt: new Date(input.startsAt) }
        }
      });
      if (overlap) throw new HttpError(409, 'Shift overlaps an existing assignment for this staff member');
      return tx.staffShift.create({
        data: {
          userId: input.userId,
          shiftType: input.shiftType as ShiftType,
          startsAt: new Date(input.startsAt),
          endsAt: new Date(input.endsAt),
          onCall: Boolean(input.onCall),
          attendanceStatus: input.attendanceStatus,
          handoverNotes: input.handoverNotes
        }
      });
    });
  },

  shifts() {
    return prisma.staffShift.findMany({ include: { user: { select: { id: true, name: true, email: true, role: true } } }, orderBy: { startsAt: 'desc' }, take: 100 });
  },

  async createMeeting(input: any, organizerUserId?: string) {
    if (input.clientCompanyId) await prisma.clientCompany.findUniqueOrThrow({ where: { id: input.clientCompanyId } });
    return prisma.staffMeeting.create({
      data: {
        clientCompanyId: input.clientCompanyId || undefined,
        organizerUserId,
        type: input.type as MeetingType,
        title: input.title,
        startsAt: new Date(input.startsAt),
        endsAt: new Date(input.endsAt),
        attendees: csv(input.attendees) as never,
        provider: input.provider || 'manual',
        meetingUrl: input.meetingUrl,
        notes: input.notes
      }
    });
  },

  meetings(clientCompanyId?: string) {
    return prisma.staffMeeting.findMany({ where: { clientCompanyId }, include: { clientCompany: true, organizer: { select: { name: true, email: true } } }, orderBy: { startsAt: 'desc' }, take: 100 });
  },

  csrRecords() {
    return prisma.customerSuccessRecord.findMany({ include: { clientCompany: { include: { subscription: true, securityPosture: true } } }, orderBy: { updatedAt: 'desc' } });
  },

  async csrDashboard() {
    const now = new Date();
    const renewalWindow = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    const [records, openTickets, escalations, upcomingMeetings, renewalRisks, recentMessages, openTasks] = await Promise.all([
      prisma.customerSuccessRecord.findMany({ include: { clientCompany: { include: { subscription: true, securityPosture: true, complianceStatuses: true } } }, orderBy: { updatedAt: 'desc' } }),
      prisma.ticket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] }, deletedAt: null } }),
      prisma.ticket.count({ where: { priority: { in: ['HIGH', 'CRITICAL'] }, status: { in: ['OPEN', 'IN_PROGRESS'] }, deletedAt: null } }),
      prisma.staffMeeting.count({ where: { startsAt: { gte: now } } }),
      prisma.subscription.count({ where: { renewalDate: { gte: now, lte: renewalWindow }, status: { in: ['TRIAL', 'ACTIVE', 'PAST_DUE'] } } }),
      prisma.clientMessage.findMany({ include: { clientCompany: true, sender: { select: { name: true, email: true } } }, orderBy: { createdAt: 'desc' }, take: 8 }),
      prisma.crmTask.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS', 'BLOCKED'] } } })
    ]);
    const scored = records.map(record => {
      const score = healthScore(record);
      return {
        ...record,
        healthScore: score,
        riskLevel: score < 55 ? 'HIGH' : score < 75 ? 'MEDIUM' : 'LOW',
        recommendedActions: recommendedCsrActions(record, score)
      };
    });
    const averageHealth = scored.length ? Math.round(scored.reduce((sum, item) => sum + item.healthScore, 0) / scored.length) : 0;
    return {
      metrics: {
        averageHealth,
        openTickets,
        escalations,
        slaBreaches: records.filter(item => item.slaStatus !== 'ON_TRACK').length,
        upcomingMeetings,
        renewalRisks,
        satisfactionScore: scored.length ? Math.round(scored.reduce((sum, item) => sum + Number(item.feedbackScore || 0), 0) / scored.length) : 0,
        openTasks
      },
      clients: scored,
      recentMessages,
      assistant: {
        summary: `${scored.length} client relationship(s) monitored. ${renewalRisks} renewal(s) need attention in the next 90 days.`,
        nextActions: scored.flatMap(item => item.recommendedActions.slice(0, 2)).slice(0, 6),
        qbrPreparation: scored.slice(0, 5).map(item => ({ client: item.clientCompany.name, agenda: ['Security posture trend', 'Open operational risks', 'Compliance evidence gaps', 'Renewal and expansion plan'] }))
      }
    };
  },

  async csrHealth(clientCompanyId?: string) {
    const records = await prisma.customerSuccessRecord.findMany({
      where: { clientCompanyId },
      include: { clientCompany: { include: { tickets: true, serviceRequests: true, securityPosture: true, complianceStatuses: true, subscription: true, assets: true, pentestProjects: true, socIncidents: true } } },
      orderBy: { updatedAt: 'desc' }
    });
    return records.map(record => {
      const company = record.clientCompany;
      const score = healthScore(record);
      const criticalIncidents = company.socIncidents.filter(item => ['HIGH', 'CRITICAL'].includes(item.severity)).length;
      const complianceGaps = company.complianceStatuses.filter(item => item.score < 75).length;
      const attackSurfaceRisk = company.assets.filter(item => ['HIGH', 'CRITICAL'].includes(item.riskLevel)).length;
      return {
        clientCompanyId: company.id,
        client: company.name,
        healthScore: score,
        riskLevel: score < 55 ? 'HIGH' : score < 75 ? 'MEDIUM' : 'LOW',
        drivers: {
          ticketVolume: company.tickets.filter(item => ['OPEN', 'IN_PROGRESS'].includes(item.status)).length,
          criticalIncidents,
          complianceGaps,
          attackSurfaceRisk,
          subscriptionStatus: company.subscription?.status || 'NONE',
          postureScore: company.securityPosture?.score || 0
        },
        recommendedActions: recommendedCsrActions(record, score)
      };
    });
  },

  async csrSlaMetrics() {
    const tickets = await prisma.ticket.findMany({ where: { deletedAt: null }, include: { clientCompany: true }, orderBy: { updatedAt: 'desc' }, take: 200 });
    return tickets.map(ticket => {
      const ageHours = Math.round((Date.now() - ticket.createdAt.getTime()) / 360_000) / 10;
      const targetHours = ticket.priority === 'CRITICAL' ? 4 : ticket.priority === 'HIGH' ? 8 : ticket.priority === 'MEDIUM' ? 24 : 72;
      return {
        id: ticket.id,
        client: ticket.clientCompany.name,
        title: ticket.title,
        priority: ticket.priority,
        status: ticket.status,
        ageHours,
        targetHours,
        breached: ['OPEN', 'IN_PROGRESS'].includes(ticket.status) && ageHours > targetHours
      };
    });
  },

  async csrRenewals() {
    return prisma.renewalOpportunity.findMany({
      include: { clientCompany: { include: { customerSuccess: true, securityPosture: true, subscription: true } } },
      orderBy: { renewalDate: 'asc' },
      take: 100
    });
  },

  crmContacts(clientCompanyId?: string) {
    return prisma.crmContact.findMany({ where: { clientCompanyId }, include: { clientCompany: { select: { id: true, name: true } } }, orderBy: [{ primary: 'desc' }, { updatedAt: 'desc' }], take: 100 });
  },

  async createCrmContact(input: any) {
    if (input.primary) await prisma.crmContact.updateMany({ where: { clientCompanyId: input.clientCompanyId }, data: { primary: false } });
    return prisma.crmContact.create({
      data: {
        clientCompanyId: input.clientCompanyId,
        name: input.name,
        email: input.email.toLowerCase(),
        phone: input.phone,
        title: input.title,
        role: input.role || 'STAKEHOLDER',
        primary: Boolean(input.primary),
        notes: input.notes
      },
      include: { clientCompany: { select: { id: true, name: true } } }
    });
  },

  crmTasks(clientCompanyId?: string) {
    return prisma.crmTask.findMany({ where: { clientCompanyId }, include: { clientCompany: { select: { id: true, name: true } }, assignedUser: { select: { id: true, name: true, email: true } } }, orderBy: [{ status: 'asc' }, { dueDate: 'asc' }], take: 100 });
  },

  createCrmTask(input: any) {
    return prisma.crmTask.create({
      data: {
        clientCompanyId: input.clientCompanyId,
        title: input.title,
        description: input.description,
        status: (input.status || CrmTaskStatus.OPEN) as CrmTaskStatus,
        priority: (input.priority || CrmTaskPriority.MEDIUM) as CrmTaskPriority,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        assignedUserId: input.assignedUserId || undefined,
        source: input.source || 'MANUAL'
      },
      include: { clientCompany: { select: { id: true, name: true } }, assignedUser: { select: { id: true, name: true, email: true } } }
    });
  },

  crmLifecycle(clientCompanyId?: string) {
    return prisma.crmLifecycleEvent.findMany({ where: { clientCompanyId }, include: { clientCompany: { select: { id: true, name: true } } }, orderBy: { occurredAt: 'desc' }, take: 100 });
  },

  createCrmLifecycle(input: any) {
    return prisma.crmLifecycleEvent.create({
      data: {
        clientCompanyId: input.clientCompanyId,
        stage: input.stage as CrmLifecycleStage,
        summary: input.summary,
        owner: input.owner,
        occurredAt: input.occurredAt ? new Date(input.occurredAt) : new Date()
      },
      include: { clientCompany: { select: { id: true, name: true } } }
    });
  },

  createRenewalOpportunity(input: any) {
    return prisma.renewalOpportunity.create({
      data: {
        clientCompanyId: input.clientCompanyId,
        stage: (input.stage || RenewalStage.DISCOVERY) as RenewalStage,
        contractValue: Number(input.contractValue || 0),
        probability: Number(input.probability ?? 50),
        renewalDate: input.renewalDate ? new Date(input.renewalDate) : undefined,
        churnRisk: input.churnRisk || 'MEDIUM',
        upsellNotes: input.upsellNotes,
        nextStep: input.nextStep
      },
      include: { clientCompany: { include: { customerSuccess: true, securityPosture: true, subscription: true } } }
    });
  },

  async crmTimeline(clientCompanyId?: string) {
    const [messages, meetings, tasks, lifecycle, tickets, incidents] = await Promise.all([
      prisma.clientMessage.findMany({ where: { clientCompanyId }, include: { clientCompany: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' }, take: 40 }),
      prisma.staffMeeting.findMany({ where: { clientCompanyId }, include: { clientCompany: { select: { id: true, name: true } } }, orderBy: { startsAt: 'desc' }, take: 40 }),
      prisma.crmTask.findMany({ where: { clientCompanyId }, include: { clientCompany: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' }, take: 40 }),
      prisma.crmLifecycleEvent.findMany({ where: { clientCompanyId }, include: { clientCompany: { select: { id: true, name: true } } }, orderBy: { occurredAt: 'desc' }, take: 40 }),
      prisma.ticket.findMany({ where: { clientCompanyId, deletedAt: null }, include: { clientCompany: { select: { id: true, name: true } } }, orderBy: { updatedAt: 'desc' }, take: 40 }),
      prisma.socIncident.findMany({ where: { clientCompanyId }, include: { clientCompany: { select: { id: true, name: true } } }, orderBy: { updatedAt: 'desc' }, take: 40 })
    ]);
    return [
      ...messages.map(item => ({ id: item.id, type: 'Communication', client: item.clientCompany.name, title: item.subject, detail: item.channel, at: item.createdAt })),
      ...meetings.map(item => ({ id: item.id, type: 'Meeting', client: item.clientCompany?.name || 'Internal', title: item.title, detail: item.type, at: item.startsAt })),
      ...tasks.map(item => ({ id: item.id, type: 'CRM Task', client: item.clientCompany.name, title: item.title, detail: `${item.priority} / ${item.status}`, at: item.createdAt })),
      ...lifecycle.map(item => ({ id: item.id, type: 'Lifecycle', client: item.clientCompany.name, title: item.summary, detail: item.stage, at: item.occurredAt })),
      ...tickets.map(item => ({ id: item.id, type: 'Ticket', client: item.clientCompany.name, title: item.title, detail: `${item.priority} / ${item.status}`, at: item.updatedAt })),
      ...incidents.map(item => ({ id: item.id, type: 'SOC Incident', client: item.clientCompany?.name || 'Unscoped', title: item.title, detail: `${item.severity} / ${item.status}`, at: item.updatedAt }))
    ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 100);
  },

  upsertCsr(input: any) {
    return prisma.customerSuccessRecord.upsert({
      where: { clientCompanyId: input.clientCompanyId },
      update: { health: input.health as CustomerHealth, onboardingStage: input.onboardingStage, slaStatus: input.slaStatus, notes: input.notes, feedbackScore: Number(input.feedbackScore || 0), renewalDate: input.renewalDate ? new Date(input.renewalDate) : undefined },
      create: { clientCompanyId: input.clientCompanyId, health: input.health as CustomerHealth, onboardingStage: input.onboardingStage || 'DISCOVERY', slaStatus: input.slaStatus || 'ON_TRACK', notes: input.notes, feedbackScore: Number(input.feedbackScore || 0), renewalDate: input.renewalDate ? new Date(input.renewalDate) : undefined }
    });
  },

  messages(clientCompanyId?: string) {
    return prisma.clientMessage.findMany({ where: { clientCompanyId }, include: { sender: { select: { name: true, email: true } }, clientCompany: true }, orderBy: { createdAt: 'desc' }, take: 100 });
  },

  createMessage(input: any, senderUserId?: string, forcedClientCompanyId?: string) {
    return prisma.clientMessage.create({ data: { clientCompanyId: forcedClientCompanyId || input.clientCompanyId, senderUserId, subject: input.subject, body: input.body, channel: input.channel || 'PORTAL' } });
  },

  socIncidents() {
    return prisma.socIncident.findMany({ include: { clientCompany: true, assignedUser: { select: { name: true, email: true } } }, orderBy: { updatedAt: 'desc' }, take: 100 });
  },

  createSocIncident(input: any) {
    return prisma.socIncident.create({
      data: {
        clientCompanyId: input.clientCompanyId || undefined,
        title: input.title,
        severity: (input.severity || SecuritySeverity.MEDIUM) as SecuritySeverity,
        status: (input.status || SocIncidentStatus.MONITORING) as SocIncidentStatus,
        assignedUserId: input.assignedUserId || undefined,
        timeline: input.timeline || [{ phase: 'Monitoring', note: 'Incident created from SOC operations workspace.', at: new Date().toISOString() }],
        playbook: input.playbook || { steps: ['monitor', 'triage', 'investigate', 'respond', 'report', 'lessons learned'] }
      }
    });
  },

  pentestProjects() {
    return prisma.pentestProject.findMany({ include: { clientCompany: true, assignedUser: { select: { name: true, email: true } } }, orderBy: { updatedAt: 'desc' }, take: 100 });
  },

  createPentest(input: any) {
    return prisma.pentestProject.create({
      data: {
        clientCompanyId: input.clientCompanyId,
        title: input.title,
        status: (input.status || PentestStatus.SCOPING) as PentestStatus,
        scope: { assets: csv(input.assets), notes: input.scopeNotes || 'Authorized testing scope only.' },
        testPlan: { phases: ['scoping', 'planning', 'testing', 'reporting', 'delivery'] },
        findings: [],
        assignedUserId: input.assignedUserId || undefined,
        deliveryDate: input.deliveryDate ? new Date(input.deliveryDate) : undefined
      }
    });
  }
};
