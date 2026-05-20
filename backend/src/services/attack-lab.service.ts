import { AttackDifficulty, AttackPhase, SecuritySeverity } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { recordSecurityEvent } from './security-events.service.js';

const drillTemplates = {
  phishing: [
    {
      prompt: 'A user reports a suspicious invoice email with a link to an unfamiliar portal. What should your team do first?',
      options: ['Preserve the email and block the sender', 'Forward the email to all employees', 'Delete the email immediately'],
      answer: 0,
      explanation: 'Preserving the email and blocking the sender preserves evidence while containing the malicious channel.'
    },
    {
      prompt: 'The email was opened by several staff. Which action best supports the investigation?',
      options: ['Collect email headers and inspect access logs', 'Reset all employee passwords immediately', 'Ignore it unless direct impact is confirmed'],
      answer: 0,
      explanation: 'Collecting headers and logs helps verify delivery, phishing infrastructure, and potential compromise scope.'
    },
    {
      prompt: 'A second wave of similar messages is detected. What should be prioritized?',
      options: ['Update email filters and communicate guidance to users', 'Wait for the next alert', 'Open the messages to see the sender'],
      answer: 0,
      explanation: 'Updating filters and user guidance reduces exposure and improves awareness across the organization.'
    }
  ],
  ransomware: [
    {
      prompt: 'An endpoint has a discovered ransom note. What is the most important first step?',
      options: ['Isolate the endpoint and preserve memory', 'Pay the ransom to restore systems', 'Delete suspicious files immediately'],
      answer: 0,
      explanation: 'Isolating the endpoint prevents further spread and preserves forensic evidence for response.'
    },
    {
      prompt: 'Backup integrity is uncertain. What should the response team verify next?',
      options: ['Confirm recent backup consistency before restoration', 'Rebuild systems from scratch without checking backups', 'Continue operations as normal'],
      answer: 0,
      explanation: 'Verifying backups ensures recovery options are valid without introducing further risk.'
    },
    {
      prompt: 'Containment is in progress. What should the team communicate to stakeholders?',
      options: ['Incident status, affected scope, and remediation actions', 'Technical details only to the executive team', 'No information until the incident is fully closed'],
      answer: 0,
      explanation: 'Clear status updates support coordination, trust, and faster recovery.'
    }
  ],
  insider: [
    {
      prompt: 'Unusual data access by a privileged user appears in the logs. What is the safest immediate action?',
      options: ['Review access context and elevate monitoring', 'Disable the user account without investigation', 'Publicly announce the incident'],
      answer: 0,
      explanation: 'Reviewing context before escalation avoids unnecessary disruption while validating potential insider risk.'
    },
    {
      prompt: 'Access anomalies are tied to a single business unit. What should be reviewed first?',
      options: ['Time-based access policies and data flow controls', 'Only the network perimeter devices', 'All unrelated applications'],
      answer: 0,
      explanation: 'Time-based and data flow controls help identify unauthorized lateral or exfiltration behavior.'
    },
    {
      prompt: 'The user transfers sensitive data externally. Which control should be strengthened?',
      options: ['Data loss prevention and segmentation controls', 'Allow all external transfers', 'Remove monitoring to protect privacy'],
      answer: 0,
      explanation: 'DLP and segmentation reduce the chance of data exfiltration from privileged insiders.'
    }
  ]
};

