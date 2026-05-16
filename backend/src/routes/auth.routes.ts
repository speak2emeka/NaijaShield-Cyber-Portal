import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { authRateLimit } from '../middleware/security.js';
import { validate } from '../middleware/validate.js';
import { authSchemas } from '../utils/validation.js';

export const authRoutes = Router();

authRoutes.post('/register', authRateLimit, validate(authSchemas.register), authController.register);
authRoutes.post('/login', authRateLimit, validate(authSchemas.login), authController.login);
authRoutes.post('/refresh', authController.refresh);
authRoutes.post('/logout', requireAuth, authController.logout);
authRoutes.get('/me', requireAuth, authController.me);
