import axios from 'axios';
import { Report, ServiceRequest, Ticket, User } from '../types';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 1500
});

let accessToken: string | null = localStorage.getItem('ns_access_token');

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) localStorage.setItem('ns_access_token', token);
  else localStorage.removeItem('ns_access_token');
}

api.interceptors.request.use(config => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

const now = new Date().toISOString();

const demoUsers: Record<string, User & { password: string }> = {
  'admin@naijashield.ng': {
    id: 'demo-admin',
    email: 'admin@naijashield.ng',
    password: 'admin123',
    name: 'NaijaShield Admin',
    role: 'ADMIN'
  },
  'client@example.com': {
    id: 'demo-client',
    email: 'client@example.com',
    password: 'client123',
    name: 'Demo Client',
    role: 'CLIENT',
    clientCompanyId: 'demo-company'
  }
};

const demoTickets: Ticket[] = [
  {
    id: 'ticket-1',
    title: 'Review endpoint exposure',
    description: 'Confirm that public API endpoints are rate limited and monitored.',
    status: 'OPEN',
    priority: 'HIGH',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'ticket-2',
    title: 'Enable phishing simulation',
    description: 'Schedule security awareness campaign for finance and HR teams.',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    createdAt: now,
    updatedAt: now
  }
];

const demoRequests: ServiceRequest[] = [
  {
    id: 'request-1',
    type: 'PENTEST',
    description: 'Quarterly penetration test for customer portal and admin console.',
    status: 'PENDING',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'request-2',
    type: 'CLOUD_SECURITY_AUDIT',
    description: 'Review AWS identity, logging, and storage hardening.',
    status: 'IN_PROGRESS',
    createdAt: now,
    updatedAt: now
  }
];

const demoReports: Report[] = [
  {
    id: 'report-1',
    title: 'External Attack Surface Review',
    description: 'Findings and remediation plan for internet-facing assets.',
    filePath: '#',
    createdAt: now
  },
  {
    id: 'report-2',
    title: 'Cloud Security Baseline',
    description: 'Configuration review against NaijaShield cloud hardening checks.',
    filePath: '#',
    createdAt: now
  }
];

const demoCompany = {
  id: 'demo-company',
  name: 'Lagos Fintech Group',
  industry: 'Financial Services',
  size: '250-500',
  contactEmail: 'security@lagosfintech.test',
  users: [{
    id: demoUsers['client@example.com'].id,
    email: demoUsers['client@example.com'].email,
    name: demoUsers['client@example.com'].name,
    role: demoUsers['client@example.com'].role,
    clientCompanyId: demoUsers['client@example.com'].clientCompanyId
  }],
  subscription: {
    plan: 'ShieldOps',
    status: 'ACTIVE',
    startDate: '2026-01-01T00:00:00.000Z',
    renewalDate: '2026-12-31T00:00:00.000Z',
    paymentHistory: [{ amount: 250000, currency: 'NGN', date: '2026-05-01', status: 'paid' }]
  }
};

const demoNotifications = [
  { id: 'note-1', type: 'ALERT', message: 'High-priority ticket opened for endpoint exposure review.', read: false, createdAt: now },
  { id: 'note-2', type: 'REPORT', message: 'External Attack Surface Review is ready for download.', read: true, createdAt: now }
];

const demoAuditLogs = [
  { id: 'audit-1', action: 'CLIENT_LOGIN', entityType: 'User', createdAt: now, user: { email: 'client@example.com' } },
  { id: 'audit-2', action: 'TICKET_CREATED', entityType: 'Ticket', createdAt: now, user: { email: 'client@example.com' } }
];

const demoKnowledgeBase = [
  { id: 'kb-1', title: 'How to report a suspected phishing email', category: 'Awareness', content: 'Preserve the email, avoid links or attachments, and open a ticket with full headers when possible.', createdAt: now },
  { id: 'kb-2', title: 'Incident response first hour checklist', category: 'Incident Response', content: 'Contain affected accounts, preserve logs, identify impacted assets, and notify NaijaShield through the portal.', createdAt: now },
  { id: 'kb-3', title: 'MFA rollout guidance', category: 'Identity Security', content: 'Prioritize privileged users, enforce strong factors, and monitor fallback methods.', createdAt: now }
];

const demoPlans = [
  { id: 'basic', name: 'Basic', priceMonthly: 150000, features: ['Portal access', 'Ticket support', 'Quarterly reports'] },
  { id: 'pro', name: 'Pro', priceMonthly: 350000, features: ['Managed triage', 'Monthly reports', 'Security score tracking'] },
  { id: 'enterprise', name: 'Enterprise', priceMonthly: 900000, features: ['Dedicated analyst', 'SSO', 'Custom SLAs'] }
];

const demoSecurityEvents = [
  { id: 'sec-1', type: 'NEW_DEVICE_LOGIN', severity: 'MEDIUM', source: 'auth', message: 'New browser session observed for client administrator.', createdAt: now, clientCompany: { name: 'Lagos Fintech Group' }, metadata: { riskScore: 42, simulated: true } },
  { id: 'sec-2', type: 'REPORT_DOWNLOAD_STEP_UP', severity: 'LOW', source: 'reporting', message: 'Step-up authentication required before report download.', createdAt: now, clientCompany: { name: 'Lagos Fintech Group' }, metadata: { action: 'download-report' } },
  { id: 'sec-3', type: 'ATTACK_LAB_RUN', severity: 'LOW', source: 'attack-lab', message: 'Safe simulated phishing campaign completed in Attack Lab.', createdAt: now, clientCompany: { name: 'Lagos Fintech Group' }, metadata: { simulated: true } }
];

const demoAssets = [
  { id: 'asset-1', type: 'DOMAIN', identifier: 'lagosfintech.test', riskLevel: 'LOW', lastSeenAt: now },
  { id: 'asset-2', type: 'APP', identifier: 'customer-portal', riskLevel: 'MEDIUM', lastSeenAt: now },
  { id: 'asset-3', type: 'CLOUD', identifier: 'production-cloud-account', riskLevel: 'HIGH', lastSeenAt: now }
];

const demoCompliance = [
  { id: 'comp-1', framework: 'ISO27001', status: 'IN_PROGRESS', score: 72, lastUpdatedAt: now, checklist: [{ label: 'Asset inventory maintained', status: 'COMPLETE' }, { label: 'Access reviews documented', status: 'IN_PROGRESS' }, { label: 'Supplier risk process approved', status: 'NOT_STARTED' }], evidence: [{ id: 'ev-1', title: 'Access review evidence', createdAt: now }] },
  { id: 'comp-2', framework: 'SOC2', status: 'IN_PROGRESS', score: 68, lastUpdatedAt: now, checklist: [{ label: 'Change management evidence', status: 'COMPLETE' }, { label: 'Incident response test', status: 'IN_PROGRESS' }], evidence: [] },
  { id: 'comp-3', framework: 'NDPR', status: 'COMPLETE', score: 88, lastUpdatedAt: now, checklist: [{ label: 'Privacy notice reviewed', status: 'COMPLETE' }, { label: 'Data processing register', status: 'COMPLETE' }], evidence: [] }
];

const demoAttackScenarios = [
  { id: 'scenario-credential-stuffing', title: 'Credential Stuffing Attempt', description: 'Synthetic identity abuse storyline using safe, prewritten telemetry.', category: 'Identity', difficulty: 'INTERMEDIATE' },
  { id: 'scenario-phishing-campaign', title: 'Phishing Campaign Simulation', description: 'Awareness and response exercise with no live messages sent.', category: 'Awareness', difficulty: 'BEGINNER' },
  { id: 'scenario-web-app-probing', title: 'Web App Probing', description: 'High-level simulated reconnaissance signals for defensive review.', category: 'Application Security', difficulty: 'INTERMEDIATE' },
  { id: 'scenario-insider-access', title: 'Insider Data Access Attempt', description: 'Tabletop story about unusual data access and escalation paths.', category: 'Insider Risk', difficulty: 'ADVANCED' }
];

const demoAttackRuns: any[] = [
  {
    id: 'run-1',
    scenarioId: 'scenario-phishing-campaign',
    scenario: demoAttackScenarios[1],
    startedAt: now,
    finishedAt: now,
    resultSummary: { simulated: true, outcome: 'Detected at initial access phase', readinessScore: 84 },
    attackerView: { narrative: 'The simulated actor relied on social pressure and a convincing business pretext. No real messages or payloads were generated.' },
    defenderView: { narrative: 'NaijaShield correlated user reports, mail security alerts, and ticket activity to recommend containment.' },
    events: [
      { id: 'ae-1', phase: 'RECON', severity: 'LOW', description: 'Synthetic targeting signal generated for tabletop discussion.', timestamp: now },
      { id: 'ae-2', phase: 'INITIAL_ACCESS', severity: 'MEDIUM', description: 'User-report event added to the simulated timeline.', timestamp: now },
      { id: 'ae-3', phase: 'CONTAINMENT', severity: 'LOW', description: 'Containment and communication actions marked complete.', timestamp: now }
    ]
  }
];

function publicUser(user: User & { password: string }): User {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

function demoSessionUser() {
  const email = localStorage.getItem('ns_demo_user');
  if (!email) return null;
  const user = demoUsers[email];
  return user ? publicUser(user) : null;
}

function demoResponse(config: any, data: unknown, status = 200) {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config
  };
}

function handleDemoRequest(config: any) {
  const method = (config.method || 'get').toLowerCase();
  const url = String(config.url || '').replace(/^\/api/, '');
  const body = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : config.data || {};

  if (method === 'post' && url === '/auth/login') {
    const user = demoUsers[String(body.email || '').toLowerCase()];
    if (!user || user.password !== body.password) return null;
    localStorage.setItem('ns_demo_user', user.email);
    return demoResponse(config, { accessToken: 'demo-access-token', user: publicUser(user) });
  }

  if (method === 'get' && url === '/auth/me') {
    const user = demoSessionUser();
    return user ? demoResponse(config, { user }) : null;
  }

  if (method === 'post' && url === '/auth/logout') {
    localStorage.removeItem('ns_demo_user');
    return demoResponse(config, { ok: true });
  }

  if (method === 'post' && url === '/auth/refresh') {
    const user = demoSessionUser();
    return user ? demoResponse(config, { accessToken: 'demo-access-token' }) : null;
  }

  if (method === 'post' && url.startsWith('/enterprise/auth/')) return demoResponse(config, { ok: true });
  if (method === 'get' && url === '/enterprise/sso/config') return demoResponse(config, { providers: ['azure-ad', 'google-workspace', 'okta'], status: 'configuration-required' });
  if (method === 'post' && url === '/enterprise/mfa/totp/setup') return demoResponse(config, { secret: 'JBSWY3DPEHPK3PXP', otpauthUrl: 'otpauth://totp/NaijaShield:demo' });
  if (method === 'post' && url === '/enterprise/mfa/totp/verify') return demoResponse(config, { ok: true });
  if (method === 'get' && url === '/enterprise/sessions') return demoResponse(config, [{ id: 'session-1', deviceLabel: 'Current browser', ipAddress: '127.0.0.1', lastSeenAt: now }]);
  if (method === 'get' && url === '/enterprise/permissions') return demoResponse(config, { CLIENT: ['client:read', 'ticket:create'], ADMIN: ['*'], ANALYST: ['ticket:read', 'report:create'] });
  if (method === 'get' && url === '/enterprise/billing/plans') return demoResponse(config, demoPlans);
  if (method === 'post' && url === '/enterprise/billing/checkout') return demoResponse(config, { provider: body.provider || 'STRIPE', checkoutUrl: `${location.origin}/client/billing?demoCheckout=${body.planId}` });
  if (method === 'get' && url === '/enterprise/billing/invoices') return demoResponse(config, [{ id: 'invoice-1', amount: 250000, currency: 'NGN', status: 'PAID', createdAt: now }]);
  if (method === 'get' && url.includes('/enterprise/reports/') && url.endsWith('/signed-url')) return demoResponse(config, { url: '#', checksum: 'demo-checksum' });

  if (method === 'get' && url === '/security-platform/client/security-posture') {
    return demoResponse(config, {
      summary: {
        clientCompanyId: 'demo-company',
        score: 84,
        lastCalculatedAt: now,
        breakdown: { incidents: 86, response: 78, coverage: 88, reporting: 82 }
      },
      history: [
        { id: 'score-1', score: 68, calculatedAt: '2026-01-15T00:00:00.000Z' },
        { id: 'score-2', score: 73, calculatedAt: '2026-02-15T00:00:00.000Z' },
        { id: 'score-3', score: 84, calculatedAt: '2026-04-15T00:00:00.000Z' }
      ]
    });
  }
  if (method === 'post' && url === '/security-platform/client/security-posture/recalculate') return demoResponse(config, { score: 84, breakdown: { incidents: 86, response: 78, coverage: 88 } });
  if (method === 'get' && url === '/security-platform/client/security-events') return demoResponse(config, demoSecurityEvents);
  if (method === 'get' && url === '/security-platform/client/assets') return demoResponse(config, demoAssets);
  if (method === 'get' && url === '/security-platform/client/compliance') return demoResponse(config, demoCompliance);
  if (method === 'post' && url.includes('/security-platform/client/compliance/') && url.endsWith('/evidence')) return demoResponse(config, { id: crypto.randomUUID(), title: body.title, createdAt: now }, 201);
  if (method === 'get' && url === '/security-platform/client/tenant-key') return demoResponse(config, { tenantKeyId: 'kms-demo-acme-finance-v1', rotationDueAt: '2026-11-16T00:00:00.000Z', provider: 'stub-kms' });
  if (method === 'get' && url === '/security-platform/client/attack-lab/scenarios') return demoResponse(config, demoAttackScenarios);
  if (method === 'get' && url === '/security-platform/client/attack-lab/runs') return demoResponse(config, demoAttackRuns);
  if (method === 'post' && url === '/security-platform/client/attack-lab/runs') {
    const scenario = demoAttackScenarios.find(item => item.id === body.scenarioId) || demoAttackScenarios[0];
    const run = { ...demoAttackRuns[0], id: crypto.randomUUID(), scenarioId: scenario.id, scenario, startedAt: new Date().toISOString(), finishedAt: new Date().toISOString() };
    demoAttackRuns.unshift(run);
    return demoResponse(config, run, 201);
  }
  if (method === 'get' && url.startsWith('/security-platform/client/attack-lab/runs/')) return demoResponse(config, demoAttackRuns.find(run => url.endsWith(run.id)) || demoAttackRuns[0]);
  if (method === 'get' && url === '/security-platform/client/attack-lab/drill') return demoResponse(config, { kind: 'phishing', safetyNote: 'Interactive tabletop drill only. No real attack activity occurs.', steps: [{ prompt: 'A user reports a suspicious invoice email. What is the best first action?', options: ['Preserve and report the email', 'Forward it broadly', 'Open the attachment'] }, { prompt: 'The email reached five users. What should the team do next?', options: ['Notify affected users and check logs', 'Ignore it', 'Disable mail security'] }] });
  if (method === 'post' && url === '/security-platform/client/attack-lab/drill/score') return demoResponse(config, { readinessScore: 100, recommendations: ['Document escalation paths', 'Preserve evidence early', 'Practice stakeholder communication'] });
  if (method === 'get' && url === '/security-platform/admin/security-events') return demoResponse(config, demoSecurityEvents);
  if (method === 'get' && url === '/security-platform/admin/attack-lab/overview') return demoResponse(config, { runs: demoAttackRuns.length, scenarios: demoAttackScenarios.map(scenario => ({ ...scenario, _count: { runs: scenario.id === 'scenario-phishing-campaign' ? 1 : 0 } })), commonEventTypes: [{ type: 'NEW_DEVICE_LOGIN', _count: { type: 4 } }, { type: 'ATTACK_LAB_RUN', _count: { type: 2 } }] });

  if (method === 'get' && url === '/client/dashboard') {
    return demoResponse(config, {
      metrics: { securityScore: 84, openTickets: 2, activeRequests: 2, reports: 2 },
      scores: [
        { label: 'Jan', score: 68 },
        { label: 'Feb', score: 72 },
        { label: 'Mar', score: 79 },
        { label: 'Apr', score: 84 }
      ],
      tickets: demoTickets,
      requests: demoRequests,
      reports: demoReports,
      subscription: demoCompany.subscription,
      company: demoCompany
    });
  }

  if (method === 'get' && url.startsWith('/client/reports/')) {
    return demoResponse(config, demoReports.find(report => url.endsWith(report.id)) || demoReports[0]);
  }
  if (method === 'get' && url === '/client/reports') return demoResponse(config, demoReports);
  if (method === 'get' && url === '/client/tickets') return demoResponse(config, demoTickets);
  if (method === 'get' && url === '/client/requests') return demoResponse(config, demoRequests);
  if (method === 'get' && url === '/client/security-score/history') {
    return demoResponse(config, [
      { id: 'score-1', score: 68, calculatedAt: '2026-01-15T00:00:00.000Z', notes: 'Initial onboarding baseline.' },
      { id: 'score-2', score: 73, calculatedAt: '2026-02-15T00:00:00.000Z', notes: 'EDR coverage improved.' },
      { id: 'score-3', score: 84, calculatedAt: '2026-04-15T00:00:00.000Z', notes: 'Incident playbook completed.' }
    ]);
  }
  if (method === 'get' && url === '/client/subscription') return demoResponse(config, demoCompany.subscription);
  if (method === 'get' && url === '/client/company') return demoResponse(config, demoCompany);
  if (method === 'get' && url === '/client/notifications') return demoResponse(config, demoNotifications);
  if (method === 'get' && url === '/client/audit-logs') return demoResponse(config, demoAuditLogs);
  if (method === 'get' && url === '/client/knowledge-base') return demoResponse(config, demoKnowledgeBase);

  if (method === 'post' && url === '/client/tickets') {
    demoTickets.unshift({
      id: crypto.randomUUID(),
      title: body.title,
      description: body.description,
      priority: body.priority || 'MEDIUM',
      status: 'OPEN',
      createdAt: now,
      updatedAt: now
    });
    return demoResponse(config, demoTickets[0], 201);
  }

  if (method === 'post' && url.includes('/client/tickets/') && url.endsWith('/comment')) {
    return demoResponse(config, { id: crypto.randomUUID(), body: body.message, createdAt: now }, 201);
  }

  if (method === 'post' && url === '/client/requests') {
    demoRequests.unshift({
      id: crypto.randomUUID(),
      type: body.type,
      description: body.description,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now
    });
    return demoResponse(config, demoRequests[0], 201);
  }

  if (method === 'get' && url === '/admin/dashboard') {
    return demoResponse(config, {
      metrics: { clients: 3, subscriptions: 2, openTickets: 5, pendingRequests: 4 },
      recentActivity: [
        { id: 'log-1', action: 'CLIENT_LOGIN', entityType: 'User', createdAt: now },
        { id: 'log-2', action: 'REPORT_UPLOADED', entityType: 'Report', createdAt: now },
        { id: 'log-3', action: 'HEALTH_CHECK_GREEN', entityType: 'Platform', createdAt: now }
      ]
    });
  }

  if (method === 'get' && url === '/admin/clients') {
    return demoResponse(config, [
      { ...demoCompany, id: 'company-1' },
      { id: 'company-2', name: 'Abuja Health Network', industry: 'Healthcare', users: [], subscription: { plan: 'ShieldEnterprise' } }
    ]);
  }

  if (method === 'get' && url.startsWith('/admin/clients/') && url.endsWith('/reports')) return demoResponse(config, demoReports);
  if (method === 'get' && url.startsWith('/admin/clients/')) return demoResponse(config, { ...demoCompany, id: url.split('/')[3], reports: demoReports, tickets: demoTickets, serviceRequests: demoRequests });
  if (method === 'post' && url.includes('/admin/clients/') && url.endsWith('/reports')) return demoResponse(config, demoReports[0], 201);

  if (method === 'get' && url === '/admin/tickets') {
    return demoResponse(config, demoTickets.map(ticket => ({ ...ticket, clientCompany: { name: 'Lagos Fintech Group' } })));
  }

  if (method === 'get' && url === '/admin/requests') {
    return demoResponse(config, demoRequests.map(request => ({ ...request, clientCompany: { name: 'Lagos Fintech Group' } })));
  }

  if (method === 'get' && url === '/admin/audit-logs') {
    return demoResponse(config, [
      { id: 'log-1', action: 'CLIENT_LOGIN', entityType: 'User', createdAt: now, user: { email: 'client@example.com' } },
      { id: 'log-2', action: 'ADMIN_VIEWED_DASHBOARD', entityType: 'Dashboard', createdAt: now, user: { email: 'admin@naijashield.ng' } }
    ]);
  }

  if (method === 'post' && url === '/public/contact') return demoResponse(config, { ok: true }, 201);

  return null;
}

api.interceptors.response.use(
  response => {
    if (response.data && Array.isArray(response.data.items)) {
      return { ...response, data: response.data.items };
    }
    return response;
  },
  async error => {
    const original = error.config;
    if (!error.response) {
      const demo = handleDemoRequest(original);
      if (demo) return demo;
    }
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const { data } = await api.post('/auth/refresh');
      setAccessToken(data.accessToken);
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(original);
    }
    return Promise.reject(error);
  }
);
