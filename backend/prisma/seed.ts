import argon2 from 'argon2';
import { PrismaClient, ServiceRequestStatus, ServiceRequestType, SubscriptionStatus, TicketPriority, TicketStatus, UserRole } from '@prisma/client';

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
      contactEmail: 'security@acmefinance.test'
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
