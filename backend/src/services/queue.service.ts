import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { queueDuration } from '../middleware/metrics.js';

const RedisCtor = Redis as never as new (url: string, options: Record<string, unknown>) => never;
const connection = new RedisCtor(env.REDIS_URL, { maxRetriesPerRequest: null, lazyConnect: true });

export const reportQueue = new Queue('report-processing', { connection });
export const emailQueue = new Queue('email-delivery', { connection });

export function startWorkers() {
  const worker = new Worker('report-processing', async job => {
    const end = queueDuration.startTimer({ queue: 'report-processing', job: job.name });
    try {
      logger.info({ jobId: job.id }, 'Processing report job');
    } finally {
      end();
    }
  }, { connection });
  worker.on('failed', (job, error) => logger.error({ jobId: job?.id, error }, 'Queue job failed'));
  return worker;
}
