import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Activity, Download, FlaskConical, Search, ShieldAlert } from 'lucide-react';
import { DataTable } from '../../components/DataTable';
import { MetricCard } from '../../components/MetricCard';
import { api } from '../../services/api';

function rows(data: any) {
  return Array.isArray(data) ? data : data?.items || [];
}

export function AdminSecurityEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [selected, setSelected] = useState<any>(null);
  const [query, setQuery] = useState({ type: '', source: '', severity: '', search: '' });

  useEffect(() => {
    const params = new URLSearchParams(Object.entries(query).filter(([, value]) => value));
    api.get(`/admin/security-events?${params.toString()}`).then(({ data }) => {
      setEvents(rows(data));
      setAnalytics(Array.isArray(data) ? null : data.analytics);
    });
  }, [query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-black"><ShieldAlert className="text-shield-glow" />Security Events</h1>
        <a className="btn-secondary" href="/api/admin/security-events/export.csv"><Download size={16} />Export CSV</a>
      </div>
      <div className="glass-card grid gap-3 p-4 md:grid-cols-4">
        <input className="input" placeholder="Search message" value={query.search} onChange={event => setQuery({ ...query, search: event.target.value })} />
        <input className="input" placeholder="Event type" value={query.type} onChange={event => setQuery({ ...query, type: event.target.value })} />
        <input className="input" placeholder="Source module" value={query.source} onChange={event => setQuery({ ...query, source: event.target.value })} />
        <select className="input" value={query.severity} onChange={event => setQuery({ ...query, severity: event.target.value })}><option value="">All severity</option><option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>CRITICAL</option></select>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Visible Events" value={events.length} />
        <MetricCard label="Severity Buckets" value={analytics?.severityDistribution?.length ?? '-'} />
        <MetricCard label="Correlations" value={analytics?.correlations ? Object.keys(analytics.correlations).length : '-'} />
      </div>
      <DataTable headers={['Client', 'Type', 'Severity', 'Source', 'Message', 'Date']}>
        {events.map(event => <tr key={event.id} onClick={() => setSelected(event)} className="cursor-pointer hover:bg-white/5"><td className="px-5 py-4">{event.clientCompany?.name || '-'}</td><td className="px-5 py-4 font-bold">{event.type}</td><td className="px-5 py-4">{event.severity}</td><td className="px-5 py-4">{event.source}</td><td className="px-5 py-4 text-slate-300">{event.message}</td><td className="px-5 py-4">{new Date(event.createdAt).toLocaleString()}</td></tr>)}
      </DataTable>
      {selected && <section className="glass-card p-5"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">Event Detail</h2><button className="btn-secondary" onClick={() => setSelected(null)}>Close</button></div><pre className="mt-4 overflow-auto rounded-lg bg-black/30 p-4 text-xs text-slate-200">{JSON.stringify(selected, null, 2)}</pre></section>}
    </div>
  );
}

export function AdminAttackLabOverview() {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [selectedRun, setSelectedRun] = useState<any>(null);

  async function refresh() {
    const [scenarioRes, runRes, analyticsRes] = await Promise.all([
      api.get('/admin/attack-lab/scenarios'),
      api.get('/admin/attack-lab/runs'),
      api.get('/admin/attack-lab/analytics')
    ]);
    setScenarios(rows(scenarioRes.data));
    setRuns(rows(runRes.data));
    setAnalytics(analyticsRes.data);
  }

  useEffect(() => { refresh(); }, []);

  async function createScenario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await api.post('/admin/attack-lab/scenarios', Object.fromEntries(new FormData(event.currentTarget).entries()));
    toast.success('Attack Lab scenario created');
    event.currentTarget.reset();
    refresh();
  }

  return (
    <div className="space-y-6">
      <h1 className="flex items-center gap-2 text-2xl font-black"><FlaskConical className="text-shield-glow" />Attack Lab Admin</h1>
      <p className="glass-card p-4 text-sm text-slate-300">Admin-managed Attack Lab scenarios are product-ready exercises built for operational readiness. They generate realistic defensive timelines and health signals without live exploitation, payloads, scanning, or offensive attack instructions.</p>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Scenarios" value={scenarios.length} />
        <MetricCard label="Runs" value={runs.length} />
        <MetricCard label="Phases" value={analytics?.phases?.length ?? '-'} />
        <MetricCard label="Mode" value="Operational" />
      </div>
      <section className="glass-card p-5">
        <h2 className="mb-4 text-xl font-bold">Create Scenario</h2>
        <form onSubmit={createScenario} className="grid gap-3 lg:grid-cols-5">
          <input className="input" name="title" placeholder="Title" required />
          <input className="input" name="category" placeholder="phishing / probing" required />
          <select className="input" name="difficulty"><option>BEGINNER</option><option>INTERMEDIATE</option><option>ADVANCED</option></select>
          <input className="input" name="description" placeholder="Safe defensive description" required />
          <button className="btn-primary" type="submit">Create</button>
        </form>
      </section>
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-xl font-bold"><Activity size={18} />Scenario Management</h2>
        <DataTable headers={['Scenario', 'Category', 'Difficulty', 'Runs']}>
          {scenarios.map(scenario => <tr key={scenario.id}><td className="px-5 py-4 font-bold">{scenario.title}</td><td className="px-5 py-4">{scenario.category}</td><td className="px-5 py-4">{scenario.difficulty}</td><td className="px-5 py-4">{scenario._count?.runs || 0}</td></tr>)}
        </DataTable>
      </section>
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-xl font-bold"><Search size={18} />Run Replay</h2>
        <DataTable headers={['Client', 'Scenario', 'Outcome', 'Score', 'Date']}>
          {runs.map(run => <tr key={run.id} onClick={() => setSelectedRun(run)} className="cursor-pointer hover:bg-white/5"><td className="px-5 py-4">{run.clientCompany?.name || '-'}</td><td className="px-5 py-4 font-bold">{run.scenario?.title}</td><td className="px-5 py-4">{run.resultSummary?.outcome}</td><td className="px-5 py-4">{run.resultSummary?.readinessScore}</td><td className="px-5 py-4">{new Date(run.startedAt).toLocaleString()}</td></tr>)}
        </DataTable>
      </section>
      {selectedRun && (
        <section className="glass-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Run Replay</h2>
              <p className="mt-2 text-sm text-slate-400">{selectedRun.clientCompany?.name || 'Unknown client'} · {selectedRun.scenario?.title}</p>
            </div>
            <button className="btn-secondary" onClick={() => setSelectedRun(null)}>Close</button>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs uppercase text-slate-500">Readiness</p>
              <p className="mt-2 text-2xl font-black text-shield-glow">{selectedRun.resultSummary?.readinessScore ?? '-'}%</p>
              <p className="mt-2 text-sm text-slate-300">{selectedRun.resultSummary?.outcome || 'Outcome not available'}</p>
              <p className="mt-3 text-xs uppercase text-slate-500">Detected Phase</p>
              <p className="mt-1 text-sm text-slate-300">{selectedRun.resultSummary?.detectedPhase || 'N/A'}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 lg:col-span-2">
              <h3 className="text-sm uppercase text-slate-500">Recommendations</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
                {(selectedRun.resultSummary?.recommendations || []).map((item: string) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <h3 className="text-sm uppercase text-slate-500">Attacker Narrative</h3>
              <p className="mt-2 text-sm text-slate-300">{selectedRun.attackerView?.narrative || 'No attacker narrative available.'}</p>
            </section>
            <section className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <h3 className="text-sm uppercase text-slate-500">Defender Narrative</h3>
              <p className="mt-2 text-sm text-slate-300">{selectedRun.defenderView?.narrative || 'No defender narrative available.'}</p>
            </section>
          </div>
          <div className="mt-5">
            <h3 className="text-lg font-bold">Timeline</h3>
            <div className="mt-4 space-y-4">
              {(selectedRun.events || []).map((event: any) => (
                <div key={event.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-black uppercase text-shield-glow">{event.phase}</p>
                    <span className="rounded-full bg-slate-900 px-2 py-1 text-[11px] uppercase text-slate-300">{event.severity}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{event.description}</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-900 p-3 text-xs text-slate-400"><strong className="text-slate-200">Detection</strong><p className="mt-1">{event.metadata?.detectionSignal || 'N/A'}</p></div>
                    <div className="rounded-xl bg-slate-900 p-3 text-xs text-slate-400"><strong className="text-slate-200">Defensive signal</strong><p className="mt-1">{event.metadata?.defensiveSignal || 'N/A'}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
