import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { billingController } from '../controllers/billing.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { adminWorkflowSchemas } from '../utils/validation.js';

export const billingRoutes = Router();

billingRoutes.post('/webhook', billingController.webhook);

billingRoutes.use(requireAuth);
billingRoutes.post('/checkout', requireRole(UserRole.CLIENT), billingController.checkout);
billingRoutes.get('/client/subscription', requireRole(UserRole.CLIENT), billingController.clientSubscription);
billingRoutes.get('/admin/subscriptions', requireRole(UserRole.ADMIN, UserRole.SUPERADMIN), billingController.adminSubscriptions);
billingRoutes.patch('/admin/subscriptions/:id/plan', requireRole(UserRole.ADMIN, UserRole.SUPERADMIN), billingController.changePlan);
billingRoutes.patch('/admin/subscriptions/:id/status', requireRole(UserRole.ADMIN, UserRole.SUPERADMIN), billingController.updateStatus);
billingRoutes.patch('/admin/clients/:clientCompanyId/product-plan', requireRole(UserRole.ADMIN, UserRole.SUPERADMIN), validate(adminWorkflowSchemas.productPlanSwitch), billingController.setTenantProductPlan);
billingRoutes.post('/admin/invoices/:id/retry', requireRole(UserRole.ADMIN, UserRole.SUPERADMIN), billingController.retryInvoice);
