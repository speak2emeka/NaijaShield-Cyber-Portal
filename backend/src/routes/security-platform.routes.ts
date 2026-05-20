import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { requireFeature } from '../middleware/featureGate.js';
import { requireClientTier, requireTier } from '../middleware/tierGate.js';
import { requirePermission } from '../middleware/permissions.js';
import { securityPlatformController } from '../controllers/security-platform.controller.js';
import { integrationsController } from '../controllers/integrations.controller.js';
import { validate } from '../middleware/validate.js';
import { integrationSchemas } from '../utils/validation.js';

export const securityPlatformRoutes = Router();

securityPlatformRoutes.use(requireAuth);

securityPlatformRoutes.get('/client/security-posture', requireRole(UserRole.CLIENT), requireFeature('SECURITY_POSTURE'), securityPlatformController.posture);
securityPlatformRoutes.post('/client/security-posture/recalculate', requireRole(UserRole.CLIENT), requireFeature('SECURITY_POSTURE'), securityPlatformController.recalculatePosture);
securityPlatformRoutes.get('/client/security-events', requireRole(UserRole.CLIENT), requireTier(['shield-ops', 'shield-enterprise']), requireFeature('SECURITY_EVENTS'), securityPlatformController.clientEvents);
securityPlatformRoutes.get('/client/assets', requireRole(UserRole.CLIENT), requireTier(['shield-ops', 'shield-enterprise']), requireFeature('EXTERNAL_SECURITY'), securityPlatformController.assets);
securityPlatformRoutes.get('/client/compliance', requireRole(UserRole.CLIENT), requireTier(['shield-enterprise']), requireFeature('COMPLIANCE_MANAGEMENT'), securityPlatformController.compliance);
securityPlatformRoutes.post('/client/compliance/:id/evidence', requireRole(UserRole.CLIENT), requireTier(['shield-enterprise']), requireFeature('COMPLIANCE_MANAGEMENT'), securityPlatformController.addEvidence);
securityPlatformRoutes.get('/client/tenant-key', requireRole(UserRole.CLIENT), securityPlatformController.tenantKey);
securityPlatformRoutes.get('/client/attack-lab/scenarios', requireRole(UserRole.CLIENT), requireTier(['shield-ops', 'shield-enterprise']), requireFeature('ATTACK_LAB'), securityPlatformController.scenarios);
securityPlatformRoutes.get('/client/attack-lab/runs', requireRole(UserRole.CLIENT), requireTier(['shield-ops', 'shield-enterprise']), requireFeature('ATTACK_LAB'), securityPlatformController.runs);
securityPlatformRoutes.post('/client/attack-lab/runs', requireRole(UserRole.CLIENT), requireTier(['shield-ops', 'shield-enterprise']), requireFeature('ATTACK_LAB'), securityPlatformController.startRun);
securityPlatformRoutes.get('/client/attack-lab/runs/:id', requireRole(UserRole.CLIENT), requireTier(['shield-ops', 'shield-enterprise']), requireFeature('ATTACK_LAB'), securityPlatformController.runDetail);
securityPlatformRoutes.get('/client/attack-lab/drill', requireRole(UserRole.CLIENT), requireTier(['shield-ops', 'shield-enterprise']), requireFeature('ATTACK_LAB'), securityPlatformController.drill);
securityPlatformRoutes.post('/client/attack-lab/drill/score', requireRole(UserRole.CLIENT), requireTier(['shield-ops', 'shield-enterprise']), requireFeature('ATTACK_LAB'), securityPlatformController.scoreDrill);
securityPlatformRoutes.get('/client/osint', requireRole(UserRole.CLIENT), requireTier(['shield-ops', 'shield-enterprise']), requireFeature('EXTERNAL_SECURITY'), validate(integrationSchemas.osintQuery), integrationsController.osintLookup);
securityPlatformRoutes.get('/client/threat-intel', requireRole(UserRole.CLIENT), requireTier(['shield-ops', 'shield-enterprise']), requireFeature('EXTERNAL_SECURITY'), validate(integrationSchemas.threatIntelQuery), integrationsController.threatIntelLookup);
securityPlatformRoutes.get('/client/cloud/inventory', requireRole(UserRole.CLIENT), requireTier(['shield-ops', 'shield-enterprise']), requireFeature('EXTERNAL_SECURITY'), validate(integrationSchemas.cloudInventoryQuery), integrationsController.cloudInventory);
securityPlatformRoutes.post('/client/phishing/analyze', requireRole(UserRole.CLIENT), requireTier(['shield-ops', 'shield-enterprise']), requireFeature('EXTERNAL_SECURITY'), validate(integrationSchemas.phishingAnalyze), integrationsController.phishingAnalyze);
securityPlatformRoutes.post('/client/email-security/events', requireRole(UserRole.CLIENT), requireTier(['shield-ops', 'shield-enterprise']), requireFeature('EXTERNAL_SECURITY'), validate(integrationSchemas.emailSecurityEvent), integrationsController.emailSecurityEvent);
securityPlatformRoutes.get('/client/compliance/frameworks', requireRole(UserRole.CLIENT), requireTier(['shield-enterprise']), requireFeature('COMPLIANCE_MANAGEMENT'), integrationsController.complianceFrameworks);
securityPlatformRoutes.post('/client/compliance/evidence/submit', requireRole(UserRole.CLIENT), requireTier(['shield-enterprise']), requireFeature('COMPLIANCE_MANAGEMENT'), validate(integrationSchemas.complianceEvidence), integrationsController.submitComplianceEvidence);