const categoryProfiles = [
  {
    keys: ['phishing'],
    phases: [AttackPhase.RECON, AttackPhase.INITIAL_ACCESS, AttackPhase.LATERAL_MOVEMENT, AttackPhase.CONTAINMENT, AttackPhase.RECOVERY],
    templates: {
      recon: 'A suspicious message was identified by mail filters and user reporting; indicators of phishing infrastructure were validated.',
      initial: 'The recipient engaged with the lure, prompting an authentication challenge that was blocked by adaptive MFA and mailbox protection.',
      lateral: 'Additional access attempts from the same origin triggered account lockouts and identity analytics.',
      containment: 'SOC blocked the sender, updated mail rules, and alerted affected users.',
      recovery: 'Awareness guidance and phishing training were issued to close the loop on the exercise.'
    },
    signals: {
      detection: ['Mail gateway flagged a malicious URL', 'User reported the suspicious email', 'MFA challenge detected anomalous access'],
      defense: ['Blocked sender and quarantined the message', 'Triggered alert to incident response', 'Updated detection rules for the threat cluster']
    },
    outcome: ['Detected before credential exposure', 'Contained during initial access phase', 'Contained after suspicious authentication attempts']
  },
  {
    keys: ['credential', 'brute force', 'password'],
    phases: [AttackPhase.RECON, AttackPhase.INITIAL_ACCESS, AttackPhase.LATERAL_MOVEMENT, AttackPhase.CONTAINMENT, AttackPhase.RECOVERY],
    templates: {
      recon: 'Automated credential probes were observed against the external login portal.',
      initial: 'Unusual username/password combinations triggered risk-based authentication and account throttling.',
      lateral: 'Secondary account usage was blocked by session analytics and MFA enforcement.',
      containment: 'Access was disabled for compromised identities and an emergency password reset was enforced.',
      recovery: 'Authentication policies were strengthened and login activity was reviewed for signs of compromise.'
    },
    signals: {
      detection: ['Account lockout threshold exceeded', 'Risk engine flagged anomalous login behavior', 'IAM analytics detected suspicious credential use'],
      defense: ['Throttled authentication requests', 'Triggered multi-factor enforcement', 'Suspended suspicious sessions']
    },
    outcome: ['Detected at early authentication stage', 'Contained before lateral movement', 'Contained after credential abuse was identified']
  },
  {
    keys: ['web', 'app', 'probing', 'reconnaissance'],
    phases: [AttackPhase.RECON, AttackPhase.INITIAL_ACCESS, AttackPhase.CONTAINMENT, AttackPhase.RECOVERY],
    templates: {
      recon: 'A burst of web application probes was seen against exposed endpoints.',
      initial: 'Unusual query patterns triggered WAF rules and application monitoring alerts.',
      containment: 'Blocking rules and rate limiting were updated to prevent further reconnaissance.',
      recovery: 'Application logs and firewall events were reviewed to harden edge protections.'
    },
    signals: {
      detection: ['WAF blocked suspicious request patterns', 'Application monitoring flagged anomalous traffic', 'Rate limit alarms were triggered'],
      defense: ['Updated edge rules', 'Disabled affected endpoints for validation', 'Enhanced logging and telemetry for the session']
    },
    outcome: ['Detected during reconnaissance', 'Contained before exploitation', 'Contained during application monitoring']
  },
  {
    keys: ['insider', 'data access'],
    phases: [AttackPhase.RECON, AttackPhase.INITIAL_ACCESS, AttackPhase.LATERAL_MOVEMENT, AttackPhase.EXFILTRATION, AttackPhase.CONTAINMENT, AttackPhase.RECOVERY],
    templates: {
      recon: 'A privileged account accessed sensitive records outside of normal business hours.',
      initial: 'Unusual data access patterns triggered the insider threat monitoring system.',
      lateral: 'The account attempted cross-system access and was flagged by identity analytics.',
      exfiltration: 'Large file transfers were blocked by DLP controls before data left the network.',
      containment: 'Access was limited and the user was placed under investigation by security operations.',
      recovery: 'A post-incident review was scheduled and access controls were tightened.'
    },
    signals: {
      detection: ['Insider threat detection flagged abnormal access', 'Data loss prevention blocked a large transfer', 'Identity analytics spotted privilege misuse'],
      defense: ['Restricted the account and required re-authentication', 'Paused outbound transfers', 'Initiated a formal investigation']
    },
    outcome: ['Detected during anomalous access', 'Contained before data exfiltration', 'Contained during identity review']
  }
];

function pick<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function findProfile(category: string) {
  const normalized = category.toLowerCase();
  return categoryProfiles.find(profile => profile.keys.some(key => normalized.includes(key))) || categoryProfiles[0];
}

