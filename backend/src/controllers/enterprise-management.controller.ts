import { Request, Response } from 'express';
import { enterpriseManagementService } from '../services/enterprise-management.service.js';

export const enterpriseManagementController = {
  async overview(_req: Request, res: Response) {
    res.json(await enterpriseManagementService.overview());
  },
  async staffDirectory(_req: Request, res: Response) {
    res.json(await enterpriseManagementService.staffDirectory());
  },
  async upsertStaffProfile(req: Request, res: Response) {
    res.status(201).json(await enterpriseManagementService.upsertStaffProfile(req.body));
  },
  async shifts(_req: Request, res: Response) {
    res.json(await enterpriseManagementService.shifts());
  },
  async createShift(req: Request, res: Response) {
    res.status(201).json(await enterpriseManagementService.createShift(req.body));
  },
  async meetings(req: Request, res: Response) {
    res.json(await enterpriseManagementService.meetings(req.query.clientCompanyId as string | undefined));
  },
  async createMeeting(req: Request, res: Response) {
    res.status(201).json(await enterpriseManagementService.createMeeting(req.body, req.user?.id));
  },
  async csr(_req: Request, res: Response) {
    res.json(await enterpriseManagementService.csrRecords());
  },
  async csrDashboard(_req: Request, res: Response) {
    res.json(await enterpriseManagementService.csrDashboard());
  },
  async csrHealth(req: Request, res: Response) {
    res.json(await enterpriseManagementService.csrHealth(req.query.clientCompanyId as string | undefined));
  },
  async csrSlaMetrics(_req: Request, res: Response) {
    res.json(await enterpriseManagementService.csrSlaMetrics());
  },
  async csrRenewals(_req: Request, res: Response) {
    res.json(await enterpriseManagementService.csrRenewals());
  },
  async crmContacts(req: Request, res: Response) {
    res.json(await enterpriseManagementService.crmContacts(req.query.clientCompanyId as string | undefined));
  },
  async createCrmContact(req: Request, res: Response) {
    res.status(201).json(await enterpriseManagementService.createCrmContact(req.body));
  },
  async crmTasks(req: Request, res: Response) {
    res.json(await enterpriseManagementService.crmTasks(req.query.clientCompanyId as string | undefined));
  },
  async createCrmTask(req: Request, res: Response) {
    res.status(201).json(await enterpriseManagementService.createCrmTask(req.body));
  },
  async crmLifecycle(req: Request, res: Response) {
    res.json(await enterpriseManagementService.crmLifecycle(req.query.clientCompanyId as string | undefined));
  },
  async createCrmLifecycle(req: Request, res: Response) {
    res.status(201).json(await enterpriseManagementService.createCrmLifecycle(req.body));
  },
  async createRenewalOpportunity(req: Request, res: Response) {
    res.status(201).json(await enterpriseManagementService.createRenewalOpportunity(req.body));
  },
  async crmTimeline(req: Request, res: Response) {
    res.json(await enterpriseManagementService.crmTimeline(req.query.clientCompanyId as string | undefined));
  },
  async upsertCsr(req: Request, res: Response) {
    res.status(201).json(await enterpriseManagementService.upsertCsr(req.body));
  },
  async messages(req: Request, res: Response) {
    res.json(await enterpriseManagementService.messages(req.query.clientCompanyId as string | undefined));
  },
  async createMessage(req: Request, res: Response) {
    res.status(201).json(await enterpriseManagementService.createMessage(req.body, req.user?.id));
  },
  async socIncidents(_req: Request, res: Response) {
    res.json(await enterpriseManagementService.socIncidents());
  },
  async createSocIncident(req: Request, res: Response) {
    res.status(201).json(await enterpriseManagementService.createSocIncident(req.body));
  },
  async pentests(_req: Request, res: Response) {
    res.json(await enterpriseManagementService.pentestProjects());
  },
  async createPentest(req: Request, res: Response) {
    res.status(201).json(await enterpriseManagementService.createPentest(req.body));
  },
  async clientMessages(req: Request, res: Response) {
    res.json(await enterpriseManagementService.messages(req.user!.clientCompanyId || undefined));
  },
  async createClientMessage(req: Request, res: Response) {
    res.status(201).json(await enterpriseManagementService.createMessage(req.body, req.user?.id, req.user!.clientCompanyId || undefined));
  },
  async clientMeetings(req: Request, res: Response) {
    res.json(await enterpriseManagementService.meetings(req.user!.clientCompanyId || undefined));
  },
  async createClientMeeting(req: Request, res: Response) {
    res.status(201).json(await enterpriseManagementService.createMeeting({ ...req.body, clientCompanyId: req.user!.clientCompanyId }, req.user?.id));
  }
};
