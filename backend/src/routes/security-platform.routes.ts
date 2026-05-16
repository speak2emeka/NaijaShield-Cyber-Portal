import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { securityPlatformController } from '../controllers/security-platform.controller.js';

export const securityPlatformRoutes = Router();

securityPlatformRoutes.use(requireAuth);

securityPlatformRoutes.get('/client/security-posture', requireRole(UserRole.CLIENT), securityPlatformController.posture);
securityPlatformRoutes.post('/client/security-posture/recalculate', requireRole(UserRole.CLIENT), securityPlatformController.recalculatePosture);
securityPlatformRoutes.get('/client/security-events', requireRole(UserRole.CLIENT), securityPlatformController.clientEvents);
securityPlatformRoutes.get('/client/assets', requireRole(UserRole.CLIENT), securityPlatformController.assets);
securityPlatformRoutes.get('/client/compliance', requireRole(UserRole.CLIENT), securityPlatformController.compliance);
securityPlatformRoutes.post('/client/compliance/:id/evidence', requireRole(UserRole.CLIENT), securityPlatformController.addEvidence);
securityPlatformRoutes.get('/client/tenant-key', requireRole(UserRole.CLIENT), securityPlatformController.tenantKey);
securityPlatformRoutes.get('/client/attack-lab/scenarios', requireRole(UserRole.CLIENT), securityPlatformController.scenarios);
securityPlatformRoutes.get('/client/attack-lab/runs', requireRole(UserRole.CLIENT), securityPlatformController.runs);
securityPlatformRoutes.post('/client/attack-lab/runs', requireRole(UserRole.CLIENT), securityPlatformController.startRun);
securityPlatformRoutes.get('/client/attack-lab/runs/:id', requireRole(UserRole.CLIENT), securityPlatformController.runDetail);
securityPlatformRoutes.get('/client/attack-lab/drill', requireRole(UserRole.CLIENT), securityPlatformController.drill);
securityPlatformRoutes.post('/client/attack-lab/drill/score', requireRole(UserRole.CLIENT), securityPlatformController.scoreDrill);

securityPlatformRoutes.get('/admin/security-events', requireRole(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.ANALYST, UserRole.AUDITOR), securityPlatformController.adminEvents);
securityPlatformRoutes.get('/admin/attack-lab/overview', requireRole(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.ANALYST), securityPlatformController.adminAttackOverview);
securityPlatformRoutes.post('/admin/clients/:clientCompanyId/rotate-key', requireRole(UserRole.ADMIN, UserRole.SUPERADMIN), securityPlatformController.rotateTenantKey);
securityPlatformRoutes.post('/admin/session-risk/evaluate', requireRole(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.ANALYST), securityPlatformController.sessionRisk);
