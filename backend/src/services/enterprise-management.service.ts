import {
  ClearanceLevel,
  CustomerHealth,
  EmploymentStatus,
  MeetingType,
  PentestStatus,
  SecuritySeverity,
  ShiftType,
  SocIncidentStatus,
  StaffDepartment,
  StaffLevel
} from '@prisma/client';
import { prisma } from '../config/prisma.js';

function csv(value: unknown) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split(',').map(item => item.trim()).filter(Boolean);
  return [];
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
    return prisma.staffShift.create({
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
  },

  shifts() {
    return prisma.staffShift.findMany({ include: { user: { select: { id: true, name: true, email: true, role: true } } }, orderBy: { startsAt: 'desc' }, take: 100 });
  },

  createMeeting(input: any, organizerUserId?: string) {
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
