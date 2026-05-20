import { useEffect, useState } from 'react';
import { MetricCard } from '../../components/MetricCard';
import { api } from '../../services/api';
import { Activity, AlertCircle, Clock, Database, FlaskConical, ShieldAlert } from 'lucide-react';

export function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.get('/admin/dashboard')
      .then(({ data }) => setData(data))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  if (error) {
    return (
      <div className="glass-card border-red-500/30 p-6 flex items-center gap-4">
        <AlertCircle className="text-red-400 flex-shrink-0" size={24} />
        <div>
          <h3 className="font-bold text-red-300">Failed to load admin dashboard</h3>
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
        <div className="glass-card p-6 animate-pulse h-64"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-slate-400">No dashboard data available</p>
      </div>
    );
  }

  const systemHealthMetrics = [
    { label: 'API latency', value: data.systemHealth?.apiLatencyMs ?? 0, max: 500 },
    { label: 'Error rate', value: data.systemHealth?.errorRate ?? 0, max: 100 },
    { label: 'Storage', value: data.systemHealth?.storageUsagePercent ?? 0, max: 100 }
  ];

  return (
    <div className="grid gap-6">
      <section className="glass-card p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-black">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-slate-400">Real-time operations, client health, and security trends for your SOC team.</p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
            <span className="h-2 w-2 rounded-full bg-shield-glow" />
            Live metrics refresh every 5 minutes
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total Clients" value={data.metrics.clients} />
          <MetricCard label="Active Subscriptions" value={data.metrics.subscriptions} />
          <MetricCard label="Open Tickets" value={data.metrics.openTickets} tone="red" />
          <MetricCard label="Pending Requests" value={data.metrics.pendingRequests} tone="gold" />
          <MetricCard label="Trial Accounts" value={data.metrics.trialAccounts ?? 0} />
          <MetricCard label="SLA Breaches" value={data.metrics.slaBreaches ?? 0} tone="red" />
          <MetricCard label="Report Uploads" value={data.metrics.recentReportUploads ?? 0} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <section className="glass-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold"><ShieldAlert size={20} className="text-shield-glow" />Security Posture</h2>
          <p className="text-4xl font-black text-shield-glow">{data.securityPosture?.averageScore ?? 0}</p>
          <p className="mt-1 text-sm text-slate-400">Average client score</p>
          <div className="mt-5 space-y-2 text-sm">
            {(data.securityPosture?.highRiskClients || []).slice(0, 3).map((client: any) => (
              <p key={client.id} className="flex justify-between gap-4">
                <span>{client.clientCompany?.name || 'Unknown client'}</span>
                <strong className="text-red-300">{client.score}</strong>
              </p>
            ))}
          </div>
        </section>

        <section className="glass-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold"><Activity size={20} className="text-shield-glow" />Events Snapshot</h2>
          <p className="text-4xl font-black text-shield-glow">{data.securityEvents?.last24h ?? 0}</p>
          <p className="mt-1 text-sm text-slate-400">Events in the last 24h</p>
          <div className="mt-5 grid gap-3 text-sm">
            {(data.securityEvents?.severityDistribution || []).slice(0, 4).map((item: any) => (
              <div key={item.severity} className="flex items-center justify-between gap-4 rounded-3xl bg-white/5 px-4 py-3">
                <span>{item.severity}</span>
                <strong>{item._count?.severity ?? 0}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold"><FlaskConical size={20} className="text-shield-glow" />Attack Lab</h2>
          <p className="text-4xl font-black text-shield-glow">{data.attackLab?.runs ?? 0}</p>
          <p className="mt-1 text-sm text-slate-400">Product readiness runs</p>
          <div className="mt-5 space-y-2 text-sm">
            {(data.attackLab?.readinessScores || []).slice(0, 3).map((item: any) => (
              <div key={item.client} className="flex justify-between gap-4 rounded-3xl bg-white/5 px-4 py-3">
                <span>{item.client}</span>
                <strong>{item.score}%</strong>
              </div>
            ))}
          </div>
        </section>
      </section>

      <section className="glass-card p-6">
        <div className="mb-5 flex items-center gap-2">
          <Database size={20} className="text-shield-glow" />
          <h2 className="text-xl font-bold">System Health</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          <MetricCard label="Database" value={data.systemHealth?.database ?? 'unknown'} />
          <MetricCard label="Queue" value={data.systemHealth?.queue ?? 'unknown'} />
          <MetricCard label="API Latency" value={`${data.systemHealth?.apiLatencyMs ?? 0}ms`} />
          <MetricCard label="Error Rate" value={`${data.systemHealth?.errorRate ?? 0}%`} tone="red" />
          <MetricCard label="Storage" value={`${data.systemHealth?.storageUsagePercent ?? 0}%`} />
        </div>
        <div className="mt-6 space-y-4">
          {systemHealthMetrics.map(metric => {
            const percent = metric.max > 0 ? Math.min(100, Math.round((metric.value / metric.max) * 100)) : 0;
            return (
              <div key={metric.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>{metric.label}</span>
                  <strong className="text-white">{metric.value}</strong>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="sparkline-bar" style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Clock size={20} className="text-shield-glow" />
          <h2 className="text-xl font-bold">Recent Activity</h2>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {data.recentActivity && data.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {data.recentActivity.map((log: any) => (
                <div 
                  className="rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors cursor-pointer" 
                  key={log.id}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{log.action}</p>
                      <p className="text-xs text-slate-500 mt-1">{new Date(log.createdAt).toLocaleString()}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-shield-green/10 text-shield-green font-bold">Log</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-400 py-8">No activity logged yet</p>
          )}
        </div>
      </section>
    </div>
  );
}
