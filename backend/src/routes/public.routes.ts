import { Router } from 'express';
import { publicController } from '../controllers/public.controller.js';
import { validate } from '../middleware/validate.js';
import { publicSchemas } from '../utils/validation.js';

export const publicRoutes = Router();

publicRoutes.post('/contact', validate(publicSchemas.contact), publicController.contact);
publicRoutes.get('/blog', publicController.blog);
publicRoutes.get('/pricing', publicController.pricing);
