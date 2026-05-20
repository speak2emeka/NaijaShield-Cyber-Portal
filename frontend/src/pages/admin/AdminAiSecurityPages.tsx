import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Bot, ClipboardList, FileText, GitBranch, Loader2, Radar, SearchCode, ShieldAlert, UploadCloud } from 'lucide-react';
import { DataTable } from '../../components/DataTable';
import { MetricCard } from '../../components/MetricCard';
import { api } from '../../services/api';

function JsonPanel({ data }: { data: unknown }) {
  return <pre className="max-h-[460px] overflow-auto rounded-lg bg-black/30 p-4 text-xs text-slate-200">{JSON.stringify(data, null, 2)}</pre>;
}

function useData<T>(url: string, fallback: T) {
  const [data, setData] = useState<T>(fallback);
  const refresh = () => api.get(url).then(({ data }) => setData(data));
  useEffect(() => { refresh(); }, [url]);
  return { data, refresh };
}

export function AiSecurityAssistant() {
  const actions = [
    {
      id: 'threat-model',
      label: 'Threat Model',
      endpoint: '/admin/ai/threat-model',
      payload: { architecture: { name: 'NaijaShield client portal', stack: ['React', 'Express', 'PostgreSQL'] }, assets: [{ identifier: 'client-portal', type: 'APP', riskLevel: 'MEDIUM' }] }
    },
    {
      id: 'attack-surface',
      label: 'Attack Surface',
      endpoint: '/admin/ai/attack-surface/analyze',
      payload: { assets: [{ identifier: 'client-portal', type: 'APP', riskLevel: 'MEDIUM' }, { identifier: 'reports-api', type: 'APP', riskLevel: 'HIGH' }] }
    },
    {
      id: 'test-cases',
      label: 'Test Cases',
      endpoint: '/admin/ai/test-cases/generate',
      payload: { threats: [{ category: 'Spoofing', component: 'Login' }, { category: 'Information Disclosure', component: 'Reports API' }] }
    },
    {
      id: 'vuln-analysis',
      label: 'Vuln Analysis',
      endpoint: '/admin/ai/vuln/analyze',
      payload: { category: 'Security misconfiguration', logs: 'Demo scan output: missing HSTS header, verbose error page observed in staging.' }
    }
  ];
  const [active, setActive] = useState(actions[0].id);
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function run(actionId: string) {
    const action = actions.find(item => item.id === actionId) || actions[0];
    setActive(action.id);
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post(action.endpoint, action.payload);
      setOutput(data);
    } catch (err: any) {
      setError(err.userMessage || 'AI workflow failed. Please try again.');
      setOutput(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { run(active); }, []);

  const testCases = output?.testCases || [];
  return <div className="space-y-6"><h1 className="flex items-center gap-2 text-2xl font-black"><Bot className="text-shield-glow" />AI Security Assistant</h1><div className="grid gap-3 md:grid-cols-4" role="tablist" aria-label="AI Security Assistant tools">{actions.map(action => <button key={action.id} type="button" role="tab" aria-selected={active === action.id} className={active === action.id ? 'btn-primary' : 'btn-secondary'} onClick={() => run(action.id)}>{loading && active === action.id ? <Loader2 className="animate-spin" size={16} /> : null}{action.label}</button>)}</div>{error && <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">{error}</div>}{loading && <div className="glass-card flex items-center gap-3 p-5 text-slate-300"><Loader2 className="animate-spin text-shield-glow" /> Running {actions.find(item => item.id === active)?.label}...</div>}{!loading && active === 'test-cases' && testCases.length > 0 && <div className="grid gap-4 lg:grid-cols-2">{testCases.map((item: any) => <article key={item.id} className="glass-card p-5"><span className="badge badge-warning">{item.severity}</span><h2 className="mt-3 text-lg font-black">{item.objective}</h2><p className="mt-2 text-sm text-slate-300">{item.expectedBehavior}</p><p className="mt-3 text-xs text-slate-400">Preconditions: {item.preconditions?.join(', ') || '-'}</p><p className="mt-2 text-xs text-slate-400">Indicators: {item.indicatorsOfVulnerability?.join(', ') || '-'}</p></article>)}</div>}{!loading && output && active !== 'test-cases' && <JsonPanel data={output} />}</div>;
}

export function ThreatModelViewer() {
  const [model, setModel] = useState<any>(null);
  useEffect(() => { api.post('/admin/ai/threat-model', { architecture: { name: 'Customer portal' }, assets: [{ identifier: 'reports-api', type: 'APP' }] }).then(({ data }) => setModel(data)); }, []);
  return <div className="space-y-6"><h1 className="flex items-center gap-2 text-2xl font-black"><GitBranch className="text-shield-glow" />Threat Model Viewer</h1><div className="grid gap-4 md:grid-cols-3"><MetricCard label="Risk Score" value={model?.riskSummary?.score ?? '...'} /><MetricCard label="Threats" value={model?.threats?.length ?? 0} /><MetricCard label="Attack Paths" value={model?.attackPaths?.length ?? 0} /></div><div className="grid gap-4 lg:grid-cols-2"><section className="glass-card p-5"><h2 className="mb-3 text-lg font-bold">Threat Graph</h2>{(model?.threats || []).map((item: any) => <div key={item.id} className="mb-3 rounded-lg border border-white/10 p-3"><strong>{item.category}</strong><p className="text-sm text-slate-300">{item.component}</p></div>)}</section><section className="glass-card p-5"><h2 className="mb-3 text-lg font-bold">Attack Paths</h2>{(model?.attackPaths || []).map((path: any) => <div key={path.id} className="mb-3 rounded-lg border border-white/10 p-3"><strong>{path.name}</strong><p className="text-sm text-slate-300">{path.steps.join(' -> ')}</p></div>)}</section></div></div>;
}

export function AttackSurfaceDashboard() {
  const [surface, setSurface] = useState<any>(null);
  useEffect(() => { api.post('/admin/ai/attack-surface/analyze', { assets: [{ identifier: 'customer-portal', type: 'APP', riskLevel: 'MEDIUM' }, { identifier: 'production-cloud', type: 'CLOUD', riskLevel: 'HIGH' }] }).then(({ data }) => setSurface(data)); }, []);
  return <div className="space-y-6"><h1 className="flex items-center gap-2 text-2xl font-black"><Radar className="text-shield-glow" />Attack Surface Dashboard</h1><MetricCard label="High Risk Components" value={surface?.summary?.highRiskComponents ?? 0} /><DataTable headers={['Asset', 'Classification', 'Risk', 'Recon Steps']}>{(surface?.assets || []).map((asset: any) => <tr key={asset.identifier}><td className="px-5 py-4 font-bold">{asset.identifier}</td><td className="px-5 py-4">{asset.classification}</td><td className="px-5 py-4">{asset.riskLevel}</td><td className="px-5 py-4">{asset.suggestedReconSteps?.join(', ')}</td></tr>)}</DataTable></div>;
}

export function TestCaseLibrary() {
  const [cases, setCases] = useState<any[]>([]);
  useEffect(() => { api.post('/admin/ai/test-cases/generate', { threats: [{ category: 'Spoofing', component: 'Login' }, { category: 'Information Disclosure', component: 'Reports API' }] }).then(({ data }) => setCases(data.testCases || [])); }, []);
  return <div className="space-y-6"><h1 className="flex items-center gap-2 text-2xl font-black"><ClipboardList className="text-shield-glow" />Test Case Library</h1><div className="grid gap-4 lg:grid-cols-2">{cases.map(item => <article key={item.id} className="glass-card p-5"><span className="badge badge-warning">{item.severity}</span><h2 className="mt-3 text-lg font-black">{item.objective}</h2><p className="mt-2 text-sm text-slate-300">{item.expectedBehavior}</p><p className="mt-3 text-xs text-slate-400">Indicators: {item.indicatorsOfVulnerability?.join(', ')}</p></article>)}</div></div>;
}

export function ScanResultsDashboard() {
  const { data, refresh } = useData<any[]>('/admin/scans/results', []);
  async function runScan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await api.post('/admin/scans/run', Object.fromEntries(new FormData(event.currentTarget).entries()));
    toast.success('Scan job queued');
    refresh();
  }
  return <div className="space-y-6"><h1 className="flex items-center gap-2 text-2xl font-black"><SearchCode className="text-shield-glow" />Scan Results</h1><form onSubmit={runScan} className="glass-card grid gap-3 p-4 md:grid-cols-4"><select className="input" name="tool"><option>ZAP</option><option>NMAP</option><option>SEMGREP</option><option>DEPENDENCY</option></select><input className="input" name="target" placeholder="Approved target" required /><input className="input" name="clientCompanyId" placeholder="Client ID optional" /><button className="btn-primary" type="submit">Queue Scan</button></form><DataTable headers={['Tool', 'Target', 'Status', 'Client', 'Summary']}>{data.map((run: any) => <tr key={run.id}><td className="px-5 py-4 font-bold">{run.tool}</td><td className="px-5 py-4">{run.target}</td><td className="px-5 py-4">{run.status}</td><td className="px-5 py-4">{run.clientCompany?.name || '-'}</td><td className="px-5 py-4">{JSON.stringify(run.summary?.counts || run.summary || {})}</td></tr>)}</DataTable></div>;
}

export function VulnerabilityAnalysisWorkspace() {
  const [result, setResult] = useState<any>(null);
  async function analyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { data } = await api.post('/admin/ai/vuln/analyze', Object.fromEntries(new FormData(event.currentTarget).entries()));
    setResult(data);
  }
  return <div className="space-y-6"><h1 className="flex items-center gap-2 text-2xl font-black"><ShieldAlert className="text-shield-glow" />Vulnerability Analysis</h1><form onSubmit={analyze} className="glass-card grid gap-3 p-5"><input className="input" name="category" placeholder="Finding category" /><textarea className="input min-h-32" name="logs" placeholder="Paste logs, responses, scan output, or notes" /><button className="btn-primary" type="submit">Analyze</button></form>{result && <JsonPanel data={result} />}</div>;
}

