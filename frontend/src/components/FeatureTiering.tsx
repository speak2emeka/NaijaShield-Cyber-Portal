import type { ElementType, ReactNode } from 'react';
import { useFeatureEnabled } from '../context/PlanContext';
import { Lock, CheckCircle2 } from 'lucide-react';

interface FeatureGateWrapperProps {
  featureCode: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureGateWrapper({ featureCode, children, fallback }: FeatureGateWrapperProps) {
  const enabled = useFeatureEnabled(featureCode);
  
  if (!enabled) {
    return fallback || (
      <div className="opacity-50 cursor-not-allowed pointer-events-none">
        {children}
      </div>
    );
  }
  
  return <>{children}</>;
}

interface PlanBadgeProps {
  planName: string;
  planSlug: string;
}

export function PlanBadge({ planName, planSlug }: PlanBadgeProps) {
  const color: Record<string, { bg: string; text: string }> = {
    'shield-start': { bg: 'bg-blue-100', text: 'text-blue-700' },
    'shield-ops': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    'shield-enterprise': { bg: 'bg-purple-100', text: 'text-purple-700' },
  };
  
  const style = color[planSlug] || { bg: 'bg-gray-100', text: 'text-gray-700' };
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${style.bg} ${style.text}`}>
      <CheckCircle2 className="w-4 h-4" />
      {planName}
    </span>
  );
}

interface TieredModuleGridProps {
  modules: Array<{
    name: string;
    icon: ElementType;
    featureCodes: string[];
    href: string;
  }>;
}

export function TieredModuleGrid({ modules }: TieredModuleGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {modules.map(module => (
        <FeatureGateWrapper
          key={module.name}
          featureCode={module.featureCodes[0]}
          fallback={
            <div className="relative group">
              <div className="opacity-50 pointer-events-none p-4 rounded-lg border border-slate-200 text-center cursor-not-allowed">
                <div className="text-slate-400 mb-2">
                  <module.icon className="mx-auto h-6 w-6" />
                </div>
                <h3 className="text-sm font-medium text-slate-400">{module.name}</h3>
                <p className="text-xs text-slate-500 mt-1">Upgrade to unlock</p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Lock className="w-6 h-6 text-slate-400" />
              </div>
            </div>
          }
        >
          <a
            href={module.href}
            className="p-4 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-slate-900 transition-all text-center group"
          >
            <div className="text-slate-300 mb-2 group-hover:text-emerald-400 transition-colors">
              <module.icon className="mx-auto h-6 w-6" />
            </div>
            <h3 className="text-sm font-medium text-slate-200 group-hover:text-emerald-300 transition-colors">
              {module.name}
            </h3>
          </a>
        </FeatureGateWrapper>
      ))}
    </div>
  );
}

interface FeatureListProps {
  features: Array<{
    code: string;
    name: string;
    description: string;
    included: boolean;
  }>;
}

export function FeatureList({ features }: FeatureListProps) {
  return (
    <div className="space-y-3">
      {features.map(feature => (
        <div
          key={feature.code}
          className={`flex items-start gap-3 p-3 rounded-lg border ${
            feature.included
              ? 'border-emerald-200 bg-emerald-50'
              : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
            feature.included ? 'bg-emerald-500' : 'bg-slate-300'
          }`}>
            {feature.included && <CheckCircle2 className="w-4 h-4 text-white" />}
          </div>
          <div className="flex-1">
            <h4 className={`font-medium ${feature.included ? 'text-emerald-900' : 'text-slate-600'}`}>
              {feature.name}
            </h4>
            <p className={`text-sm mt-1 ${feature.included ? 'text-emerald-800' : 'text-slate-500'}`}>
              {feature.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
