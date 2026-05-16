import { useEffect, useState } from 'react';
import { MetricCard } from '../../components/MetricCard';
import { api } from '../../services/api';
import { AlertCircle, Clock } from 'lucide-react';

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

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-black mb-4">Admin Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total Clients" value={data.metrics.clients} />
          <MetricCard label="Active Subscriptions" value={data.metrics.subscriptions} />
          <MetricCard label="Open Tickets" value={data.metrics.openTickets} tone="red" />
          <MetricCard label="Pending Requests" value={data.metrics.pendingRequests} tone="gold" />
        </div>
      </div>

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