export function EvidenceManager() {
  const { data, refresh } = useData<any[]>('/admin/evidence', []);
  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await api.post('/admin/evidence/upload', new FormData(event.currentTarget));
    toast.success('Evidence saved');
    refresh();
  }
  return <div className="space-y-6"><h1 className="flex items-center gap-2 text-2xl font-black"><UploadCloud className="text-shield-glow" />Evidence Manager</h1><form onSubmit={upload} className="glass-card grid gap-3 p-4 md:grid-cols-5"><input className="input" name="title" placeholder="Title" required /><select className="input" name="type"><option>SCREENSHOT</option><option>LOG</option><option>NOTE</option><option>REQUEST</option><option>RESPONSE</option><option>OTHER</option></select><input className="input" name="tags" placeholder="tags" /><input className="input" name="evidence" type="file" /><button className="btn-primary" type="submit">Upload</button></form><DataTable headers={['Title', 'Type', 'Tags', 'Finding', 'Date']}>{data.map((item: any) => <tr key={item.id}><td className="px-5 py-4 font-bold">{item.title}</td><td className="px-5 py-4">{item.type}</td><td className="px-5 py-4">{item.tags?.join(', ')}</td><td className="px-5 py-4">{item.findingRef || '-'}</td><td className="px-5 py-4">{new Date(item.createdAt).toLocaleString()}</td></tr>)}</DataTable></div>;
}

