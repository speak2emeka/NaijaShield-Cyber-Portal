import { Router } from 'express';
import { adminRoutes } from './admin.routes.js';
import { authRoutes } from './auth.routes.js';
import { clientRoutes } from './client.routes.js';
import { publicRoutes } from './public.routes.js';

export const apiRoutes = Router();

apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/public', publicRoutes);
apiRoutes.use('/client', clientRoutes);
apiRoutes.use('/admin', adminRoutes);
