import { AttackPhase, SecuritySeverity } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { recordSecurityEvent } from './security-events.service.js';

const safeDrills = {
  phishing: [
    { prompt: 'A user reports a suspicious invoice email. What is the best first action?', options: ['Preserve and report the email', 'Forward it broadly', 'Open the attachment'], answer: 0 },
    { prompt: 'The email reached five users. What should the team do next?', options: ['Disable mail security', 'Notify affected users and check logs', 'Ignore it'], answer: 1 }
  ],
  ransomware: [
    { prompt: 'A workstation shows a simulated ransomware note. What comes first?', options: ['Contain the device', 'Pay immediately', 'Delete all logs'], answer: 0 },
    { prompt: 'Containment is complete. What should be reviewed?', options: ['Backups and identity logs', 'Public social posts', 'Unrelated tickets'], answer: 0 }
  ]
};

export const attackLabService = {
  scenarios() {
    return prisma.attackScenario.findMany({ orderBy: [{ category: 'asc' }, { difficulty: 'asc' }] });
  },

  async startRun(clientCompanyId: string, scenarioId: string) {
    const scenario = await prisma.attackScenario.findUniqueOrThrow({ where: { id: scenarioId } });
    const template = scenario.eventTemplate as Array<{ phase: AttackPhase; severity: SecuritySeverity; description: string }>;
    const run = await prisma.attackRun.create({
      data: {
        clientCompanyId,
        scenarioId,
        finishedAt: new Date(),
        resultSummary: { simulated: true, outcome: 'Detected during simulation', readinessScore: 82 },
        attackerView: scenario.attackerTemplate as never,
        defenderView: scenario.defenderTemplate as never,
        events: {
          create: template.map((event, index) => ({
            phase: event.phase,
            severity: event.severity,
            description: event.description,
            timestamp: new Date(Date.now() + index * 60_000),
            metadata: { simulated: true, safe: true }
          }))
        }
      },
      include: { scenario: true, events: { orderBy: { timestamp: 'asc' } } }
    });
    await recordSecurityEvent({
      module: 'attack-lab',
      action: 'attack_lab.run.completed',
      type: 'ATTACK_LAB_RUN',
      severity: SecuritySeverity.LOW,
      clientCompanyId,
      message: `Safe simulated attack lab run completed: ${scenario.title}`,
      metadata: { runId: run.id, simulated: true }
    });
    return run;
  },

  runs(clientCompanyId: string) {
    return prisma.attackRun.findMany({ where: { clientCompanyId }, include: { scenario: true }, orderBy: { startedAt: 'desc' } });
  },

  runDetail(clientCompanyId: string, id: string) {
    return prisma.attackRun.findFirstOrThrow({ where: { id, clientCompanyId }, include: { scenario: true, events: { orderBy: { timestamp: 'asc' } } } });
  },

  drill(kind = 'phishing') {
    const steps = safeDrills[kind as keyof typeof safeDrills] || safeDrills.phishing;
    return { kind, safetyNote: 'Interactive tabletop drill only. No real attack activity occurs.', steps };
  },

  scoreDrill(kind: string, answers: number[]) {
    const steps = safeDrills[kind as keyof typeof safeDrills] || safeDrills.phishing;
    const correct = steps.filter((step, index) => step.answer === answers[index]).length;
    return { readinessScore: Math.round((correct / steps.length) * 100), recommendations: ['Document escalation paths', 'Preserve evidence early', 'Practice stakeholder communication'] };
  }
};