securityPlatformRoutes.get('/admin/security-events', requireRole(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.ANALYST, UserRole.AUDITOR, UserRole.SUPERVISOR), requirePermission('security-event:read'), requireFeature('SECURITY_EVENTS'), securityPlatformController.adminEvents);
securityPlatformRoutes.get('/admin/attack-lab/overview', requireRole(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.ANALYST, UserRole.SUPERVISOR), requirePermission('attack-lab:read'), securityPlatformController.adminAttackOverview);
securityPlatformRoutes.get('/admin/osint', requireRole(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.ANALYST, UserRole.SUPERVISOR), requirePermission('osint:read'), validate(integrationSchemas.osintQuery), requireClientTier(['shield-ops', 'shield-enterprise'], { optionalClientContext: true }), integrationsController.osintLookup);
securityPlatformRoutes.get('/admin/threat-intel', requireRole(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.ANALYST, UserRole.SUPERVISOR), requirePermission('osint:read'), validate(integrationSchemas.threatIntelQuery), requireClientTier(['shield-ops', 'shield-enterprise'], { optionalClientContext: true }), integrationsController.threatIntelLookup);
securityPlatformRoutes.get('/admin/cloud/inventory', requireRole(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.ANALYST, UserRole.SUPERVISOR), requirePermission('attack-surface:read'), validate(integrationSchemas.cloudInventoryQuery), requireClientTier(['shield-ops', 'shield-enterprise'], { optionalClientContext: true }), integrationsController.cloudInventory);
securityPlatformRoutes.post('/admin/phishing/analyze', requireRole(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.ANALYST, UserRole.SUPERVISOR), requirePermission('ai:write'), validate(integrationSchemas.phishingAnalyze), requireClientTier(['shield-ops', 'shield-enterprise'], { optionalClientContext: true }), integrationsController.phishingAnalyze);
securityPlatformRoutes.post('/admin/email-security/events', requireRole(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.ANALYST, UserRole.SUPERVISOR), requirePermission('security-event:write'), validate(integrationSchemas.emailSecurityEvent), requireClientTier(['shield-ops', 'shield-enterprise'], { optionalClientContext: true }), integrationsController.emailSecurityEvent);
securityPlatformRoutes.get('/admin/compliance/frameworks', requireRole(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.ANALYST, UserRole.SUPERVISOR, UserRole.AUDITOR), requirePermission('compliance:read'), integrationsController.complianceFrameworks);
securityPlatformRoutes.post('/admin/compliance/evidence/submit', requireRole(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.ANALYST, UserRole.SUPERVISOR), requirePermission('compliance:write'), validate(integrationSchemas.complianceEvidence), integrationsController.submitComplianceEvidence);
securityPlatformRoutes.post('/admin/clients/:clientCompanyId/rotate-key', requireRole(UserRole.ADMIN, UserRole.SUPERADMIN), securityPlatformController.rotateTenantKey);
securityPlatformRoutes.post('/admin/session-risk/evaluate', requireRole(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.ANALYST), securityPlatformController.sessionRisk);
