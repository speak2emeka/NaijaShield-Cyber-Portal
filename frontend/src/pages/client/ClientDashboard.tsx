import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MetricCard } from '../../components/MetricCard';
import { ScoreChart } from '../../components/ScoreChart';
import { api } from '../../services/api';
import { AlertCircle, ShieldCheck, ShieldAlert, Sparkles, ClipboardCheck } from 'lucide-react';
import { usePlan } from '../../context/PlanContext';
import { PlanBadge, TieredModuleGrid, FeatureList } from '../../components/FeatureTiering';

export function ClientDashboard() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.get('/client/dashboard')
      .then(({ data }) => setData(data))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  if (error) {
    return (
      <div className="glass-card border-red-500/30 p-6 flex items-center gap-4">
        <AlertCircle className="text-red-400 flex-shrink-0" size={24} />
        <div>
          <h3 className="font-bold text-red-300">Failed to load dashboard</h3>
          <p className="text-sm text-slate-400 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-5 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-1/2 mb-3"></div>
              <div className="h-8 bg-white/10 rounded"></div>
            </div>
          ))}
        </div>
        <div className="glass-card p-6 animate-pulse h-72"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <section className="glass-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black">Welcome to NaijaShield</h1>
              <p className="mt-2 text-slate-300">Your client portal is ready. Start with one of the actions below to begin tracking posture, compliance, and security operations.</p>
            </div>
            <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm text-slate-300">
              <p className="font-semibold text-shield-glow">Client onboarding</p>
              <p className="mt-2">See posture, open tickets, manage evidence, and launch Attack Lab.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              { icon: ShieldCheck, title: 'Review security posture', description: 'Monitor score, coverage, and response readiness.', to: '/client/security-posture' },
              { icon: ClipboardCheck, title: 'Complete compliance tasks', description: 'Link evidence and validate controls across frameworks.', to: '/client/compliance' },
              { icon: Sparkles, title: 'Launch Attack Lab', description: 'Run readiness exercises and inspect defense timelines.', to: '/client/attack-lab' },
              { icon: ShieldAlert, title: 'Open a ticket', description: 'Create a request with your security operations team.', to: '/client/tickets' }
            ].map(item => (
              <Link key={item.title} to={item.to} className="group rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:border-shield-glow/20 hover:bg-white/10">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-shield-glow">
                  <item.icon size={20} aria-hidden="true" />
                </div>
                <h2 className="mt-4 text-lg font-black group-hover:text-shield-glow">{item.title}</h2>
                <p className="mt-2 text-sm text-slate-400">{item.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    );
  }

  const { plan, features, isLoading: planLoading } = usePlan();
  const modules = [
    { name: 'Security Posture', icon: ShieldCheck, featureCodes: ['SECURITY_POSTURE'], href: '/client/security-posture' },
    { name: 'Security Events', icon: ShieldAlert, featureCodes: ['SECURITY_EVENTS'], href: '/client/security-events' },
    { name: 'Attack Lab', icon: Sparkles, featureCodes: ['ATTACK_LAB'], href: '/client/attack-lab' },
    { name: 'Compliance', icon: ClipboardCheck, featureCodes: ['COMPLIANCE_MANAGEMENT'], href: '/client/compliance' }
  ];

  return (
    <div className="grid gap-6">
      <section className="glass-card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-black">Dashboard Overview</h1>
            <p className="mt-2 text-sm text-slate-400">Your security posture, ticket status, and highest priorities in one view.</p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
            <span className="h-2 w-2 rounded-full bg-shield-glow" />
            Live data updated instantly
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Security score" value={`${data.metrics.securityScore}%`} />
          <MetricCard label="Open tickets" value={data.metrics.openTickets} tone="red" />
          <MetricCard label="Active requests" value={data.metrics.activeRequests} tone="gold" />
          <MetricCard label="Reports" value={data.metrics.reports} />
        </div>
      </section>

      <section className="glass-card p-6 bg-gradient-to-br from-white/5 via-white/10 to-white/5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-black">Your plan</h2>
            <p className="text-sm text-slate-400">Current subscription tier and available security modules.</p>
          </div>
          <div className="flex items-center gap-3">
            {plan ? <PlanBadge planName={plan.name} planSlug={plan.slug} /> : <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">Loading plan</span>}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
          <div>
            <h3 className="text-base font-semibold text-slate-200 mb-3">Available modules</h3>
            <TieredModuleGrid modules={modules} />
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
            <h3 className="text-base font-semibold text-slate-200 mb-3">Feature coverage</h3>
            {planLoading ? (
              <p className="text-sm text-slate-400">Loading plan features...</p>
            ) : (
              <FeatureList features={features.length ? features : [
                { code: 'SECURITY_POSTURE', name: 'Security Posture', description: 'Real-time security assessment', included: true }
              ]} />
            )}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Security Score Trend</h2>
        <ScoreChart data={data.scores} />
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="grid gap-5 lg:grid-cols-3">
          {['tickets', 'requests', 'reports'].map(key => (
            <section className="glass-card p-5" key={key}>
              <h3 className="text-lg font-bold capitalize">{key}</h3>
              <div className="mt-4 grid gap-3 max-h-64 overflow-y-auto">
                {data[key] && data[key].length > 0 ? (
                  data[key].map((item: any) => (
                    <article className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors cursor-pointer" key={item.id}>
                      <strong className="text-sm">{item.title || item.type}</strong>
                      <p className="mt-2 text-xs text-slate-400">{item.description}</p>
                    </article>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">No {key} yet</p>
                )}
              </div>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}
