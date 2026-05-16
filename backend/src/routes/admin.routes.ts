import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { adminController } from '../controllers/admin.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { reportUpload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { params, requestSchemas, ticketSchemas } from '../utils/validation.js';

export const adminRoutes = Router();

adminRoutes.use(requireAuth, requireRole(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.STAFF, UserRole.ANALYST));
adminRoutes.get('/dashboard', adminController.dashboard);
adminRoutes.get('/clients', adminController.clients);
adminRoutes.get('/clients/:id', validate(params.id), adminController.clientDetail);
adminRoutes.get('/clients/:id/reports', validate(params.id), adminController.clientReports);
adminRoutes.post('/clients/:id/reports', validate(params.id), reportUpload.single('report'), adminController.uploadReport);
adminRoutes.get('/tickets', adminController.tickets);
adminRoutes.patch('/tickets/:id', validate(ticketSchemas.adminPatch), adminController.patchTicket);
adminRoutes.get('/requests', adminController.requests);
adminRoutes.patch('/requests/:id', validate(requestSchemas.adminPatch), adminController.patchRequest);
adminRoutes.get('/audit-logs', adminController.auditLogs);