function buildRunScenario(scenario: { title: string; description: string; category: string; difficulty: AttackDifficulty }) {
  const profile = findProfile(scenario.category || scenario.title);
  const difficultyWeight = scenario.difficulty === AttackDifficulty.ADVANCED ? 0.75 : scenario.difficulty === AttackDifficulty.INTERMEDIATE ? 0.9 : 1;
  const detectionIndex = Math.min(profile.phases.length - 2, Math.max(1, Math.floor((1 + Math.random() * 2) * difficultyWeight)));
  const detectedPhase = profile.phases[detectionIndex];
  const recommendations = new Set<string>();

  if (profile.keys.includes('phishing')) {
    recommendations.add('Review email gateway filtering and user awareness coverage.');
    recommendations.add('Confirm MFA enforcement on all remote and privileged access.');
  }
  if (profile.keys.includes('credential')) {
    recommendations.add('Enforce account lockout and adaptive authentication for external logins.');
    recommendations.add('Audit service accounts and privileged credential usage.');
  }
  if (profile.keys.includes('web')) {
    recommendations.add('Harden web application firewalls and monitor anomalous requests.');
    recommendations.add('Validate input handling and endpoint exposure policies.');
  }
  if (profile.keys.includes('insider')) {
    recommendations.add('Strengthen DLP controls and privileged account monitoring.');
    recommendations.add('Enforce least privilege and access reviews for sensitive records.');
  }
  recommendations.add('Document escalation steps and refine incident response playbooks.');

  const scoreBase = 50;
  const detectionBonus = (profile.phases.length - detectionIndex) * 12;
  const difficultyPenalty = scenario.difficulty === AttackDifficulty.ADVANCED ? 16 : scenario.difficulty === AttackDifficulty.INTERMEDIATE ? 8 : 0;
  const readinessScore = clamp(scoreBase + detectionBonus - difficultyPenalty + (Math.random() * 8 - 4));
  const outcome = profile.outcome[Math.min(profile.outcome.length - 1, detectionIndex)];

  const attackerView = {
    narrative: `A modeled ${scenario.title.toLowerCase()} campaign targeted the client environment using non-weaponized reconnaissance and access attempts. The exercise is designed to validate detection, containment, and recovery controls without executing offensive artifacts.`
  };

  const defenderView = {
    narrative: `The defensive team identified suspicious activity through layered telemetry, coordinated containment actions, and generated follow-up controls to improve readiness. The scenario exercised alerting, escalation, and recovery procedures.`
  };

  let currentTime = Date.now();
  const events = profile.phases.map((phase, index) => {
    const step = phase === AttackPhase.RECOVERY ? profile.templates.recovery
      : phase === AttackPhase.CONTAINMENT ? profile.templates.containment
      : phase === AttackPhase.EXFILTRATION ? profile.templates.exfiltration
      : phase === AttackPhase.LATERAL_MOVEMENT ? profile.templates.lateral
      : phase === AttackPhase.INITIAL_ACCESS ? profile.templates.initial
      : profile.templates.recon;

    const description = step || 'A modeled defensive signal was observed and logged for readiness review.';
    const severity = phase === AttackPhase.RECOVERY || phase === AttackPhase.RECON ? SecuritySeverity.LOW : phase === AttackPhase.EXFILTRATION ? SecuritySeverity.HIGH : SecuritySeverity.MEDIUM;
    const detectionSignal = pick(profile.signals.detection);
    const defensiveSignal = pick(profile.signals.defense);
    const analystAction = phase === AttackPhase.CONTAINMENT ? 'Applied containment playbook and updated controls.' : 'Correlated alerts and escalated to SOC analysts.';

    const event = {
      phase,
      severity,
      description,
      timestamp: new Date(currentTime),
      metadata: {
        detectionSignal,
        defensiveSignal,
        analystAction,
        runStage: phase,
        safe: true
      }
    };

    currentTime += 90_000 + Math.floor(Math.random() * 120_000);
    return event;
  });

  return {
    events,
    readinessScore,
    detectedPhase,
    outcome,
    recommendations: Array.from(recommendations),
    attackerView,
    defenderView
  };
}

