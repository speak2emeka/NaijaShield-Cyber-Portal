import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

export interface Plan {
  id: string;
  slug: string;
  name: string;
  priceMonthly: number;
  currency: string;
  description: string;
  features: Feature[];
}

export interface Feature {
  id: string;
  code: string;
  name: string;
  description: string;
  included: boolean;
}

export interface ClientPlan {
  plan: Plan | null;
  features: Feature[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

type PlanContextValue = ClientPlan;

const PlanContext = createContext<PlanContextValue | undefined>(undefined);

export function PlanProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await api.get('/client/plan');
      setPlan(data.plan);
      setFeatures(data.features || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plan');
      // Fallback demo data
      setPlan({
        id: 'demo-ops',
        slug: 'shield-ops',
        name: 'ShieldOps',
        priceMonthly: 350000,
        currency: 'NGN',
        description: 'Comprehensive security platform with events and attack lab',
        features: [
          { id: 'f1', code: 'SECURITY_POSTURE', name: 'Security Posture', description: 'Real-time security assessment', included: true },
          { id: 'f2', code: 'SECURITY_EVENTS', name: 'Security Events', description: 'Event monitoring and alerting', included: true },
          { id: 'f3', code: 'ATTACK_LAB', name: 'Attack Lab', description: 'Security awareness training', included: true },
          { id: 'f4', code: 'EXTERNAL_SECURITY', name: 'External Security', description: 'OSINT and threat intelligence', included: true },
        ]
      });
      setFeatures([
        { id: 'f1', code: 'SECURITY_POSTURE', name: 'Security Posture', description: 'Real-time security assessment', included: true },
        { id: 'f2', code: 'SECURITY_EVENTS', name: 'Security Events', description: 'Event monitoring and alerting', included: true },
        { id: 'f3', code: 'ATTACK_LAB', name: 'Attack Lab', description: 'Security awareness training', included: true },
        { id: 'f4', code: 'EXTERNAL_SECURITY', name: 'External Security', description: 'OSINT and threat intelligence', included: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo(() => ({ plan, features, isLoading, error, refresh }), [plan, features, isLoading, error]);
  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error('usePlan must be used inside PlanProvider');
  return ctx;
}

export function useFeatureEnabled(featureCode: string): boolean {
  const { features } = usePlan();
  return features.some(f => f.code === featureCode && f.included);
}

export function useModuleAccess(featureCodes: string[]): boolean {
  const { features } = usePlan();
  return featureCodes.some(code => features.some(f => f.code === code && f.included));
}
