import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { clientController } from '../controllers/client.controller.js';
import { aiSecurityController } from '../controllers/ai-security.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { params, requestSchemas, ticketSchemas } from '../utils/validation.js';

export const clientRoutes = Router();

clientRoutes.use(requireAuth, requireRole(UserRole.CLIENT));
clientRoutes.get('/dashboard', clientController.dashboard);
clientRoutes.get('/reports', clientController.reports);
clientRoutes.get('/reports/:id', validate(params.id), clientController.reportDetail);
clientRoutes.get('/tickets', clientController.tickets);
clientRoutes.post('/tickets', validate(ticketSchemas.create), clientController.createTicket);
clientRoutes.patch('/tickets/:id', validate(ticketSchemas.clientPatch), clientController.patchTicket);
clientRoutes.post('/tickets/:id/comment', validate(ticketSchemas.comment), clientController.addTicketComment);
clientRoutes.get('/requests', clientController.requests);
clientRoutes.post('/requests', validate(requestSchemas.create), clientController.createRequest);
clientRoutes.get('/security-score/history', clientController.scoreHistory);
clientRoutes.get('/subscription', clientController.subscription);
clientRoutes.get('/notifications', clientController.notifications);
clientRoutes.get('/audit-logs', clientController.auditLogs);
clientRoutes.get('/knowledge-base', clientController.knowledgeBase);
clientRoutes.get('/company', clientController.company);
clientRoutes.get('/security-events', clientController.securityEvents);
clientRoutes.get('/staff-assignments', aiSecurityController.clientStaff);
clientRoutes.post('/staff-assignments', aiSecurityController.assignClientStaff);
