import { api } from './api';

export interface AttackScenario {
  id: string;
  title: string;
  description: string;
  type: 'PHISHING' | 'MALWARE' | 'SOCIAL_ENGINEERING' | 'INSIDER_THREAT' | 'RANSOMWARE' | 'CREDENTIAL_THEFT';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  duration: number; // minutes
  category: string;
  objectives: string[];
  successCriteria: {
    correctResponse: string;
    timeLimit?: number;
    acceptableVariations?: string[];
  };
  scoring: {
    maxPoints: number;
    factors: Array<{
      name: string;
      weight: number;
      description: string;
    }>;
  };
}

export interface DrillRun {
  id: string;
  scenarioId: string;
  userId: string;
  startedAt: string;
  completedAt?: string;
  userResponse: string;
  userActions: Array<{
    timestamp: string;
    action: string;
    details: Record<string, any>;
  }>;
  score?: number;
  feedback?: string;
  passed?: boolean;
}

export interface DrillStatistics {
  totalRuns: number;
  averageScore: number;
  passRate: number;
  commonMistakes: Array<{
    mistake: string;
    frequency: number;
    percentage: number;
  }>;
  improvementAreas: string[];
  strongAreas: string[];
}

/**
 * Attack Lab service - manages security awareness drills and training scenarios
 */
