import argon2 from 'argon2';
import { AssetType, AttackDifficulty, ComplianceFramework, ComplianceItemStatus, Prisma, PrismaClient, RiskLevel, SecuritySeverity, ServiceRequestStatus, ServiceRequestType, SubscriptionStatus, TicketPriority, TicketStatus, UserRole } from '@prisma/client';

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

  const featureDefinitions = [
    { code: 'SECURITY_POSTURE', name: 'Security Posture', description: 'Visibility into posture score, events, and remediation guidance.', category: 'Core' },
    { code: 'SECURITY_EVENTS', name: 'Security Events', description: 'Real-time event and alert monitoring for client and SOC workflows.', category: 'Core' },
    { code: 'ATTACK_LAB', name: 'Attack Lab', description: 'Live training and attack simulation scenarios for security readiness.', category: 'Engagement' },
    { code: 'EXTERNAL_SECURITY', name: 'External Security Integrations', description: 'OSINT, threat intelligence, cloud inventory, phishing and email security checks.', category: 'Integrations' },
    { code: 'COMPLIANCE_MANAGEMENT', name: 'Compliance Management', description: 'Compliance frameworks, evidence tracking and audit-ready reporting.', category: 'Compliance' }
  ];

  for (const feature of featureDefinitions) {
    await prisma.feature.upsert({
      where: { code: feature.code },
      update: {},
      create: feature
    });
  }

  const [shieldStart, shieldOps, shieldEnterprise] = await Promise.all([
    prisma.plan.upsert({
      where: { slug: 'shield-start' },
      update: {},
      create: {
        slug: 'shield-start',
        name: 'ShieldStart',
        description: 'Baseline monitoring, ticket support and risk reporting for emerging teams.',
        category: 'SMB',
        priceMonthly: 120000,
        priceAnnual: 1200000,
        metadata: { idealFor: 'SMEs' },
        featureFlags: { SECURITY_POSTURE: true, ATTACK_LAB: false, EXTERNAL_SECURITY: false, COMPLIANCE_MANAGEMENT: false }
      }
    }),
    prisma.plan.upsert({
      where: { slug: 'shield-ops' },
      update: {},
      create: {
        slug: 'shield-ops',
        name: 'ShieldOps',
        description: 'Managed security operations with posture tracking, reports, and attack lab readiness.',
        category: 'Growth',
        priceMonthly: 350000,
        priceAnnual: 3500000,
        metadata: { idealFor: 'Growth teams' },
        featureFlags: { SECURITY_POSTURE: true, SECURITY_EVENTS: true, ATTACK_LAB: true, EXTERNAL_SECURITY: true, COMPLIANCE_MANAGEMENT: false }
      }
    }),
    prisma.plan.upsert({
      where: { slug: 'shield-enterprise' },
      update: {},
      create: {
        slug: 'shield-enterprise',
        name: 'ShieldEnterprise',
        description: 'Enterprise SOC and compliance orchestration with dedicated analyst support.',
        category: 'Enterprise',
        priceMonthly: 900000,
        priceAnnual: 9000000,
        metadata: { idealFor: 'Regulated organizations' },
        featureFlags: { SECURITY_POSTURE: true, SECURITY_EVENTS: true, ATTACK_LAB: true, EXTERNAL_SECURITY: true, COMPLIANCE_MANAGEMENT: true }
      }
    })
  ]);

  const planFeatures = [
    { planId: shieldStart.id, code: 'SECURITY_POSTURE' },
    { planId: shieldOps.id, code: 'SECURITY_POSTURE' },
    { planId: shieldOps.id, code: 'SECURITY_EVENTS' },
    { planId: shieldOps.id, code: 'ATTACK_LAB' },
    { planId: shieldOps.id, code: 'EXTERNAL_SECURITY' },
    { planId: shieldEnterprise.id, code: 'SECURITY_POSTURE' },
    { planId: shieldEnterprise.id, code: 'SECURITY_EVENTS' },
    { planId: shieldEnterprise.id, code: 'ATTACK_LAB' },
    { planId: shieldEnterprise.id, code: 'EXTERNAL_SECURITY' },
    { planId: shieldEnterprise.id, code: 'COMPLIANCE_MANAGEMENT' }
  ];

  for (const planFeature of planFeatures) {
    const feature = await prisma.feature.findUnique({ where: { code: planFeature.code } });
    if (feature) {
      await prisma.planFeature.upsert({
        where: { planId_featureId: { planId: planFeature.planId, featureId: feature.id } },
        update: {},
        create: {
          planId: planFeature.planId,
          featureId: feature.id,
          included: true
        }
      });
    }
  }

  await prisma.subscription.upsert({
    where: { clientCompanyId: company.id },
    update: {},
    create: {
      clientCompanyId: company.id,
      plan: 'ShieldOps',
      planId: shieldOps.id,
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date('2026-01-01'),
      renewalDate: new Date('2026-12-31'),
      paymentHistory: [{ amount: 250000, currency: 'NGN', date: '2026-05-01', status: 'paid' }],
      featureFlags: { SECURITY_POSTURE: true, ATTACK_LAB: true, EXTERNAL_SECURITY: true, COMPLIANCE_MANAGEMENT: false }
    }
  });

  // Ensure the demo company references a product plan directly
  await prisma.clientCompany.update({
    where: { id: company.id },
    data: { productPlanId: shieldOps.id }
  });

  const tierTestClients = [
    {
      companyId: 'company-start',
      companyName: 'Kano Retail Cooperative',
      industry: 'Retail',
      size: '25-50',
      contactEmail: 'security@kanoretail.test',
      userName: 'ShieldStart Client',
      email: 'start-client@naijashield.test',
      plan: shieldStart,
      planName: 'ShieldStart'
    },
    {
      companyId: 'company-ops',
      companyName: 'Lagos Fintech Group',
      industry: 'Financial Services',
      size: '250-500',
      contactEmail: 'security@lagosfintech.test',
      userName: 'ShieldOps Client',
      email: 'ops-client@naijashield.test',
      plan: shieldOps,
      planName: 'ShieldOps'
    },
    {
      companyId: 'company-enterprise',
      companyName: 'Abuja Health Network',
      industry: 'Healthcare',
      size: '1000+',
      contactEmail: 'security@abujahealth.test',
      userName: 'ShieldEnterprise Client',
      email: 'enterprise-client@naijashield.test',
      plan: shieldEnterprise,
      planName: 'ShieldEnterprise'
    }
  ];

  for (const tierClient of tierTestClients) {
    const tierCompany = await prisma.clientCompany.upsert({
      where: { id: tierClient.companyId },
      update: { productPlanId: tierClient.plan.id },
      create: {
        id: tierClient.companyId,
        name: tierClient.companyName,
        industry: tierClient.industry,
        size: tierClient.size,
        contactEmail: tierClient.contactEmail,
        productPlanId: tierClient.plan.id,
        tenantKeyId: `kms-${tierClient.companyId}-v1`,
        keyRotationDueAt: new Date('2026-12-31')
      }
    });

    await prisma.user.upsert({
      where: { email: tierClient.email },
      update: { clientCompanyId: tierCompany.id, role: UserRole.CLIENT },
      create: {
        name: tierClient.userName,
        email: tierClient.email,
        passwordHash: clientHash,
        role: UserRole.CLIENT,
        clientCompanyId: tierCompany.id
      }
    });

    await prisma.subscription.upsert({
      where: { clientCompanyId: tierCompany.id },
      update: { planId: tierClient.plan.id, plan: tierClient.planName, status: SubscriptionStatus.ACTIVE },
      create: {
        clientCompanyId: tierCompany.id,
        plan: tierClient.planName,
        planId: tierClient.plan.id,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date('2026-01-01'),
        renewalDate: new Date('2026-12-31'),
        featureFlags: (tierClient.plan.featureFlags || {}) as Prisma.InputJsonValue
      }
    });
  }

  // Seed FeatureFlag definitions and tenant-specific overrides
  const featureFlagDefinitions = [
    { code: 'FLAG_ATTACK_LAB', name: 'Attack Lab Module', description: 'Enable Attack Lab scenarios and runs', defaultEnabled: false },
    { code: 'FLAG_OSINT_INTEGRATIONS', name: 'OSINT Integrations', description: 'Enable external OSINT providers (Shodan, Censys, SecurityTrails)', defaultEnabled: false },
    { code: 'FLAG_PENTEST_AUTOMATION', name: 'Pentest Automation', description: 'Allow running automated scanners and ingesting results', defaultEnabled: false },
    { code: 'FLAG_AI_ASSISTANT', name: 'AI Assistant', description: 'Enable AI-assisted analysis and report drafting', defaultEnabled: false },
    { code: 'FLAG_COMPLIANCE_EVIDENCE', name: 'Compliance Evidence', description: 'Enable advanced compliance evidence management', defaultEnabled: false }
  ];

  for (const f of featureFlagDefinitions) {
    await prisma.featureFlag.upsert({
      where: { code: f.code },
      update: {},
      create: f
    });
  }

  // Enable the most relevant flags for the demo/pro plan
  const flagsToEnable = ['FLAG_ATTACK_LAB', 'FLAG_OSINT_INTEGRATIONS', 'FLAG_AI_ASSISTANT'];
  for (const code of flagsToEnable) {
    const ff = await prisma.featureFlag.findUnique({ where: { code } });
    if (ff) {
      await prisma.clientFeatureFlag.upsert({
        where: { clientCompanyId_featureFlagId: { clientCompanyId: company.id, featureFlagId: ff.id } },
        update: { enabled: true },
        create: { clientCompanyId: company.id, featureFlagId: ff.id, enabled: true }
      });
    }
  }

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
        message: 'Modeled phishing campaign activity detected at initial access phase.',
        metadata: { mode: 'modeled', nonWeaponizable: true }
      }
    ],
    skipDuplicates: true
  });

  await prisma.clientAsset.createMany({
    data: [
      { clientCompanyId: company.id, type: AssetType.DOMAIN, identifier: 'acmefinance.test', riskLevel: RiskLevel.MEDIUM, metadata: { source: 'demo-seed' } },
      { clientCompanyId: company.id, type: AssetType.APP, identifier: 'customer-portal-demo', riskLevel: RiskLevel.HIGH, metadata: { source: 'demo-seed', note: 'Modeled asset for posture visualization' } },
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
      description: 'Modeled replay of suspicious login pressure against a protected portal. No real credentials, targets, or exploit logic are used.',
      category: 'Identity Security',
      difficulty: AttackDifficulty.BEGINNER
    },
    {
      id: 'scenario-phishing-campaign',
      title: 'Phishing Campaign Readiness Exercise',
      description: 'A recorded awareness scenario showing how phishing indicators become detections and response tasks.',
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
      description: 'Modeled data access anomaly and response exercise focused on detection, escalation, and containment.',
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
        safetyNote: 'Modeled by design for readiness training; no real network activity, payloads, exploit steps, or reusable offensive code.',
        eventTemplate: [
          { phase: 'RECON', severity: 'LOW', description: 'Modeled external signal observed and classified.' },
          { phase: 'INITIAL_ACCESS', severity: 'MEDIUM', description: 'Modeled suspicious access attempt enters detection workflow.' },
          { phase: 'CONTAINMENT', severity: 'LOW', description: 'NaijaShield playbook recommends containment and user notification.' },
          { phase: 'RECOVERY', severity: 'LOW', description: 'Readiness score and follow-up recommendations generated.' }
        ],
        attackerTemplate: { narrative: 'High-level modeled adversary storyline for awareness and readiness review, with no operational attack execution.' },
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