export const attackLabService = {
  scenarios() {
    return prisma.attackScenario.findMany({ orderBy: [{ category: 'asc' }, { difficulty: 'asc' }] });
  },

  createScenario(data: { title: string; description: string; category: string; difficulty?: AttackDifficulty | string; safetyNote?: string; eventTemplate?: unknown; attackerTemplate?: unknown; defenderTemplate?: unknown }) {
    return prisma.attackScenario.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        difficulty: (data.difficulty as never) || AttackDifficulty.BEGINNER,
        safetyNote: data.safetyNote || 'Modeled for readiness training with no live attack execution or offensive artifacts.',
        eventTemplate: (data.eventTemplate as never) || [],
        attackerTemplate: (data.attackerTemplate as never) || { narrative: 'A safe adversary narrative used for operational readiness review.' },
        defenderTemplate: (data.defenderTemplate as never) || { narrative: 'A defensive response narrative used to validate detection and incident response.' }
      }
    });
  },

  updateScenario(id: string, data: Partial<{ title: string; description: string; category: string; difficulty: string; safetyNote: string; eventTemplate: unknown; attackerTemplate: unknown; defenderTemplate: unknown }>) {
    return prisma.attackScenario.update({ where: { id }, data: data as never });
  },

  deleteScenario(id: string) {
    return prisma.attackScenario.delete({ where: { id } });
  },

  async startRun(clientCompanyId: string, scenarioId: string) {
    const scenario = await prisma.attackScenario.findUniqueOrThrow({ where: { id: scenarioId } });
    const runModel = buildRunScenario({
      title: scenario.title,
      description: scenario.description,
      category: scenario.category,
      difficulty: scenario.difficulty
    });

    const createdRun = await prisma.attackRun.create({
      data: {
        clientCompanyId,
        scenarioId,
        finishedAt: new Date(runModel.events[runModel.events.length - 1].timestamp),
        resultSummary: {
          outcome: runModel.outcome,
          readinessScore: runModel.readinessScore,
          detectedPhase: runModel.detectedPhase,
          recommendations: runModel.recommendations
        },
        attackerView: runModel.attackerView,
        defenderView: runModel.defenderView,
        events: {
          create: runModel.events.map(event => ({
            phase: event.phase,
            severity: event.severity,
            description: event.description,
            timestamp: event.timestamp,
            metadata: event.metadata as never
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
      message: `Attack Lab run completed: ${scenario.title}`,
      metadata: { runId: createdRun.id, detectedPhase: runModel.detectedPhase, outcome: runModel.outcome }
    });

    return createdRun;
  },

  runs(clientCompanyId: string) {
    return prisma.attackRun.findMany({ where: { clientCompanyId }, include: { scenario: true }, orderBy: { startedAt: 'desc' } });
  },

  allRuns(filters: { scenarioId?: string; clientCompanyId?: string }) {
    return prisma.attackRun.findMany({
      where: { scenarioId: filters.scenarioId, clientCompanyId: filters.clientCompanyId },
      include: { scenario: true, clientCompany: { select: { id: true, name: true } }, events: { orderBy: { timestamp: 'asc' } } },
      orderBy: { startedAt: 'desc' },
      take: 100
    });
  },

  adminRunDetail(id: string) {
    return prisma.attackRun.findUniqueOrThrow({
      where: { id },
      include: { scenario: true, clientCompany: { select: { id: true, name: true } }, events: { orderBy: { timestamp: 'asc' } } }
    });
  },

  async analytics() {
    const [scenarios, phases, runs] = await Promise.all([
      prisma.attackScenario.findMany({ include: { _count: { select: { runs: true } } }, orderBy: { title: 'asc' } }),
      prisma.attackEvent.groupBy({ by: ['phase'], _count: { phase: true }, orderBy: { _count: { phase: 'desc' } } }),
      prisma.attackRun.findMany({ select: { startedAt: true, resultSummary: true, clientCompany: { select: { name: true } } }, orderBy: { startedAt: 'asc' } })
    ]);
    return {
      scenarios,
      phases,
      readinessScores: runs.map(run => ({ client: run.clientCompany.name, score: Number(((run.resultSummary || {}) as Record<string, unknown>).readinessScore || 0) })),
      monthlyActivity: runs.reduce<Record<string, number>>((acc, run) => {
        const key = run.startedAt.toISOString().slice(0, 7);
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})
    };
  },

  runDetail(clientCompanyId: string, id: string) {
    return prisma.attackRun.findFirstOrThrow({ where: { id, clientCompanyId }, include: { scenario: true, events: { orderBy: { timestamp: 'asc' } } } });
  },

  drill(kind = 'phishing') {
    const steps = drillTemplates[kind as keyof typeof drillTemplates] || drillTemplates.phishing;
    return { kind, safetyNote: 'Interactive readiness drill is built for response practice; no actual attacks are launched.', steps };
  },

  scoreDrill(kind: string, answers: number[]) {
    const steps = drillTemplates[kind as keyof typeof drillTemplates] || drillTemplates.phishing;
    const details = steps.map((step, index) => ({
      prompt: step.prompt,
      selected: answers[index] ?? -1,
      correct: step.answer === answers[index],
      explanation: step.explanation
    }));
    const correctCount = details.filter(detail => detail.correct).length;
    const readinessScore = clamp(40 + correctCount * 18 + (Math.random() * 6 - 3));
    const recommendations = [
      'Follow incident response playbook ownership and evidence preservation.',
      'Validate alert correlation and escalation procedures against the scenario.',
      'Update tabletop exercises based on any gaps identified in the drill.'
    ];
    return { readinessScore, recommendations, details };
  }
};
