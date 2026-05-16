import { useEffect, useState } from 'react';
import { Activity, FlaskConical, ShieldAlert } from 'lucide-react';
import { DataTable } from '../../components/DataTable';
import { MetricCard } from '../../components/MetricCard';
import { api } from '../../services/api';

export function AdminSecurityEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [query, setQuery] = useState({ type: '', source: '' });

  useEffect(() => {
    const params = new URLSearchParams(Object.entries(query).filter(([, value]) => value));
    api.get(`/security-platform/admin/security-events?${params.toString()}`).then(({ data }) => setEvents(data));
  }, [query]);

  return (
    <div className="space-y-4">
      <h1 className="flex items-center gap-2 text-2xl font-black"><ShieldAlert className="text-shield-glow" />Security Events</h1>
      <div className="glass-card grid gap-3 p-4 md:grid-cols-2">
        <input className="input" placeholder="Event type" value={query.type} onChange={event => setQuery({ ...query, type: event.target.value })} />
        <input className="input" placeholder="Source module" value={query.source} onChange={event => setQuery({ ...query, source: event.target.value })} />
      </div>
      <DataTable headers={['Client', 'Type', 'Severity', 'Source', 'Message', 'Date']}>
        {events.map(event => <tr key={event.id}><td className="px-5 py-4">{event.clientCompany?.name || '-'}</td><td className="px-5 py-4 font-bold">{event.type}</td><td className="px-5 py-4">{event.severity}</td><td className="px-5 py-4">{event.source}</td><td className="px-5 py-4 text-slate-300">{event.message}</td><td className="px-5 py-4">{new Date(event.createdAt).toLocaleString()}</td></tr>)}
      </DataTable>
    </div>
  );
}

export function AdminAttackLabOverview() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { api.get('/security-platform/admin/attack-lab/overview').then(({ data }) => setData(data)); }, []);

  return (
    <div className="space-y-6">
      <h1 className="flex items-center gap-2 text-2xl font-black"><FlaskConical className="text-shield-glow" />Attack Lab Overview</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total Runs" value={data?.runs ?? '...'} />
        <MetricCard label="Scenarios" value={data?.scenarios?.length ?? '...'} />
        <MetricCard label="Mode" value="Simulated" />
      </div>
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-xl font-bold"><Activity size={18} />Scenario Usage</h2>
        <DataTable headers={['Scenario', 'Category', 'Difficulty', 'Runs']}>
          {(data?.scenarios || []).map((scenario: any) => <tr key={scenario.id}><td className="px-5 py-4 font-bold">{scenario.title}</td><td className="px-5 py-4">{scenario.category}</td><td className="px-5 py-4">{scenario.difficulty}</td><td className="px-5 py-4">{scenario._count?.runs || 0}</td></tr>)}
        </DataTable>
      </section>
      <section>
        <h2 className="mb-3 text-xl font-bold">Common Event Types</h2>
        <DataTable headers={['Event Type', 'Count']}>
          {(data?.commonEventTypes || []).map((event: any) => <tr key={event.type}><td className="px-5 py-4 font-bold">{event.type}</td><td className="px-5 py-4">{event._count?.type || 0}</td></tr>)}
        </DataTable>
      </section>
    </div>
  );
}
