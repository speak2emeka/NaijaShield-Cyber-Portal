import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { auditLog } from '../middleware/audit.js';
import { assertFound, HttpError } from '../utils/http.js';
import { paged, pagination } from '../utils/pagination.js';
import { searchSecurityEvents } from '../services/security-events.service.js';

function companyId(req: Request) {
  if (!req.user?.clientCompanyId) throw new HttpError(403, 'Client company required');
  return req.user.clientCompanyId;
}

export const clientController = {
  async dashboard(req: Request, res: Response) {
    const clientCompanyId = companyId(req);
    const [company, tickets, requests, reports, scores, subscription] = await Promise.all([
      prisma.clientCompany.findUnique({ where: { id: clientCompanyId } }),
      prisma.ticket.findMany({ where: { clientCompanyId }, orderBy: { updatedAt: 'desc' }, take: 5 }),
      prisma.serviceRequest.findMany({ where: { clientCompanyId }, orderBy: { updatedAt: 'desc' }, take: 5 }),
      prisma.report.findMany({ where: { clientCompanyId }, orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.securityScoreHistory.findMany({ where: { clientCompanyId }, orderBy: { calculatedAt: 'asc' } }),
      prisma.subscription.findUnique({ where: { clientCompanyId }, include: { planRef: true } })
    ]);

    const latestScore = scores.at(-1)?.score ?? 0;
    res.json({
      company,
      metrics: {
        securityScore: latestScore,
        openTickets: tickets.filter(ticket => ticket.status !== 'CLOSED').length,
        activeRequests: requests.filter(request => !['COMPLETED', 'CANCELLED'].includes(request.status)).length,
        reports: reports.length
      },
      tickets,
      requests,
      reports,
      scores,
      subscription
    });
  },

  async reports(req: Request, res: Response) {
    const page = pagination(req);
    const where = { clientCompanyId: companyId(req), deletedAt: null };
    const [items, total] = await Promise.all([
      prisma.report.findMany({ where, orderBy: { createdAt: 'desc' }, skip: page.skip, take: page.take }),
      prisma.report.count({ where })
    ]);
    res.json(paged(items, total, page.page, page.pageSize));
  },

  async reportDetail(req: Request, res: Response) {
    const report = assertFound(await prisma.report.findFirst({ where: { id: String(req.params.id), clientCompanyId: companyId(req) } }));
    res.json(report);
  },

  async tickets(req: Request, res: Response) {
    const page = pagination(req);
    const where = { clientCompanyId: companyId(req), deletedAt: null };
    const [items, total] = await Promise.all([
      prisma.ticket.findMany({ where, include: { comments: true }, orderBy: { updatedAt: 'desc' }, skip: page.skip, take: page.take }),
      prisma.ticket.count({ where })
    ]);
    res.json(paged(items, total, page.page, page.pageSize));
  },

  async createTicket(req: Request, res: Response) {
    const ticket = await prisma.ticket.create({
      data: {
        ...req.body,
        clientCompanyId: companyId(req),
        createdByUserId: req.user!.id
      }
    });
    await auditLog(req, 'ticket.create', 'Ticket', ticket.id, { title: ticket.title });
    res.status(201).json(ticket);
  },

  async patchTicket(req: Request, res: Response) {
    const ticket = assertFound(await prisma.ticket.findFirst({ where: { id: String(req.params.id), clientCompanyId: companyId(req) } }));
    const updated = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: req.body.status ?? ticket.status,
        comments: req.body.comment
          ? { create: { body: req.body.comment, userId: req.user!.id } }
          : undefined
      },
      include: { comments: true }
    });
    await auditLog(req, 'ticket.client_update', 'Ticket', updated.id, { status: updated.status });
    res.json(updated);
  },

  async addTicketComment(req: Request, res: Response) {
    const ticket = assertFound(await prisma.ticket.findFirst({ where: { id: String(req.params.id), clientCompanyId: companyId(req) } }));
    const comment = await prisma.ticketComment.create({
      data: {
        ticketId: ticket.id,
        userId: req.user!.id,
        body: req.body.message
      }
    });
    await auditLog(req, 'ticket.comment', 'Ticket', ticket.id, { commentId: comment.id });
    res.status(201).json(comment);
  },

  async requests(req: Request, res: Response) {
    const page = pagination(req);
    const where = { clientCompanyId: companyId(req), deletedAt: null };
    const [items, total] = await Promise.all([
      prisma.serviceRequest.findMany({ where, orderBy: { updatedAt: 'desc' }, skip: page.skip, take: page.take }),
      prisma.serviceRequest.count({ where })
    ]);
    res.json(paged(items, total, page.page, page.pageSize));
  },

  async createRequest(req: Request, res: Response) {
    const request = await prisma.serviceRequest.create({
      data: { ...req.body, clientCompanyId: companyId(req) }
    });
    await auditLog(req, 'service_request.create', 'ServiceRequest', request.id, { type: request.type });
    res.status(201).json(request);
  },

  async scoreHistory(req: Request, res: Response) {
    res.json(await prisma.securityScoreHistory.findMany({ where: { clientCompanyId: companyId(req) }, orderBy: { calculatedAt: 'asc' } }));
  },

  async plan(req: Request, res: Response) {
    const clientCompanyId = companyId(req);
    const [company, subscription] = await Promise.all([
      prisma.clientCompany.findUnique({ where: { id: clientCompanyId }, include: { productPlan: { include: { planFeatures: { include: { feature: true } } } } } }),
      prisma.subscription.findUnique({ where: { clientCompanyId }, include: { planRef: { include: { planFeatures: { include: { feature: true } } } } } })
    ]);
    const plan = company?.productPlan || subscription?.planRef || null;
    const featureFlags = (subscription?.featureFlags || {}) as Record<string, boolean>;
    const features = plan?.planFeatures.map(planFeature => ({
      id: planFeature.feature.id,
      code: planFeature.feature.code,
      name: planFeature.feature.name,
      description: planFeature.feature.description,
      included: planFeature.included || Boolean(featureFlags[planFeature.feature.code])
    })) || [];

    res.json({ plan, features });
  },

  async subscription(req: Request, res: Response) {
    res.json(await prisma.subscription.findUnique({ where: { clientCompanyId: companyId(req) }, include: { planRef: true, invoices: { orderBy: { createdAt: 'desc' } } } }));
  },

  async notifications(req: Request, res: Response) {
    res.json(await prisma.notification.findMany({
      where: {
        OR: [
          { userId: req.user!.id },
          { clientCompanyId: companyId(req) }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    }));
  },

  async auditLogs(req: Request, res: Response) {
    res.json(await prisma.auditLog.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    }));
  },

  async knowledgeBase(_req: Request, res: Response) {
    res.json(await prisma.knowledgeBaseArticle.findMany({ orderBy: [{ category: 'asc' }, { title: 'asc' }] }));
  },

  async company(req: Request, res: Response) {
    res.json(assertFound(await prisma.clientCompany.findUnique({
      where: { id: companyId(req) },
      include: { users: { select: { id: true, name: true, email: true, role: true, createdAt: true } }, subscription: true }
    })));
  },

  async securityEvents(req: Request, res: Response) {
    const page = pagination(req);
    res.json(await searchSecurityEvents({
      clientCompanyId: companyId(req),
      type: req.query.type as string | undefined,
      severity: req.query.severity as never,
      source: req.query.source as string | undefined,
      search: req.query.search as string | undefined,
      from: req.query.from ? new Date(String(req.query.from)) : undefined,
      to: req.query.to ? new Date(String(req.query.to)) : undefined,
      ...page
    }));
  }
};
