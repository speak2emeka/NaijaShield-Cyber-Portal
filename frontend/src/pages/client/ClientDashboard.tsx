import { useEffect, useState } from 'react';
import { MetricCard } from '../../components/MetricCard';
import { ScoreChart } from '../../components/ScoreChart';
import { api } from '../../services/api';
import { AlertCircle } from 'lucide-react';

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
      <div className="glass-card p-6 text-center">
        <p className="text-slate-400">No dashboard data available</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-black mb-4">Dashboard Overview</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Security score" value={`${data.metrics.securityScore}%`} />
          <MetricCard label="Open tickets" value={data.metrics.openTickets} tone="red" />
          <MetricCard label="Active requests" value={data.metrics.activeRequests} tone="gold" />
          <MetricCard label="Reports" value={data.metrics.reports} />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Security Score Trend</h2>
        <ScoreChart data={data.scores} />
      </div>

      <div>
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
      </div>
    </div>
  );
}
