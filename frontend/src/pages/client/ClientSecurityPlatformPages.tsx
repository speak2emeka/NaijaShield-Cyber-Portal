import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import { Activity, ClipboardCheck, FlaskConical, Gauge, LockKeyhole, Radar, ShieldAlert } from 'lucide-react';
import { DataTable } from '../../components/DataTable';
import { MetricCard } from '../../components/MetricCard';
import { api } from '../../services/api';

const toneForRisk = (risk: string) => risk === 'HIGH' ? 'text-red-300 bg-red-500/10' : risk === 'MEDIUM' ? 'text-yellow-300 bg-yellow-500/10' : 'text-shield-glow bg-shield-glow/10';

export function ClientSecurityPosture() {
  const [data, setData] = useState<any>(null);
  const breakdown = data?.summary?.breakdown || {};

  useEffect(() => {
    api.get('/security-platform/client/security-posture').then(({ data }) => setData(data));
  }, []);

  async function recalculate() {
    await api.post('/security-platform/client/security-posture/recalculate');
    const refreshed = await api.get('/security-platform/client/security-posture');
    setData(refreshed.data);
    toast.success('Security posture recalculated');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-black"><Gauge className="text-shield-glow" />Security Posture</h1>
        <button onClick={recalculate} className="btn-secondary">Recalculate</button>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Current Score" value={data?.summary?.score ?? '...'} />
        <MetricCard label="Incidents" value={breakdown.incidents ?? '-'} tone="gold" />
        <MetricCard label="Response" value={breakdown.response ?? '-'} />
        <MetricCard label="Coverage" value={breakdown.coverage ?? '-'} />
      </div>
      <section className="glass-card p-6">
        <h2 className="text-lg font-bold">Score Trend</h2>
        <div className="mt-5 grid gap-3">
          {(data?.history || []).map((point: any) => (
            <div key={point.id} className="grid items-center gap-3 md:grid-cols-[120px_1fr_70px]">
              <span className="text-sm text-slate-400">{new Date(point.calculatedAt).toLocaleDateString()}</span>
              <div className="h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-shield-glow" style={{ width: `${point.score}%` }} /></div>
              <strong>{point.score}</strong>
            </div>
          ))}
        </div>
      </section>
      <section className="glass-card p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold"><LockKeyhole size={18} />Tenant Encryption Metadata</h2>
        <TenantKey />
      </section>
    </div>
  );
}

function TenantKey() {
  const [key, setKey] = useState<any>(null);
  useEffect(() => { api.get('/security-platform/client/tenant-key').then(({ data }) => setKey(data)); }, []);
  return <div className="mt-4 grid gap-3 text-sm md:grid-cols-3"><p><span className="text-slate-400">Key ID</span><br /><strong>{key?.tenantKeyId || 'Pending'}</strong></p><p><span className="text-slate-400">Provider</span><br /><strong>{key?.provider || 'stub-kms'}</strong></p><p><span className="text-slate-400">Rotation due</span><br /><strong>{key?.rotationDueAt ? new Date(key.rotationDueAt).toLocaleDateString() : 'Scheduled'}</strong></p></div>;
}

export function ClientSecurityEvents() {
  const [events, setEvents] = useState<any[]>([]);
  useEffect(() => { api.get('/security-platform/client/security-events').then(({ data }) => setEvents(data)); }, []);
  return <div className="space-y-4"><h1 className="flex items-center gap-2 text-2xl font-black"><ShieldAlert className="text-shield-glow" />Security Events</h1><DataTable headers={['Type', 'Severity', 'Source', 'Message', 'Date']}>{events.map(event => <tr key={event.id}><td className="px-5 py-4 font-bold">{event.type}</td><td className="px-5 py-4">{event.severity}</td><td className="px-5 py-4">{event.source}</td><td className="px-5 py-4 text-slate-300">{event.message}</td><td className="px-5 py-4">{new Date(event.createdAt).toLocaleString()}</td></tr>)}</DataTable></div>;
}

