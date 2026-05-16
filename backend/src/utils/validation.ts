import { z } from 'zod';
import {
  ClearanceLevel,
  CustomerHealth,
  EmploymentStatus,
  MeetingType,
  PentestStatus,
  SecuritySeverity,
  ServiceRequestStatus,
  ServiceRequestType,
  ShiftType,
  StaffDepartment,
  StaffLevel,
  StaffScope,
  TicketPriority,
  TicketStatus,
  UserRole
} from '@prisma/client';

const strongPassword = z.string()
  .min(8)
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/[0-9]/, 'Password must include a number');

export const authSchemas = {
  register: z.object({
    body: z.object({
      name: z.string().min(2).max(120),
      email: z.string().email(),
      password: strongPassword,
      companyName: z.string().min(2).max(160),
      industry: z.string().min(2).max(80),
      size: z.string().min(1).max(80)
    })
  }),
  login: z.object({
    body: z.object({
      email: z.string().email(),
      password: z.string().min(1)
    })
  })
};

export const publicSchemas = {
  contact: z.object({
    body: z.object({
      name: z.string().min(2).max(120),
      email: z.string().email(),
      subject: z.string().min(2).max(160),
      message: z.string().min(10).max(3000),
      website: z.string().max(0).optional().default('')
    })
  })
};

export const ticketSchemas = {
  create: z.object({
    body: z.object({
      title: z.string().min(3).max(180),
      description: z.string().min(10).max(5000),
      priority: z.nativeEnum(TicketPriority).default(TicketPriority.MEDIUM)
    })
  }),
  clientPatch: z.object({
    params: z.object({ id: z.string().uuid() }),
    body: z.object({
      status: z.enum([TicketStatus.CLOSED]).optional(),
      comment: z.string().min(1).max(2000).optional()
    })
  }),
  adminPatch: z.object({
    params: z.object({ id: z.string().uuid() }),
    body: z.object({
      status: z.nativeEnum(TicketStatus).optional(),
      priority: z.nativeEnum(TicketPriority).optional(),
      internalNotes: z.string().max(4000).optional()
    })
  }),
  comment: z.object({
    params: z.object({ id: z.string().uuid() }),
    body: z.object({
      message: z.string().min(1).max(2000)
    })
  })
};

export const requestSchemas = {
  create: z.object({
    body: z.object({
      type: z.nativeEnum(ServiceRequestType),
      description: z.string().min(10).max(5000)
    })
  }),
  adminPatch: z.object({
    params: z.object({ id: z.string().uuid() }),
    body: z.object({
      status: z.nativeEnum(ServiceRequestStatus)
    })
  })
};

export const params = {
  id: z.object({
    params: z.object({ id: z.string().uuid() })
  })
};

const optionalUuid = z.preprocess(value => value === '' ? undefined : value, z.string().uuid().optional());
const csvText = z.union([z.string().max(2000), z.array(z.string().max(120))]).optional();

