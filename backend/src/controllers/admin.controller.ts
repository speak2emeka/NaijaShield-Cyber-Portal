import { Request, Response } from 'express';
import path from 'path';
import { prisma } from '../config/prisma.js';
import { auditLog } from '../middleware/audit.js';
import { assertFound } from '../utils/http.js';
import { paged, pagination } from '../utils/pagination.js';
import { uploadReportObject } from '../services/storage.service.js';
import { adminDashboardSummary } from '../services/admin-dashboard.service.js';
import { searchSecurityEvents } from '../services/security-events.service.js';
import { attackLabService } from '../services/attack-lab.service.js';

export const adminController = {
  async dashboard(_req: Request, res: Response) {
    res.json(await adminDashboardSummary());
  },

  async clients(_req: Request, res: Response) {
    const req = _req;
    const page = pagination(req);
    const where = { deletedAt: null };
    const [items, total] = await Promise.all([prisma.clientCompany.findMany({
      where,
      include: {
        users: { select: { id: true, name: true, email: true, role: true } },
        subscription: true,
        securityScoreHistory: { orderBy: { calculatedAt: 'desc' }, take: 1 }
      },
      orderBy: { createdAt: 'desc' },
      skip: page.skip,
      take: page.take
    }), prisma.clientCompany.count({ where })]);
    res.json(paged(items, total, page.page, page.pageSize));
  },

  async clientDetail(req: Request, res: Response) {
    res.json(assertFound(await prisma.clientCompany.findUnique({
      where: { id: String(req.params.id) },
      include: {
        users: { select: { id: true, name: true, email: true, role: true } },
        reports: true,
        tickets: true,
        serviceRequests: true,
        subscription: true,
        securityScoreHistory: { orderBy: { calculatedAt: 'asc' } }
      }
    })));
  },

  async clientReports(req: Request, res: Response) {
    res.json(await prisma.report.findMany({ where: { clientCompanyId: String(req.params.id) }, orderBy: { createdAt: 'desc' } }));
  },

  async uploadReport(req: Request, res: Response) {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'PDF report file is required' });
    const object = await uploadReportObject(file, String(req.params.id));
    const report = await prisma.report.create({
      data: {
        clientCompanyId: String(req.params.id),
        title: req.body.title,
        description: req.body.description,
        filePath: path.join('/uploads/reports', file.filename).replaceAll('\\', '/'),
        storageKey: object.key,
        checksum: object.checksum,
        mimeType: object.mimeType,
        sizeBytes: object.sizeBytes
      }
    });
    await auditLog(req, 'report.upload', 'Report', report.id, { clientCompanyId: String(req.params.id) });
    res.status(201).json(report);
  },

  async tickets(req: Request, res: Response) {
    const page = pagination(req);
    const where = {
      deletedAt: null,
      status: req.query.status as never,
      priority: req.query.priority as never,
      clientCompanyId: req.query.clientCompanyId as string | undefined
    };
    const [items, total] = await Promise.all([prisma.ticket.findMany({
      where,
      include: { clientCompany: true, createdBy: { select: { id: true, name: true, email: true } } },
      orderBy: { updatedAt: 'desc' },
      skip: page.skip,
      take: page.take
    }), prisma.ticket.count({ where })]);
    res.json(paged(items, total, page.page, page.pageSize));
  },

  async legacyTickets(req: Request, res: Response) {
    res.json(await prisma.ticket.findMany({
      where: {
        status: req.query.status as never,
        priority: req.query.priority as never,
        clientCompanyId: req.query.clientCompanyId as string | undefined
      },
      include: { clientCompany: true, createdBy: { select: { id: true, name: true, email: true } } },
      orderBy: { updatedAt: 'desc' }
    }));
  },

  async patchTicket(req: Request, res: Response) {
    const updated = await prisma.ticket.update({ where: { id: String(req.params.id) }, data: req.body });
    await auditLog(req, 'ticket.admin_update', 'Ticket', updated.id, req.body);
    res.json(updated);
  },

  async requests(_req: Request, res: Response) {
    const req = _req;
    const page = pagination(req);
    const where = { deletedAt: null };
    const [items, total] = await Promise.all([
      prisma.serviceRequest.findMany({ where, include: { clientCompany: true }, orderBy: { updatedAt: 'desc' }, skip: page.skip, take: page.take }),
      prisma.serviceRequest.count({ where })
    ]);
    res.json(paged(items, total, page.page, page.pageSize));
  },

  async patchRequest(req: Request, res: Response) {
    const updated = await prisma.serviceRequest.update({ where: { id: String(req.params.id) }, data: { status: req.body.status } });
    await auditLog(req, 'service_request.admin_update', 'ServiceRequest', updated.id, { status: updated.status });
    res.json(updated);
  },

  async auditLogs(req: Request, res: Response) {
    const page = pagination(req);
    const where = {
      userId: req.query.userId as string | undefined,
      action: req.query.action as string | undefined,
      entityType: req.query.entityType as string | undefined,
      createdAt: req.query.from || req.query.to ? {
        gte: req.query.from ? new Date(String(req.query.from)) : undefined,
        lte: req.query.to ? new Date(String(req.query.to)) : undefined
      } : undefined
    };
    const [items, total] = await Promise.all([prisma.auditLog.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      skip: page.skip,
      take: page.take
    }), prisma.auditLog.count({ where })]);
    res.json(paged(items, total, page.page, page.pageSize));
  },

  async securityEvents(req: Request, res: Response) {
    const page = pagination(req);
    res.json(await searchSecurityEvents({
      clientCompanyId: req.query.clientCompanyId as string | undefined,
      type: req.query.type as string | undefined,
      severity: req.query.severity as never,
      source: req.query.source as string | undefined,
      search: req.query.search as string | undefined,
      from: req.query.from ? new Date(String(req.query.from)) : undefined,
      to: req.query.to ? new Date(String(req.query.to)) : undefined,
      ...page
    }));
  },

  async securityEventsCsv(req: Request, res: Response) {
    const data = await searchSecurityEvents({
      clientCompanyId: req.query.clientCompanyId as string | undefined,
      type: req.query.type as string | undefined,
      severity: req.query.severity as never,
      source: req.query.source as string | undefined,
      search: req.query.search as string | undefined,
      from: req.query.from ? new Date(String(req.query.from)) : undefined,
      to: req.query.to ? new Date(String(req.query.to)) : undefined,
      page: 1,
      pageSize: 1000,
      skip: 0,
      take: 1000
    });
    const rows = ['createdAt,client,type,severity,source,message,correlationId'];
    for (const event of data.items) rows.push([event.createdAt.toISOString(), event.clientCompany?.name || '', event.type, event.severity, event.source, JSON.stringify(event.message), event.correlationId || ''].join(','));
    res.setHeader('content-type', 'text/csv');
    res.setHeader('content-disposition', 'attachment; filename="security-events.csv"');
    res.send(rows.join('\n'));
  },

  async attackScenarios(_req: Request, res: Response) {
    res.json(await attackLabService.scenarios());
  },

  async createAttackScenario(req: Request, res: Response) {
    res.status(201).json(await attackLabService.createScenario(req.body));
  },

  async updateAttackScenario(req: Request, res: Response) {
    res.json(await attackLabService.updateScenario(String(req.params.id), req.body));
  },

  async deleteAttackScenario(req: Request, res: Response) {
    await attackLabService.deleteScenario(String(req.params.id));
    res.status(204).send();
  },

  async attackRuns(req: Request, res: Response) {
    res.json(await attackLabService.allRuns({ scenarioId: req.query.scenarioId as string | undefined, clientCompanyId: req.query.clientCompanyId as string | undefined }));
  },

  async startAttackRun(req: Request, res: Response) {
    res.status(201).json(await attackLabService.startRun(req.body.clientCompanyId, req.body.scenarioId));
  },

  async attackRunDetail(req: Request, res: Response) {
    res.json(await attackLabService.adminRunDetail(String(req.params.id)));
  },

  async attackAnalytics(_req: Request, res: Response) {
    res.json(await attackLabService.analytics());
  }
};
