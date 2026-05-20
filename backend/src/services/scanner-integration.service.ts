import { randomUUID } from 'node:crypto';
import { ScanTool } from '@prisma/client';

export interface ScannerQueueInput {
  scanRunId: string;
  clientCompanyId?: string | null;
  tool: ScanTool;
  target: string;
  scheduledFor?: Date | null;
}

export interface ScannerQueuePlan {
  jobId: string;
  tool: ScanTool;
  target: string;
  scheduledFor: string;
  workerQueue: string;
  executionMode: 'external-worker';
  ingestionContract: {
    endpoint: string;
    requiredFields: string[];
  };
}

const queues: Record<ScanTool, string> = {
  ZAP: 'security-scans.web-baseline',
  NMAP: 'security-scans.service-inventory',
  SEMGREP: 'security-scans.sast',
  DEPENDENCY: 'security-scans.dependencies'
};

export async function queueScannerRun(input: ScannerQueueInput): Promise<ScannerQueuePlan> {
  return {
    jobId: randomUUID(),
    tool: input.tool,
    target: input.target,
    scheduledFor: (input.scheduledFor || new Date()).toISOString(),
    workerQueue: queues[input.tool],
    executionMode: 'external-worker',
    ingestionContract: {
      endpoint: '/api/admin/scans/results',
      requiredFields: ['scanRunId', 'status', 'rawResult']
    }
  };
}
