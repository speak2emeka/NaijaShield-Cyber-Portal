import { NextFunction, Request, Response } from 'express';
import client from 'prom-client';

export const registry = new client.Registry();
client.collectDefaultMetrics({ register: registry });

const httpDuration = new client.Histogram({
  name: 'naijashield_http_request_duration_seconds',
  help: 'HTTP request latency by method, route, and status',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5]
});

const httpErrors = new client.Counter({
  name: 'naijashield_http_errors_total',
  help: 'HTTP error count by method, route, and status',
  labelNames: ['method', 'route', 'status']
});

export const queueDuration = new client.Histogram({
  name: 'naijashield_queue_job_duration_seconds',
  help: 'Background job processing time by queue and job name',
  labelNames: ['queue', 'job']
});

registry.registerMetric(httpDuration);
registry.registerMetric(httpErrors);
registry.registerMetric(queueDuration);

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const end = httpDuration.startTimer();
  res.on('finish', () => {
    const route = req.route?.path || req.path;
    const labels = { method: req.method, route, status: String(res.statusCode) };
    end(labels);
    if (res.statusCode >= 500) httpErrors.inc(labels);
  });
  next();
}
