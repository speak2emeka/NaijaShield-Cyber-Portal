import { z } from 'zod';
import { ServiceRequestStatus, ServiceRequestType, TicketPriority, TicketStatus } from '@prisma/client';

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
