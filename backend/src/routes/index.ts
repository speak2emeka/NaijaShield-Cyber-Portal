import { Router } from 'express';
import { adminRoutes } from './admin.routes.js';
import { authRoutes } from './auth.routes.js';
import { clientRoutes } from './client.routes.js';
import { publicRoutes } from './public.routes.js';
import { enterpriseRoutes } from './enterprise.routes.js';
import { securityPlatformRoutes } from './security-platform.routes.js';
import { billingRoutes } from './billing.routes.js';
import { internalRoutes } from './internal.routes.js';

export const apiRoutes = Router();

apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/public', publicRoutes);
apiRoutes.use('/client', clientRoutes);
apiRoutes.use('/admin', adminRoutes);
apiRoutes.use('/enterprise', enterpriseRoutes);
apiRoutes.use('/security-platform', securityPlatformRoutes);
apiRoutes.use('/billing', billingRoutes);
apiRoutes.use('/internal', internalRoutes);