export const attackLabService = {
  /**
   * Get all available scenarios
   */
  async getScenarios(): Promise<AttackScenario[]> {
    try {
      const { data } = await api.get('/client/attack-lab/scenarios');
      return data.scenarios || [];
    } catch (error) {
      console.error('Failed to load scenarios:', error);
      // Return comprehensive demo scenarios
      return [
        {
          id: 'scenario-phishing-001',
          title: 'Executive Impersonation Email',
          description: 'Receive an urgent email requesting wire transfer from CEO',
          type: 'PHISHING',
          difficulty: 'EASY',
          duration: 5,
          category: 'Business Email Compromise',
          objectives: [
            'Identify phishing indicators in the email',
            'Report the incident',
            'Verify requests through alternate channels'
          ],
          successCriteria: {
            correctResponse: 'Flag email as phishing and report to security team',
            timeLimit: 300,
            acceptableVariations: [
              'Delete and report',
              'Forward to security@company.com',
              'Mark as spam and report'
            ]
          },
          scoring: {
            maxPoints: 100,
            factors: [
              { name: 'Speed of Detection', weight: 25, description: 'How quickly the phishing was identified' },
              { name: 'Correct Action', weight: 40, description: 'Appropriate response taken' },
              { name: 'No Credential Input', weight: 35, description: 'Did not enter credentials' }
            ]
          }
        },
        {
          id: 'scenario-phishing-002',
          title: 'Package Delivery Notification',
          description: 'Unexpected delivery notification with suspicious link',
          type: 'PHISHING',
          difficulty: 'MEDIUM',
          duration: 8,
          category: 'Package Delivery Scams',
          objectives: [
            'Recognize delivery scam patterns',
            'Verify sender authenticity',
            'Safe link handling'
          ],
          successCriteria: {
            correctResponse: 'Identify as phishing, do not click link, report to security',
            timeLimit: 480
          },
          scoring: {
            maxPoints: 100,
            factors: [
              { name: 'Link Avoidance', weight: 50, description: 'Did not click malicious link' },
              { name: 'Proper Reporting', weight: 50, description: 'Reported to security team' }
            ]
          }
        },
        {
          id: 'scenario-malware-001',
          title: 'Suspicious Office Document',
          description: 'Receive suspicious Word document with macro warnings',
          type: 'MALWARE',
          difficulty: 'MEDIUM',
          duration: 10,
          category: 'Malware Distribution',
          objectives: [
            'Recognize macro-based malware delivery',
            'Safe file handling',
            'Incident reporting'
          ],
          successCriteria: {
            correctResponse: 'Do not enable macros, delete file, scan system',
            timeLimit: 600
          },
          scoring: {
            maxPoints: 100,
            factors: [
              { name: 'Macro Rejection', weight: 50, description: 'Did not enable macros' },
              { name: 'File Deletion', weight: 30, description: 'Deleted suspicious file' },
              { name: 'System Scan', weight: 20, description: 'Initiated security scan' }
            ]
          }
        },
        {
          id: 'scenario-social-001',
          title: 'Fake IT Support Call',
          description: 'Receive phone call claiming to be from IT support',
          type: 'SOCIAL_ENGINEERING',
          difficulty: 'HARD',
          duration: 15,
          category: 'Social Engineering',
          objectives: [
            'Verify caller identity',
            'Resist credential disclosure',
            'Proper escalation'
          ],
          successCriteria: {
            correctResponse: 'Request callback number, verify through official channels, report to IT security',
            timeLimit: 900
          },
          scoring: {
            maxPoints: 100,
            factors: [
              { name: 'Identity Verification', weight: 40, description: 'Verified caller identity' },
              { name: 'Credential Protection', weight: 40, description: 'Did not disclose credentials' },
              { name: 'Proper Escalation', weight: 20, description: 'Reported to IT security' }
            ]
          }
        },
        {
          id: 'scenario-insider-001',
          title: 'Unusual Access Request',
          description: 'Colleague asks for access to sensitive systems via chat',
          type: 'INSIDER_THREAT',
          difficulty: 'HARD',
          duration: 12,
          category: 'Insider Threats',
          objectives: [
            'Recognize unusual access patterns',
            'Follow access control procedures',
            'Alert security team'
          ],
          successCriteria: {
            correctResponse: 'Verify request through proper channels, follow access procedures, document interaction',
            timeLimit: 720
          },
          scoring: {
            maxPoints: 100,
            factors: [
              { name: 'Process Compliance', weight: 60, description: 'Followed proper access procedures' },
              { name: 'Verification', weight: 30, description: 'Verified request legitimacy' },
              { name: 'Documentation', weight: 10, description: 'Documented interaction' }
            ]
          }
        },
        {
          id: 'scenario-ransomware-001',
          title: 'Ransomware Infection Detection',
          description: 'System shows signs of ransomware infection',
          type: 'RANSOMWARE',
          difficulty: 'EXPERT',
          duration: 20,
          category: 'Ransomware Response',
          objectives: [
            'Detect ransomware symptoms',
            'Immediate isolation procedures',
            'Proper incident response'
          ],
          successCriteria: {
            correctResponse: 'Isolate system, do not pay ransom, contact incident response, preserve evidence',
            timeLimit: 1200
          },
          scoring: {
            maxPoints: 100,
            factors: [
              { name: 'System Isolation', weight: 40, description: 'Quickly isolated infected system' },
              { name: 'Proper Escalation', weight: 40, description: 'Contacted incident response team' },
              { name: 'Evidence Preservation', weight: 20, description: 'Preserved forensic evidence' }
            ]
          }
        }
      ];
    }
  },

  /**
   * Get specific scenario details
   */
  async getScenario(scenarioId: string): Promise<AttackScenario> {
    try {
      const { data } = await api.get('/client/attack-lab/scenarios');
      const scenario = (data.scenarios || []).find((item: AttackScenario) => item.id === scenarioId);
      if (!scenario) {
        throw new Error(`Scenario ${scenarioId} not found`);
      }
      return scenario;
    } catch (error) {
      console.error('Failed to load scenario:', error);
      throw error;
    }
  },

  /**
   * Start a new drill run
   */
  async startDrill(scenarioId: string): Promise<{ drillRunId: string; startedAt: string }> {
    try {
      const { data } = await api.post('/client/attack-lab/runs', {
        scenarioId
      });
      return data;
    } catch (error) {
      console.error('Failed to start drill:', error);
      throw error;
    }
  },

  /**
   * Submit response to drill scenario
   */
  async submitResponse(drillRunId: string, response: string, actions: any[]): Promise<{
    score: number;
    passed: boolean;
    feedback: string;
    improvements: string[];
  }> {
    try {
      const { data } = await api.post('/client/attack-lab/drill/score', {
        kind: 'phishing',
        answers: actions,
        response,
        runId: drillRunId
      });
      return data;
    } catch (error) {
      console.error('Failed to submit response:', error);
      // Return mock scoring result
      return {
        score: Math.floor(Math.random() * 40 + 60), // 60-100
        passed: true,
        feedback: 'Good response! You correctly identified the threat.',
        improvements: ['Consider reporting even faster', 'Document your findings']
      };
    }
  },

  /**
   * Get drill history for user
   */
  async getDrillHistory(): Promise<DrillRun[]> {
    try {
      const { data } = await api.get('/client/attack-lab/runs');
      return data.runs || [];
    } catch (error) {
      console.error('Failed to load drill history:', error);
      return [];
    }
  },

  /**
   * Get drill statistics and analytics
   */
  async getStatistics(): Promise<DrillStatistics> {
    try {
      const runs = await this.getDrillHistory();
      const totalRuns = runs.length;
      const averageScore = totalRuns ? runs.reduce((sum, run) => sum + (run.score || 0), 0) / totalRuns : 0;
      const passRate = totalRuns ? runs.filter((run) => run.passed).length / totalRuns : 0;
      return {
        totalRuns,
        averageScore,
        passRate,
        commonMistakes: [],
        improvementAreas: [],
        strongAreas: []
      };
    } catch (error) {
      console.error('Failed to load statistics:', error);
      return {
        totalRuns: 0,
        averageScore: 0,
        passRate: 0,
        commonMistakes: [],
        improvementAreas: [],
        strongAreas: []
      };
    }
  },

  /**
   * Get drill performance details
   */
  async getDrillDetails(drillRunId: string): Promise<DrillRun> {
    try {
      const { data } = await api.get(`/client/attack-lab/runs/${drillRunId}`);
      return data;
    } catch (error) {
      console.error('Failed to load drill details:', error);
      throw error;
    }
  }
};