export const adminWorkflowSchemas = {
  staffAssignment: z.object({
    body: z.object({
      name: z.string().min(2).max(120),
      email: z.string().email(),
      scope: z.nativeEnum(StaffScope),
      role: z.nativeEnum(UserRole),
      clientCompanyId: optionalUuid,
      permissions: csvText,
      password: z.string().min(8).optional()
    })
  }),
  staffProfile: z.object({
    body: z.object({
      userId: z.string().uuid(),
      jobTitle: z.string().min(2).max(160),
      department: z.nativeEnum(StaffDepartment),
      level: z.nativeEnum(StaffLevel),
      clearanceLevel: z.nativeEnum(ClearanceLevel),
      employmentStatus: z.nativeEnum(EmploymentStatus),
      certifications: csvText,
      skills: csvText
    })
  }),
  shift: z.object({
    body: z.object({
      userId: z.string().uuid(),
      shiftType: z.nativeEnum(ShiftType),
      startsAt: z.coerce.date(),
      endsAt: z.coerce.date(),
      onCall: z.coerce.boolean().optional(),
      attendanceStatus: z.string().max(80).optional(),
      handoverNotes: z.string().max(2000).optional()
    }).refine(value => value.endsAt > value.startsAt, { message: 'Shift end time must be after start time', path: ['endsAt'] })
  }),
  meeting: z.object({
    body: z.object({
      clientCompanyId: optionalUuid,
      type: z.nativeEnum(MeetingType),
      title: z.string().min(2).max(180),
      startsAt: z.coerce.date(),
      endsAt: z.coerce.date(),
      attendees: csvText,
      provider: z.string().max(80).optional(),
      meetingUrl: z.string().url().optional().or(z.literal('')),
      notes: z.string().max(3000).optional()
    }).refine(value => value.endsAt > value.startsAt, { message: 'Meeting end time must be after start time', path: ['endsAt'] })
  }),
  csr: z.object({
    body: z.object({
      clientCompanyId: z.string().uuid(),
      health: z.nativeEnum(CustomerHealth),
      onboardingStage: z.string().min(2).max(120).optional(),
      slaStatus: z.string().min(2).max(80).optional(),
      notes: z.string().max(3000).optional(),
      feedbackScore: z.coerce.number().int().min(0).max(100).optional(),
      renewalDate: z.coerce.date().optional()
    })
  }),
  message: z.object({
    body: z.object({
      clientCompanyId: optionalUuid,
      subject: z.string().min(2).max(180),
      body: z.string().min(1).max(5000),
      channel: z.string().max(80).optional()
    })
  }),
  socIncident: z.object({
    body: z.object({
      clientCompanyId: optionalUuid,
      title: z.string().min(2).max(180),
      severity: z.nativeEnum(SecuritySeverity).optional(),
      status: z.string().max(80).optional(),
      assignedUserId: optionalUuid
    })
  }),
  pentest: z.object({
    body: z.object({
      clientCompanyId: z.string().uuid(),
      title: z.string().min(2).max(180),
      status: z.nativeEnum(PentestStatus).optional(),
      assets: csvText,
      scopeNotes: z.string().max(3000).optional(),
      assignedUserId: optionalUuid,
      deliveryDate: z.coerce.date().optional()
    })
  })
};

export const aiWorkflowSchemas = {
  threatModel: z.object({ body: z.object({ clientCompanyId: optionalUuid, architecture: z.unknown().optional(), openApiSpec: z.unknown().optional(), assets: z.array(z.unknown()).optional() }) }),
  attackSurface: z.object({ body: z.object({ clientCompanyId: optionalUuid, assets: z.array(z.unknown()).default([]) }) }),
  testCases: z.object({ body: z.object({ clientCompanyId: optionalUuid, threats: z.array(z.unknown()).optional(), attackSurface: z.unknown().optional() }) }),
  vulnAnalysis: z.object({ body: z.object({ clientCompanyId: optionalUuid }).passthrough() }),
  report: z.object({ body: z.object({ clientCompanyId: optionalUuid, findings: z.array(z.unknown()).optional(), evidence: z.array(z.unknown()).optional(), testCases: z.array(z.unknown()).optional() }) }),
  scanRun: z.object({ body: z.object({ clientCompanyId: optionalUuid, tool: z.enum(['ZAP', 'NMAP', 'SEMGREP', 'DEPENDENCY']), target: z.string().min(2).max(500) }) }),
  ciResult: z.object({ body: z.object({ clientCompanyId: optionalUuid, repository: z.string().min(2).max(240), branch: z.string().min(1).max(120).default('main'), commitSha: z.string().max(80).optional(), pipelineId: z.string().max(120).optional(), findings: z.array(z.unknown()).default([]) }) }),
  evidence: z.object({ body: z.object({ clientCompanyId: optionalUuid, title: z.string().min(2).max(180), type: z.enum(['SCREENSHOT', 'LOG', 'NOTE', 'REQUEST', 'RESPONSE', 'OTHER']).optional(), description: z.string().max(3000).optional(), tags: csvText, findingRef: z.string().max(120).optional() }) }),
  attackRun: z.object({ body: z.object({ clientCompanyId: z.string().min(1).max(120), scenarioId: z.string().min(1).max(120) }) })
};
