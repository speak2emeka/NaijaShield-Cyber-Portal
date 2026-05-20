import express from 'express';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { openApiSpec } from './config/swagger.js';
import { registry } from './middleware/metrics.js';
import { errorHandler, notFound } from './middleware/error.js';
import { registerSecurityMiddleware } from './middleware/security.js';
import { apiRoutes } from './routes/index.js';

export function createApp() {
  const app = express();
  registerSecurityMiddleware(app);

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'naijashield-api' });
  });
  app.get('/metrics', async (_req, res) => {
    res.setHeader('content-type', registry.contentType);
    res.send(await registry.metrics());
  });

  app.use('/uploads/reports', express.static(path.resolve(env.UPLOAD_DIR)));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
  app.use('/api', apiRoutes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
