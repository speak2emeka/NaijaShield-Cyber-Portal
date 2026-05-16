import argon2 from 'argon2';
import { AssetType, AttackDifficulty, ComplianceFramework, ComplianceItemStatus, PrismaClient, RiskLevel, SecuritySeverity, ServiceRequestStatus, ServiceRequestType, SubscriptionStatus, TicketPriority, TicketStatus, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminHash = await argon2.hash('admin123');
  const clientHash = await argon2.hash('client123');

  const company = await prisma.clientCompany.upsert({
    where: { id: 'demo-company' },
    update: {},
    create: {
      id: 'demo-company',
      name: 'Acme Finance Ltd',
      industry: 'Banking',
      size: '250-500',
      contactEmail: 'security@acmefinance.test',
      tenantKeyId: 'kms-demo-acme-finance-v1',
      keyRotationDueAt: new Date('2026-12-31')
    }
  });

  await prisma.user.upsert({
    where: { email: 'admin@naijashield.ng' },
    update: {},
    create: {
      name: 'NaijaShield Admin',
      email: 'admin@naijashield.ng',
      passwordHash: adminHash,
      role: UserRole.ADMIN
    }
  });

  const client = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      name: 'Demo Client',
      email: 'client@example.com',
      passwordHash: clientHash,
      role: UserRole.CLIENT,
      clientCompanyId: company.id
    }
  });

  await prisma.subscription.upsert({
    where: { clientCompanyId: company.id },
    update: {},
    create: {
      clientCompanyId: company.id,
      plan: 'ShieldOps',
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date('2026-01-01'),
      renewalDate: new Date('2026-12-31'),
      paymentHistory: [{ amount: 250000, currency: 'NGN', date: '2026-05-01', status: 'paid' }]
    }
  });

  await prisma.ticket.createMany({
    data: [
      {
        clientCompanyId: company.id,
        createdByUserId: client.id,
        title: 'Suspicious payroll email campaign',
        description: 'Several users received a payroll-themed message with a suspicious attachment.',
        status: TicketStatus.OPEN,
        priority: TicketPriority.HIGH
      },
      {
        clientCompanyId: company.id,
        createdByUserId: client.id,
        title: 'VPN login anomaly',
        description: 'Failed VPN attempts observed from a new geography.',
        status: TicketStatus.IN_PROGRESS,
        priority: TicketPriority.MEDIUM
      }
    ],
    skipDuplicates: true
  });

  await prisma.serviceRequest.createMany({
    data: [
      {
        clientCompanyId: company.id,
        type: ServiceRequestType.PENTEST,
        description: 'External web application penetration test for customer banking portal.',
        status: ServiceRequestStatus.APPROVED
      },
      {
        clientCompanyId: company.id,
        type: ServiceRequestType.COMPLIANCE_REVIEW,
        description: 'NDPR and ISO 27001 readiness review.',
        status: ServiceRequestStatus.PENDING
      }
    ],
    skipDuplicates: true
  });

  await prisma.report.createMany({
    data: [
      {
        clientCompanyId: company.id,
        title: 'May Security Posture Review',
        description: 'Improved endpoint hygiene with MFA rollout pending for privileged accounts.',
        filePath: '/uploads/reports/demo-security-review.pdf'
      }
    ],
    skipDuplicates: true
  });

  await prisma.securityScoreHistory.createMany({
    data: [
      { clientCompanyId: company.id, score: 68, calculatedAt: new Date('2026-01-15'), notes: 'Initial onboarding baseline.' },
      { clientCompanyId: company.id, score: 73, calculatedAt: new Date('2026-02-15'), notes: 'EDR coverage improved.' },
      { clientCompanyId: company.id, score: 78, calculatedAt: new Date('2026-03-15'), notes: 'MFA adopted for most users.' },
      { clientCompanyId: company.id, score: 84, calculatedAt: new Date('2026-04-15'), notes: 'Incident playbook completed.' }
    ],
    skipDuplicates: true
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: client.id,
        clientCompanyId: company.id,
        type: 'ALERT',
        message: 'New high-priority ticket opened for suspicious payroll email campaign.'
      },
      {
        clientCompanyId: company.id,
        type: 'REPORT',
        message: 'May Security Posture Review is available in the reports center.'
      }
    ],
    skipDuplicates: true
  });

  await prisma.knowledgeBaseArticle.createMany({
    data: [
      {
        title: 'How to report a suspected phishing email',
        category: 'Awareness',
        content: 'Preserve the email, avoid clicking links or attachments, and open a support ticket with full headers when possible.'
      },
      {
        title: 'Incident response first hour checklist',
        category: 'Incident Response',
        content: 'Contain affected accounts, preserve logs, identify impacted assets, and notify NaijaShield through the portal.'
      },
      {
        title: 'MFA rollout guidance',
        category: 'Identity Security',
        content: 'Prioritize privileged accounts, enforce phishing-resistant factors, and monitor fallback methods.'
      }
    ],
    skipDuplicates: true
  });

  await prisma.securityPostureSummary.upsert({
    where: { clientCompanyId: company.id },
    update: {},
    create: {
      clientCompanyId: company.id,
      score: 84,
      breakdown: {
        incidents: 78,
        response: 86,
        coverage: 88,
        notes: ['Open high-priority ticket present', 'Recent report available', 'MFA rollout in progress']
      }
    }
  });

  await prisma.securityEvent.createMany({
    data: [
      {
        clientCompanyId: company.id,
        type: 'AUTH_NEW_DEVICE',
        severity: SecuritySeverity.MEDIUM,
        source: 'zero-trust',
        message: 'New browser fingerprint observed for demo client.',
        metadata: { riskScore: 42, flags: ['new_device'] }
      },
      {
        clientCompanyId: company.id,
        type: 'ATTACK_LAB_DETECTION',
        severity: SecuritySeverity.LOW,
        source: 'attack-lab',
        message: 'Synthetic phishing campaign simulation detected at initial access phase.',
        metadata: { simulated: true, nonWeaponizable: true }
      }
    ],
    skipDuplicates: true
  });

  await prisma.clientAsset.createMany({
    data: [
      { clientCompanyId: company.id, type: AssetType.DOMAIN, identifier: 'acmefinance.test', riskLevel: RiskLevel.MEDIUM, metadata: { source: 'demo-seed' } },
      { clientCompanyId: company.id, type: AssetType.APP, identifier: 'customer-portal-demo', riskLevel: RiskLevel.HIGH, metadata: { source: 'demo-seed', note: 'Synthetic asset for posture visualization' } },
      { clientCompanyId: company.id, type: AssetType.CLOUD, identifier: 'aws-demo-account', riskLevel: RiskLevel.LOW, metadata: { source: 'demo-seed' } }
    ],
    skipDuplicates: true
  });

  for (const framework of [ComplianceFramework.ISO27001, ComplianceFramework.SOC2, ComplianceFramework.NDPR]) {
    await prisma.complianceStatus.upsert({
      where: { clientCompanyId_framework: { clientCompanyId: company.id, framework } },
      update: {},
      create: {
        clientCompanyId: company.id,
        framework,
        status: framework === ComplianceFramework.NDPR ? ComplianceItemStatus.COMPLETE : ComplianceItemStatus.IN_PROGRESS,
        score: framework === ComplianceFramework.NDPR ? 91 : 72,
        checklist: [
          { item: 'Policy ownership assigned', status: 'COMPLETE' },
          { item: 'Evidence uploaded', status: framework === ComplianceFramework.NDPR ? 'COMPLETE' : 'IN_PROGRESS' },
          { item: 'Quarterly control review', status: 'IN_PROGRESS' }
        ]
      }
    });
  }

  const scenarioTemplates = [
    {
      id: 'scenario-credential-stuffing',
      title: 'Credential Stuffing Attempt',
      description: 'Synthetic replay of suspicious login pressure against a protected portal. No real credentials, targets, or exploit logic are used.',
      category: 'Identity Security',
      difficulty: AttackDifficulty.BEGINNER
    },
    {
      id: 'scenario-phishing-campaign',
      title: 'Phishing Campaign Simulation',
      description: 'A pre-recorded awareness scenario showing how phishing indicators become detections and response tasks.',
      category: 'Awareness',
      difficulty: AttackDifficulty.BEGINNER
    },
    {
      id: 'scenario-web-app-probing',
      title: 'Web App Probing',
      description: 'Safe, high-level timeline of noisy web probing indicators without payloads or actionable exploitation detail.',
      category: 'Application Security',
      difficulty: AttackDifficulty.INTERMEDIATE
    },
    {
      id: 'scenario-insider-access',
      title: 'Insider Data Access Attempt',
      description: 'Synthetic data access anomaly and response exercise focused on detection, escalation, and containment.',
      category: 'Data Protection',
      difficulty: AttackDifficulty.ADVANCED
    }
  ];

  for (const scenario of scenarioTemplates) {
    await prisma.attackScenario.upsert({
      where: { id: scenario.id },
      update: {},
      create: {
        ...scenario,
        safetyNote: 'Simulation only: no real network activity, payloads, exploit steps, or reusable offensive code.',
        eventTemplate: [
          { phase: 'RECON', severity: 'LOW', description: 'Synthetic external signal observed and classified.' },
          { phase: 'INITIAL_ACCESS', severity: 'MEDIUM', description: 'Simulated suspicious access attempt enters detection workflow.' },
          { phase: 'CONTAINMENT', severity: 'LOW', description: 'NaijaShield playbook recommends containment and user notification.' },
          { phase: 'RECOVERY', severity: 'LOW', description: 'Readiness score and follow-up recommendations generated.' }
        ],
        attackerTemplate: { narrative: 'High-level simulated adversary storyline for awareness only, with no operational details.' },
        defenderTemplate: { narrative: 'Detection logic, triage queueing, stakeholder notification, and containment recommendations.' }
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async error => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