export function ReportBuilder() {
  const [report, setReport] = useState<any>(null);
  async function generate() {
    const { data } = await api.post('/admin/ai/report/generate', { findings: [{ title: 'Authorization review item', severity: 'MEDIUM' }], evidence: [], testCases: [] });
    setReport(data);
  }
  return <div className="space-y-6"><h1 className="flex items-center gap-2 text-2xl font-black"><FileText className="text-shield-glow" />Report Builder</h1><button className="btn-primary" onClick={generate}>Generate Report Draft</button>{report && <JsonPanel data={report} />}</div>;
}

export function CiSecuritySummary() {
  const { data, refresh } = useData<any[]>('/admin/ci/security-summary', []);
  async function submit() {
    await api.post('/admin/ci/security-results', { repository: 'NaijaShield-Cyber-Portal', branch: 'main', findings: [] });
    toast.success('CI result submitted');
    refresh();
  }
  return <div className="space-y-6"><h1 className="flex items-center gap-2 text-2xl font-black"><GitBranch className="text-shield-glow" />CI/CD Security Summary</h1><button className="btn-primary" onClick={submit}>Submit Demo CI Result</button><DataTable headers={['Repository', 'Branch', 'Score', 'Status', 'Date']}>{data.map((item: any) => <tr key={item.id}><td className="px-5 py-4 font-bold">{item.repository}</td><td className="px-5 py-4">{item.branch}</td><td className="px-5 py-4">{item.score}</td><td className="px-5 py-4">{item.status}</td><td className="px-5 py-4">{new Date(item.createdAt).toLocaleString()}</td></tr>)}</DataTable></div>;
}
