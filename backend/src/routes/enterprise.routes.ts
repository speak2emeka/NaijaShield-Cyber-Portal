import { Router } from 'express';
import { enterpriseController } from '../controllers/enterprise.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { authRateLimit } from '../middleware/security.js';

export const enterpriseRoutes = Router();

enterpriseRoutes.post('/auth/request-email-verification', authRateLimit, enterpriseController.requestEmailVerification);
enterpriseRoutes.post('/auth/verify-email', authRateLimit, enterpriseController.verifyEmail);
enterpriseRoutes.post('/auth/request-password-reset', authRateLimit, enterpriseController.requestPasswordReset);
enterpriseRoutes.post('/auth/reset-password', authRateLimit, enterpriseController.resetPassword);
enterpriseRoutes.get('/sso/config', enterpriseController.ssoConfig);

enterpriseRoutes.use(requireAuth);
enterpriseRoutes.post('/mfa/totp/setup', enterpriseController.setupMfa);
enterpriseRoutes.post('/mfa/totp/verify', enterpriseController.verifyMfa);
enterpriseRoutes.get('/sessions', enterpriseController.sessions);
enterpriseRoutes.get('/permissions', enterpriseController.permissions);
enterpriseRoutes.get('/billing/plans', enterpriseController.plans);
enterpriseRoutes.post('/billing/checkout', enterpriseController.checkout);
enterpriseRoutes.get('/billing/invoices', enterpriseController.invoices);
enterpriseRoutes.get('/reports/:id/signed-url', enterpriseController.signedReport);
enterpriseRoutes.get('/audit-logs/export.csv', enterpriseController.auditCsv);