export function ClientAttackSurface() {
  const [assets, setAssets] = useState<any[]>([]);
  useEffect(() => { api.get('/security-platform/client/assets').then(({ data }) => setAssets(data)); }, []);
  return <div className="space-y-4"><h1 className="flex items-center gap-2 text-2xl font-black"><Radar className="text-shield-glow" />Attack Surface</h1><DataTable headers={['Asset', 'Type', 'Risk', 'Last Seen']}>{assets.map(asset => <tr key={asset.id}><td className="px-5 py-4 font-bold">{asset.identifier}</td><td className="px-5 py-4">{asset.type}</td><td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-black ${toneForRisk(asset.riskLevel)}`}>{asset.riskLevel}</span></td><td className="px-5 py-4">{new Date(asset.lastSeenAt).toLocaleDateString()}</td></tr>)}</DataTable></div>;
}

export function ClientCompliance() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { api.get('/security-platform/client/compliance').then(({ data }) => setItems(data)); }, []);
  async function addEvidence(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    await api.post(`/security-platform/client/compliance/${id}/evidence`, Object.fromEntries(new FormData(event.currentTarget).entries()));
    toast.success('Evidence linked');
  }
  return <div className="space-y-4"><h1 className="flex items-center gap-2 text-2xl font-black"><ClipboardCheck className="text-shield-glow" />Compliance Readiness</h1><div className="grid gap-4 lg:grid-cols-3">{items.map(item => <section key={item.id} className="glass-card p-5"><div className="flex items-center justify-between"><h2 className="text-xl font-black">{item.framework}</h2><strong className="text-shield-glow">{item.score}%</strong></div><p className="mt-1 text-sm text-slate-400">{item.status}</p><div className="mt-4 grid gap-2">{(item.checklist || []).map((check: any) => <p key={check.label} className="flex justify-between gap-3 text-sm"><span>{check.label}</span><span className="font-bold text-slate-300">{check.status}</span></p>)}</div><form onSubmit={event => addEvidence(event, item.id)} className="mt-5 grid gap-2"><input className="input" name="title" placeholder="Evidence title" required /><button className="btn-secondary" type="submit">Link Evidence</button></form></section>)}</div></div>;
}

export function ClientAttackLab() {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [drill, setDrill] = useState<any>(null);
  const [score, setScore] = useState<any>(null);
  useEffect(() => {
    api.get('/security-platform/client/attack-lab/scenarios').then(({ data }) => setScenarios(data));
    api.get('/security-platform/client/attack-lab/runs').then(({ data }) => setRuns(data));
    api.get('/security-platform/client/attack-lab/drill').then(({ data }) => setDrill(data));
  }, []);
  async function start(scenarioId: string) {
    const { data } = await api.post('/security-platform/client/attack-lab/runs', { scenarioId });
    setRuns(current => [data, ...current]);
    toast.success('Safe simulated run created');
  }
  async function scoreDrill() {
    const { data } = await api.post('/security-platform/client/attack-lab/drill/score', { kind: drill.kind, answers: [0, 0] });
    setScore(data);
  }
  return <div className="space-y-6"><h1 className="flex items-center gap-2 text-2xl font-black"><FlaskConical className="text-shield-glow" />Attack Lab</h1><p className="glass-card p-4 text-sm text-slate-300">All Attack Lab activity is synthetic, internal, and non-weaponizable. It produces tabletop timelines and readiness signals only.</p><div className="grid gap-4 lg:grid-cols-2">{scenarios.map(scenario => <section key={scenario.id} className="glass-card p-5"><p className="text-xs font-black uppercase text-shield-glow">{scenario.category} - {scenario.difficulty}</p><h2 className="mt-2 text-xl font-black">{scenario.title}</h2><p className="mt-2 text-sm text-slate-300">{scenario.description}</p><button onClick={() => start(scenario.id)} className="btn-primary mt-4">Start Simulation</button></section>)}</div><section><h2 className="mb-3 flex items-center gap-2 text-xl font-bold"><Activity size={18} />Run History</h2><DataTable headers={['Scenario', 'Outcome', 'Score', 'Date', 'Open']}>{runs.map(run => <tr key={run.id}><td className="px-5 py-4 font-bold">{run.scenario?.title}</td><td className="px-5 py-4">{run.resultSummary?.outcome}</td><td className="px-5 py-4">{run.resultSummary?.readinessScore}</td><td className="px-5 py-4">{new Date(run.startedAt).toLocaleString()}</td><td className="px-5 py-4"><Link className="text-shield-glow hover:underline" to={`/client/attack-lab/runs/${run.id}`}>View</Link></td></tr>)}</DataTable></section>{drill && <section className="glass-card p-5"><h2 className="text-xl font-bold">Incident Response Drill</h2><p className="mt-2 text-sm text-slate-400">{drill.safetyNote}</p><div className="mt-4 grid gap-4">{drill.steps.map((step: any, index: number) => <div key={step.prompt}><p className="font-bold">{index + 1}. {step.prompt}</p><p className="mt-1 text-sm text-slate-300">{step.options.join(' / ')}</p></div>)}</div><button onClick={scoreDrill} className="btn-secondary mt-4">Score Sample Decisions</button>{score && <p className="mt-3 font-bold text-shield-glow">Readiness Score: {score.readinessScore}%</p>}</section>}</div>;
}

export function ClientAttackRunDetail() {
  const { id } = useParams();
  const [run, setRun] = useState<any>(null);
  useEffect(() => { api.get(`/security-platform/client/attack-lab/runs/${id}`).then(({ data }) => setRun(data)); }, [id]);
  if (!run) return <div className="glass-card p-6">Loading simulated run...</div>;
  return <div className="space-y-6"><h1 className="text-2xl font-black">{run.scenario?.title}</h1><div className="grid gap-4 lg:grid-cols-2"><section className="glass-card p-5"><h2 className="text-lg font-bold">Attacker Narrative</h2><p className="mt-2 text-sm text-slate-300">{run.attackerView?.narrative || 'High-level simulated behavior only.'}</p></section><section className="glass-card p-5"><h2 className="text-lg font-bold">Defender Narrative</h2><p className="mt-2 text-sm text-slate-300">{run.defenderView?.narrative || 'Detection and response storytelling only.'}</p></section></div><section className="glass-card p-5"><h2 className="text-lg font-bold">Timeline</h2><div className="mt-5 grid gap-4">{(run.events || []).map((event: any) => <div key={event.id} className="border-l-2 border-shield-glow/60 pl-4"><p className="text-xs font-black uppercase text-shield-glow">{event.phase} - {event.severity}</p><p className="mt-1 text-sm text-slate-300">{event.description}</p></div>)}</div></section></div>;
}
