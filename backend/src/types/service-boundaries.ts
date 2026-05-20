export type ModuleBoundary = 'auth' | 'reporting' | 'ticketing' | 'billing' | 'attack-lab' | 'security-events';

export type InternalServiceEvent = {
  module: ModuleBoundary;
  action: string;
  clientCompanyId?: string | null;
  userId?: string | null;
  correlationId?: string;
  metadata?: Record<string, unknown>;
};

export type StepUpAction = 'report.download' | 'roles.change' | 'audit.view';
