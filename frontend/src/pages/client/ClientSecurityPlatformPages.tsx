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
  useEffect(() => { api.get('/client/security-events').then(({ data }) => setEvents(Array.isArray(data) ? data : data.items || [])); }, []);
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
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState({ startup: true, run: false, drill: false, score: false });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(prev => ({ ...prev, startup: true }));
    Promise.all([
      api.get('/security-platform/client/attack-lab/scenarios'),
      api.get('/security-platform/client/attack-lab/runs'),
      api.get('/security-platform/client/attack-lab/drill')
    ]).then(([scenarioRes, runRes, drillRes]) => {
      setScenarios(scenarioRes.data);
      setRuns(runRes.data);
      setDrill(drillRes.data);
      setSelectedAnswers(Array(drillRes.data?.steps?.length || 0).fill(-1));
      setError(null);
    }).catch(() => {
      setError('Unable to load Attack Lab data.');
    }).finally(() => {
      setLoading(prev => ({ ...prev, startup: false }));
    });
  }, []);

  async function start(scenarioId: string) {
    try {
      setLoading(prev => ({ ...prev, run: true }));
      const { data } = await api.post('/security-platform/client/attack-lab/runs', { scenarioId });
      setRuns(current => [data, ...current.filter(run => run.id !== data.id)]);
      toast.success('Attack Lab run created');
    } catch {
      toast.error('Failed to create run.');
    } finally {
      setLoading(prev => ({ ...prev, run: false }));
    }
  }

  async function submitDrill() {
    if (!drill) return;
    try {
      setLoading(prev => ({ ...prev, score: true }));
      const { data } = await api.post('/security-platform/client/attack-lab/drill/score', { kind: drill.kind, answers: selectedAnswers });
      setScore(data);
      setError(null);
    } catch {
      setError('Unable to score drill.');
    } finally {
      setLoading(prev => ({ ...prev, score: false }));
    }
  }

  function updateAnswer(index: number, choice: number) {
    setSelectedAnswers(current => {
      const next = [...current];
      next[index] = choice;
      return next;
    });
  }

  if (loading.startup) {
    return <div className="glass-card p-6">Loading Attack Lab...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-black"><FlaskConical className="text-shield-glow" />Attack Lab</h1>
        <span className="rounded-full bg-slate-900 px-4 py-2 text-sm text-slate-200">{runs.length} runs available</span>
      </div>
      {error && <div className="glass-card border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-200">{error}</div>}
      <p className="glass-card p-4 text-sm text-slate-300">Attack Lab is a production-grade security readiness product that generates realistic defense timelines, readiness signals, and response guidance while avoiding offensive exploit execution.</p>
      <div className="grid gap-4 lg:grid-cols-2">
        {scenarios.map(scenario => (
          <section key={scenario.id} className="glass-card p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase text-shield-glow">{scenario.category} · {scenario.difficulty}</p>
              <span className="rounded-full bg-slate-900 px-2 py-1 text-[11px] uppercase text-slate-300">Real run</span>
            </div>
            <h2 className="mt-2 text-xl font-black">{scenario.title}</h2>
            <p className="mt-3 text-sm text-slate-300">{scenario.description}</p>
            <button disabled={loading.run} onClick={() => start(scenario.id)} className="btn-primary mt-5">{loading.run ? 'Launching...' : 'Launch Run'}</button>
          </section>
        ))}
      </div>
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-xl font-bold"><Activity size={18} />Run History</h2>
        <DataTable headers={['Scenario', 'Outcome', 'Score', 'Detected', 'Date', 'Open']}>
          {runs.map(run => (
            <tr key={run.id} className="hover:bg-white/5">
              <td className="px-5 py-4 font-bold">{run.scenario?.title}</td>
              <td className="px-5 py-4">{run.resultSummary?.outcome}</td>
              <td className="px-5 py-4">{run.resultSummary?.readinessScore}%</td>
              <td className="px-5 py-4">{run.resultSummary?.detectedPhase || 'N/A'}</td>
              <td className="px-5 py-4">{new Date(run.startedAt).toLocaleString()}</td>
              <td className="px-5 py-4"><Link className="text-shield-glow hover:underline" to={`/client/attack-lab/runs/${run.id}`}>View</Link></td>
            </tr>
          ))}
        </DataTable>
      </section>
      {drill && (
        <section className="glass-card p-5">
          <h2 className="text-xl font-bold">Incident Response Drill</h2>
          <p className="mt-2 text-sm text-slate-400">{drill.safetyNote}</p>
          <form className="mt-5 space-y-5" onSubmit={event => { event.preventDefault(); submitDrill(); }}>
            {drill.steps.map((step: any, index: number) => (
              <div key={step.prompt} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <p className="font-bold text-slate-100">{index + 1}. {step.prompt}</p>
                <div className="mt-3 space-y-2">
                  {step.options.map((option: string, optionIndex: number) => (
                    <label key={option} className="flex items-center gap-3 text-sm text-slate-300">
                      <input type="radio" name={`drill-${index}`} checked={selectedAnswers[index] === optionIndex} onChange={() => updateAnswer(index, optionIndex)} className="accent-shield-glow" />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading.score} className="btn-secondary">{loading.score ? 'Scoring...' : 'Submit Drill'}</button>
          </form>
          {score && (
            <div className="mt-5 space-y-4 rounded-2xl border border-slate-800 bg-slate-950 p-5">
              <p className="text-lg font-bold text-shield-glow">Readiness Score: {score.readinessScore}%</p>
              <div className="space-y-2">
                <h3 className="text-sm uppercase text-slate-500">Recommendations</h3>
                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">{score.recommendations.map((item: string) => <li key={item}>{item}</li>)}</ul>
              </div>
              <div className="space-y-4">
                {score.details.map((detail: any, detailIndex: number) => (
                  <div key={detail.prompt} className="rounded-xl border border-slate-800 bg-slate-900 p-3">
                    <p className="font-bold text-slate-100">{detail.prompt}</p>
                    <p className="mt-1 text-sm text-slate-300">Selected answer: <span className="font-semibold text-slate-100">{detail.selected >= 0 ? drill.steps[detailIndex].options[detail.selected] : 'No selection'}</span></p>
                    <p className="mt-1 text-sm text-slate-300">{detail.correct ? 'Correct' : 'Needs improvement'}</p>
                    <p className="mt-2 text-sm text-slate-400">{detail.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export function ClientAttackRunDetail() {
  const { id } = useParams();
  const [run, setRun] = useState<any>(null);
  const [loadingRun, setLoadingRun] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoadingRun(true);
    api.get(`/security-platform/client/attack-lab/runs/${id}`).then(({ data }) => {
      setRun(data);
      setError(null);
    }).catch(() => {
      setError('Unable to load run details.');
    }).finally(() => {
      setLoadingRun(false);
    });
  }, [id]);

  if (loadingRun) return <div className="glass-card p-6">Loading Attack Lab run...</div>;
  if (error) return <div className="glass-card p-6 text-red-200">{error}</div>;
  if (!run) return <div className="glass-card p-6">Run not found.</div>;

  const summary = run.resultSummary || {};
  const eventRows = run.events || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">{run.scenario?.title}</h1>
          <p className="mt-2 text-sm text-slate-400">{run.scenario?.category} · {run.scenario?.difficulty} · Started {new Date(run.startedAt).toLocaleString()}</p>
        </div>
        <div className="rounded-2xl bg-slate-900 px-4 py-3 text-sm text-slate-300">
          <p className="font-bold text-shield-glow">Readiness {summary.readinessScore}%</p>
          <p>{summary.outcome}</p>
          <p>Detected: {summary.detectedPhase || 'Unknown'}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="glass-card p-5 lg:col-span-2">
          <h2 className="text-lg font-bold">Timeline</h2>
          <div className="mt-5 space-y-4">
            {eventRows.map((event: any) => (
              <div key={event.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase text-shield-glow">{event.phase}</p>
                    <p className="mt-1 text-[11px] text-slate-500">{new Date(event.timestamp).toLocaleString()}</p>
                  </div>
                  <span className="rounded-full bg-slate-900 px-2 py-1 text-[11px] uppercase text-slate-300">{event.severity}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{event.description}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-900 p-3 text-xs text-slate-400"><strong className="text-slate-200">Detection</strong><p className="mt-1">{event.metadata?.detectionSignal}</p></div>
                  <div className="rounded-xl bg-slate-900 p-3 text-xs text-slate-400"><strong className="text-slate-200">Defensive signal</strong><p className="mt-1">{event.metadata?.defensiveSignal}</p></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card p-5 space-y-5">
          <div>
            <h2 className="text-lg font-bold">Attacker Narrative</h2>
            <p className="mt-2 text-sm text-slate-300">{run.attackerView?.narrative}</p>
          </div>
          <div>
            <h2 className="text-lg font-bold">Defender Narrative</h2>
            <p className="mt-2 text-sm text-slate-300">{run.defenderView?.narrative}</p>
          </div>
          <div>
            <h2 className="text-lg font-bold">Recommendations</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
              {(summary.recommendations || []).map((item: string) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
