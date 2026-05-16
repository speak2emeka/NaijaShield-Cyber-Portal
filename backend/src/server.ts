import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { prisma } from './config/prisma.js';
import { initSentry } from './config/sentry.js';
import { createApp } from './app.js';

initSentry();
const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, 'NaijaShield API listening');
});

async function shutdown(signal: string) {
  logger.info({ signal }, 'Shutting down API');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
