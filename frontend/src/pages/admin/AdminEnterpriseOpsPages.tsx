import { FormEvent, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  AlertTriangle,
  Briefcase,
  CalendarClock,
  HeartHandshake,
  Mail,
  MonitorCog,
  PhoneCall,
  Repeat,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Timer
} from 'lucide-react';
import { DataTable } from '../../components/DataTable';
import { MetricCard } from '../../components/MetricCard';
import { api } from '../../services/api';

function useData<T>(url: string, fallback: T) {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refresh = () => {
    setLoading(true);
    setError('');
    return api.get(url)
      .then(({ data }) => setData(data))
      .catch((err: any) => setError(err.userMessage || 'Unable to load data'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { refresh(); }, [url]);
  return { data, loading, error, refresh };
}

function isoLocal(hoursFromNow = 1) {
  const date = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
  date.setMinutes(0, 0, 0);
  return date.toISOString().slice(0, 16);
}

export function ManagementOverview() {
  const { data } = useData<any>('/admin/management/overview', null);
  return <div className="space-y-6"><h1 className="flex items-center gap-2 text-2xl font-black"><MonitorCog className="text-shield-glow" />System Health</h1><div className="grid gap-4 md:grid-cols-6"><MetricCard label="Staff" value={data?.staff ?? 0} /><MetricCard label="Shifts" value={data?.shifts ?? 0} /><MetricCard label="Meetings" value={data?.meetings ?? 0} /><MetricCard label="CRM Buckets" value={data?.csr?.length ?? 0} /><MetricCard label="SOC States" value={data?.soc?.length ?? 0} /><MetricCard label="Pentest States" value={data?.pentests?.length ?? 0} /></div></div>;
}

export function StaffScheduling() {
  const { data, refresh } = useData<any[]>('/admin/shifts', []);
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await api.post('/admin/shifts', Object.fromEntries(new FormData(event.currentTarget).entries()));
    toast.success('Shift scheduled');
    refresh();
  }
  return <div className="space-y-6"><h1 className="flex items-center gap-2 text-2xl font-black"><CalendarClock className="text-shield-glow" />Scheduling & Shifts</h1><form onSubmit={create} className="glass-card grid gap-3 p-4 md:grid-cols-6"><input className="input" name="userId" placeholder="Staff user ID" required /><select className="input" name="shiftType"><option>DAY</option><option>SWING</option><option>NIGHT</option><option>ON_CALL</option></select><input className="input" name="startsAt" type="datetime-local" required /><input className="input" name="endsAt" type="datetime-local" required /><input className="input" name="handoverNotes" placeholder="Handover notes" /><button className="btn-primary" type="submit">Schedule</button></form><DataTable headers={['Staff', 'Shift', 'Starts', 'Ends', 'On Call', 'Handover']}>{data.map((shift: any) => <tr key={shift.id}><td className="px-5 py-4 font-bold">{shift.user?.name}</td><td className="px-5 py-4">{shift.shiftType}</td><td className="px-5 py-4">{new Date(shift.startsAt).toLocaleString()}</td><td className="px-5 py-4">{new Date(shift.endsAt).toLocaleString()}</td><td className="px-5 py-4">{shift.onCall ? 'Yes' : 'No'}</td><td className="px-5 py-4">{shift.handoverNotes}</td></tr>)}</DataTable></div>;
}

export function CSRDashboard() {
  const { data: records, refresh: refreshRecords } = useData<any[]>('/admin/csr', []);
  const { data: dashboard, refresh: refreshDashboard } = useData<any>('/admin/csr/dashboard', null);
  const { data: health, refresh: refreshHealth } = useData<any[]>('/admin/csr/health', []);
  const { data: sla, refresh: refreshSla } = useData<any[]>('/admin/csr/sla', []);
  const { data: renewals, refresh: refreshRenewals } = useData<any[]>('/admin/crm/renewals', []);
  const { data: messages, refresh: refreshMessages } = useData<any[]>('/admin/messages', []);
  const { data: meetings, refresh: refreshMeetings } = useData<any[]>('/admin/meetings', []);
  const { data: contacts, refresh: refreshContacts } = useData<any[]>('/admin/crm/contacts', []);
  const { data: tasks, refresh: refreshTasks } = useData<any[]>('/admin/crm/tasks', []);
  const { data: lifecycle, refresh: refreshLifecycle } = useData<any[]>('/admin/crm/lifecycle', []);
  const { data: timeline, refresh: refreshTimeline } = useData<any[]>('/admin/crm/timeline', []);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState('');

  const selectedClientId = editing?.clientCompany?.id || editing?.clientCompanyId || records[0]?.clientCompany?.id || records[0]?.clientCompanyId || '';
  const metrics = dashboard?.metrics || {};
  const clientOptions = useMemo(() => records.map((item: any, index) => ({
    id: item.clientCompany?.id || item.clientCompanyId || `company-${index + 1}`,
    name: item.clientCompany?.name || `Client ${index + 1}`
  })), [records]);

  function refreshAll() {
    refreshRecords();
    refreshDashboard();
    refreshHealth();
    refreshSla();
    refreshMessages();
    refreshMeetings();
    refreshContacts();
    refreshTasks();
    refreshLifecycle();
    refreshRenewals();
    refreshTimeline();
  }

  async function saveRelationship(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await api.post('/admin/csr', Object.fromEntries(new FormData(event.currentTarget).entries()));
    toast.success(editing ? 'CRM account updated' : 'CRM account created');
    setEditing(null);
    refreshAll();
  }

  async function logCommunication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await api.post('/admin/messages', Object.fromEntries(new FormData(event.currentTarget).entries()));
    toast.success('Communication logged');
    event.currentTarget.reset();
    refreshMessages();
  }

  async function scheduleMeeting(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await api.post('/admin/meetings', Object.fromEntries(new FormData(event.currentTarget).entries()));
    toast.success('Meeting scheduled');
    event.currentTarget.reset();
    refreshMeetings();
    refreshDashboard();
    refreshTimeline();
  }

  async function addContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await api.post('/admin/crm/contacts', Object.fromEntries(new FormData(event.currentTarget).entries()));
    toast.success('CRM contact saved');
    event.currentTarget.reset();
    refreshContacts();
    refreshTimeline();
  }

  async function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await api.post('/admin/crm/tasks', Object.fromEntries(new FormData(event.currentTarget).entries()));
    toast.success('CRM task created');
    event.currentTarget.reset();
    refreshTasks();
    refreshDashboard();
    refreshTimeline();
  }

  async function addLifecycle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await api.post('/admin/crm/lifecycle', Object.fromEntries(new FormData(event.currentTarget).entries()));
    toast.success('Lifecycle event added');
    event.currentTarget.reset();
    refreshLifecycle();
    refreshTimeline();
  }

  async function addRenewal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await api.post('/admin/crm/renewals', Object.fromEntries(new FormData(event.currentTarget).entries()));
    toast.success('Renewal opportunity saved');
    event.currentTarget.reset();
    refreshRenewals();
  }

  const visibleRecords = records.filter((item: any) => `${item.clientCompany?.name || ''} ${item.health} ${item.onboardingStage} ${item.slaStatus}`.toLowerCase().includes(search.toLowerCase()));
  const stages = ['ONBOARDING', 'IMPLEMENTATION', 'ADOPTION', 'QBR', 'RENEWAL', 'EXPANSION'];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-black"><HeartHandshake className="text-shield-glow" />Client CRM Command Center</h1>
        <span className="rounded-full border border-shield-glow/30 bg-shield-glow/10 px-3 py-1 text-xs font-black uppercase text-shield-glow">Customer Relationship Management</span>
      </div>

      <div className="grid gap-4 md:grid-cols-4 xl:grid-cols-7">
        <MetricCard label="Health Score" value={metrics.averageHealth ?? 0} />
        <MetricCard label="Open Tickets" value={metrics.openTickets ?? 0} />
        <MetricCard label="Escalations" value={metrics.escalations ?? 0} />
        <MetricCard label="SLA Breaches" value={metrics.slaBreaches ?? 0} />
        <MetricCard label="Meetings" value={metrics.upcomingMeetings ?? 0} />
        <MetricCard label="Renewal Risks" value={metrics.renewalRisks ?? 0} />
        <MetricCard label="CSAT/NPS" value={metrics.satisfactionScore ?? 0} />
      </div>

      <div className="glass-card flex flex-wrap items-center gap-3 p-4">
        <input className="input max-w-md" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search CRM accounts by client, health, stage, or SLA" />
        <span className="text-sm text-slate-400">{visibleRecords.length} account(s) visible</span>
        <span className="rounded-full bg-white/5 px-3 py-2 text-sm text-slate-300">{tasks.filter((task: any) => task.status !== 'DONE').length} open task(s)</span>
      </div>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="glass-card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-black"><Sparkles className="text-shield-glow" />AI CRM Assistant</h2>
          <p className="text-sm text-slate-300">{dashboard?.assistant?.summary || 'Client signals are being monitored from tickets, meetings, messages, posture, compliance, and subscription records.'}</p>
          <div className="mt-4 grid gap-2">{(dashboard?.assistant?.nextActions || []).map((action: string) => <p key={action} className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">{action}</p>)}</div>
        </div>

        <form key={editing?.id || 'new-crm-account'} onSubmit={saveRelationship} className="glass-card grid gap-3 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-black">{editing ? 'Edit Client CRM Account' : 'Create Client CRM Account'}</h2>
            {editing && <button type="button" className="btn-secondary py-2" onClick={() => setEditing(null)}>New</button>}
          </div>
          <input className="input" name="clientCompanyId" placeholder="Client company ID" required defaultValue={selectedClientId} />
          <select className="input" name="health" defaultValue={editing?.health || 'GREEN'}><option>GREEN</option><option>AMBER</option><option>RED</option></select>
          <input className="input" name="onboardingStage" placeholder="Lifecycle stage: Onboarding / Implementation / Adoption / QBR / Renewal" defaultValue={editing?.onboardingStage || ''} />
          <select className="input" name="slaStatus" defaultValue={editing?.slaStatus || 'ON_TRACK'}><option>ON_TRACK</option><option>AT_RISK</option><option>BREACHED</option></select>
          <input className="input" name="feedbackScore" type="number" min="0" max="100" placeholder="CSAT/NPS 0-100" defaultValue={editing?.feedbackScore ?? ''} />
          <input className="input" name="renewalDate" type="date" defaultValue={editing?.renewalDate ? new Date(editing.renewalDate).toISOString().slice(0, 10) : ''} />
          <textarea className="input min-h-24" name="notes" placeholder="Account notes, renewal risk, adoption blockers, upsell context" defaultValue={editing?.notes || ''} />
          <button className="btn-primary" type="submit">{editing ? 'Save Account Changes' : 'Create CRM Account'}</button>
        </form>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <form onSubmit={logCommunication} className="glass-card grid gap-3 p-5">
          <h2 className="flex items-center gap-2 text-lg font-black"><PhoneCall className="text-shield-glow" />Communication Log</h2>
          <select className="input" name="clientCompanyId" defaultValue={selectedClientId}>{clientOptions.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}</select>
          <select className="input" name="channel"><option>PORTAL</option><option>EMAIL</option><option>CALL</option><option>MEETING_NOTE</option><option>FOLLOW_UP</option></select>
          <input className="input" name="subject" placeholder="Subject" required />
          <textarea className="input min-h-28" name="body" placeholder="Call notes, email summary, client concern, drafted follow-up, action items" required />
          <button className="btn-primary" type="submit">Log Communication</button>
        </form>

        <form onSubmit={scheduleMeeting} className="glass-card grid gap-3 p-5">
          <h2 className="flex items-center gap-2 text-lg font-black"><CalendarClock className="text-shield-glow" />Meeting & Scheduling Center</h2>
          <select className="input" name="clientCompanyId" defaultValue={selectedClientId}>{clientOptions.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}</select>
          <select className="input" name="type"><option>CLIENT</option><option>QBR</option><option>COMPLIANCE_AUDIT</option><option>INCIDENT_REVIEW</option><option>PENTEST_PLANNING</option></select>
          <input className="input" name="title" placeholder="Meeting title" required />
          <input className="input" name="startsAt" type="datetime-local" defaultValue={isoLocal(24)} required />
          <input className="input" name="endsAt" type="datetime-local" defaultValue={isoLocal(25)} required />
          <input className="input" name="attendees" placeholder="Attendees, comma-separated" />
          <textarea className="input min-h-24" name="notes" placeholder="Agenda, minutes, action items, QBR prep, calendar sync notes" />
          <button className="btn-primary" type="submit">Schedule Meeting</button>
        </form>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <form onSubmit={addContact} className="glass-card grid gap-3 p-5">
          <h2 className="text-lg font-black">Contact Management</h2>
          <select className="input" name="clientCompanyId" defaultValue={selectedClientId}>{clientOptions.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}</select>
          <input className="input" name="name" placeholder="Contact name" required />
          <input className="input" name="email" type="email" placeholder="email@client.com" required />
          <input className="input" name="phone" placeholder="Phone" />
          <input className="input" name="title" placeholder="Title" />
          <select className="input" name="role"><option>SECURITY_LEAD</option><option>EXECUTIVE_SPONSOR</option><option>BILLING_CONTACT</option><option>TECHNICAL_OWNER</option><option>STAKEHOLDER</option></select>
          <label className="flex items-center gap-2 text-sm text-slate-300"><input name="primary" type="checkbox" /> Primary contact</label>
          <textarea className="input min-h-20" name="notes" placeholder="Relationship notes" />
          <button className="btn-primary" type="submit">Add Contact</button>
        </form>

        <form onSubmit={addTask} className="glass-card grid gap-3 p-5">
          <h2 className="text-lg font-black">Tasks & Action Items</h2>
          <select className="input" name="clientCompanyId" defaultValue={selectedClientId}>{clientOptions.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}</select>
          <input className="input" name="title" placeholder="Task title" required />
          <textarea className="input min-h-20" name="description" placeholder="Task details, owner notes, follow-up context" />
          <select className="input" name="priority"><option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>CRITICAL</option></select>
          <select className="input" name="status"><option>OPEN</option><option>IN_PROGRESS</option><option>DONE</option><option>BLOCKED</option></select>
          <input className="input" name="dueDate" type="date" />
          <button className="btn-primary" type="submit">Create Task</button>
        </form>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <form onSubmit={addLifecycle} className="glass-card grid gap-3 p-5">
          <h2 className="text-lg font-black">Lifecycle Board</h2>
          <select className="input" name="clientCompanyId" defaultValue={selectedClientId}>{clientOptions.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}</select>
          <select className="input" name="stage">{stages.map(stage => <option key={stage}>{stage}</option>)}</select>
          <input className="input" name="summary" placeholder="Lifecycle update summary" required />
          <input className="input" name="owner" placeholder="Owner" />
          <button className="btn-primary" type="submit">Add Lifecycle Event</button>
          <div className="mt-2 grid gap-2 md:grid-cols-3">{stages.map(stage => <div key={stage} className="rounded-lg border border-white/10 p-3"><p className="text-xs font-black text-shield-glow">{stage}</p><p className="mt-2 text-2xl font-black">{lifecycle.filter((item: any) => item.stage === stage).length}</p></div>)}</div>
        </form>

        <form onSubmit={addRenewal} className="glass-card grid gap-3 p-5">
          <h2 className="text-lg font-black">Renewal Opportunity</h2>
          <select className="input" name="clientCompanyId" defaultValue={selectedClientId}>{clientOptions.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}</select>
          <select className="input" name="stage"><option>DISCOVERY</option><option>VALUE_REVIEW</option><option>PROPOSAL</option><option>NEGOTIATION</option><option>CLOSED_WON</option><option>CLOSED_LOST</option></select>
          <input className="input" name="contractValue" type="number" placeholder="Contract value" />
          <input className="input" name="probability" type="number" min="0" max="100" placeholder="Probability %" />
          <input className="input" name="renewalDate" type="date" />
          <select className="input" name="churnRisk"><option>LOW</option><option>MEDIUM</option><option>HIGH</option></select>
          <textarea className="input min-h-20" name="upsellNotes" placeholder="Upsell opportunity or churn risk notes" />
          <input className="input" name="nextStep" placeholder="Next step" />
          <button className="btn-primary" type="submit">Save Renewal</button>
        </form>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="glass-card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-black"><AlertTriangle className="text-shield-glow" />Client Health Engine</h2>
          <DataTable headers={['Client', 'Score', 'Risk', 'Drivers', 'Actions']}>{health.map((item: any) => <tr key={item.clientCompanyId}><td className="px-5 py-4 font-bold">{item.client}</td><td className="px-5 py-4">{item.healthScore}</td><td className="px-5 py-4">{item.riskLevel}</td><td className="px-5 py-4 text-xs">Tickets {item.drivers.ticketVolume} / Incidents {item.drivers.criticalIncidents} / Gaps {item.drivers.complianceGaps} / Assets {item.drivers.attackSurfaceRisk}</td><td className="px-5 py-4 text-xs">{item.recommendedActions?.join(' | ')}</td></tr>)}</DataTable>
        </div>
        <div className="glass-card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-black"><Timer className="text-shield-glow" />SLA & Performance</h2>
          <DataTable headers={['Client', 'Ticket', 'Priority', 'Age', 'Target', 'Breach']}>{sla.slice(0, 10).map((item: any) => <tr key={item.id}><td className="px-5 py-4 font-bold">{item.client}</td><td className="px-5 py-4">{item.title}</td><td className="px-5 py-4">{item.priority}</td><td className="px-5 py-4">{item.ageHours}h</td><td className="px-5 py-4">{item.targetHours}h</td><td className="px-5 py-4">{item.breached ? 'Yes' : 'No'}</td></tr>)}</DataTable>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="glass-card p-5">
          <h2 className="mb-4 text-lg font-black">Client Contacts</h2>
          <div className="grid gap-3">{contacts.slice(0, 6).map((item: any) => <article key={item.id} className="rounded-lg border border-white/10 p-3"><p className="font-bold">{item.name} {item.primary ? '(Primary)' : ''}</p><p className="text-xs text-slate-400">{item.clientCompany?.name} / {item.role}</p><p className="mt-1 text-sm text-slate-300">{item.email} {item.phone ? `/ ${item.phone}` : ''}</p></article>)}</div>
        </div>
        <div className="glass-card p-5">
          <h2 className="mb-4 text-lg font-black">Open CRM Tasks</h2>
          <div className="grid gap-3">{tasks.slice(0, 6).map((item: any) => <article key={item.id} className="rounded-lg border border-white/10 p-3"><p className="font-bold">{item.title}</p><p className="text-xs text-slate-400">{item.clientCompany?.name} / {item.priority} / {item.status}</p><p className="mt-1 text-sm text-slate-300">{item.description || 'No description'}</p></article>)}</div>
        </div>
        <div className="glass-card p-5">
          <h2 className="mb-4 text-lg font-black">Unified Timeline</h2>
          <div className="grid gap-3">{timeline.slice(0, 7).map((item: any) => <article key={`${item.type}-${item.id}`} className="rounded-lg border border-white/10 p-3"><p className="font-bold">{item.title}</p><p className="text-xs text-slate-400">{item.type} / {item.client} / {new Date(item.at).toLocaleString()}</p><p className="mt-1 text-sm text-slate-300">{item.detail}</p></article>)}</div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="glass-card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-black"><Mail className="text-shield-glow" />Communication Hub</h2>
          <div className="grid gap-3">{messages.slice(0, 6).map((item: any) => <article key={item.id} className="rounded-lg border border-white/10 p-3"><p className="font-bold">{item.subject}</p><p className="text-xs text-slate-400">{item.clientCompany?.name || 'Client'} / {item.channel}</p><p className="mt-1 line-clamp-2 text-sm text-slate-300">{item.body}</p></article>)}</div>
        </div>
        <div className="glass-card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-black"><CalendarClock className="text-shield-glow" />Meetings & Action Items</h2>
          <div className="grid gap-3">{meetings.slice(0, 6).map((item: any) => <article key={item.id} className="rounded-lg border border-white/10 p-3"><p className="font-bold">{item.title}</p><p className="text-xs text-slate-400">{item.type} / {new Date(item.startsAt).toLocaleString()}</p><p className="mt-1 text-sm text-slate-300">{item.notes || 'Agenda, minutes, and action items tracked from meeting records.'}</p></article>)}</div>
        </div>
        <div className="glass-card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-black"><Repeat className="text-shield-glow" />Renewals & Upsell</h2>
          <div className="grid gap-3">{renewals.slice(0, 6).map((item: any) => <article key={item.id}><p className="font-bold">{item.clientCompany?.name}</p><p className="text-xs text-slate-400">{item.stage || item.plan} / {item.churnRisk || item.status}</p><p className="mt-1 text-sm text-slate-300">Renewal: {item.renewalDate ? new Date(item.renewalDate).toLocaleDateString() : 'Not set'} / Value {item.contractValue ? item.contractValue.toLocaleString() : 'n/a'} / Probability {item.probability ?? 'n/a'}%</p></article>)}</div>
        </div>
      </section>

      <section className="glass-card p-5">
        <h2 className="mb-4 text-lg font-black">Client Lifecycle & Account Management</h2>
        <DataTable headers={['Client', 'Health', 'Stage', 'SLA', 'Feedback', 'Renewal', 'Manage']}>{visibleRecords.map((item: any) => <tr key={item.id}><td className="px-5 py-4 font-bold">{item.clientCompany?.name}</td><td className="px-5 py-4">{item.health}</td><td className="px-5 py-4">{item.onboardingStage}</td><td className="px-5 py-4">{item.slaStatus}</td><td className="px-5 py-4">{item.feedbackScore ?? '-'}</td><td className="px-5 py-4">{item.renewalDate ? new Date(item.renewalDate).toLocaleDateString() : '-'}</td><td className="px-5 py-4"><button type="button" className="btn-secondary py-2" onClick={() => setEditing(item)}>Edit</button></td></tr>)}</DataTable>
      </section>
    </div>
  );
}

export function SOCOperations() {
  const { data, refresh } = useData<any[]>('/admin/soc/incidents', []);
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await api.post('/admin/soc/incidents', Object.fromEntries(new FormData(event.currentTarget).entries()));
    toast.success('SOC incident created');
    refresh();
  }
  return <div className="space-y-6"><h1 className="flex items-center gap-2 text-2xl font-black"><ShieldAlert className="text-shield-glow" />SOC Operations</h1><form onSubmit={create} className="glass-card grid gap-3 p-4 md:grid-cols-5"><input className="input" name="title" placeholder="Incident title" required /><select className="input" name="severity"><option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>CRITICAL</option></select><select className="input" name="status"><option>MONITORING</option><option>TRIAGE</option><option>INVESTIGATION</option><option>RESPONSE</option><option>REPORTING</option><option>LESSONS_LEARNED</option></select><input className="input" name="clientCompanyId" placeholder="Client ID optional" /><button className="btn-primary" type="submit">Create</button></form><DataTable headers={['Incident', 'Client', 'Severity', 'Status', 'Assignee', 'Updated']}>{data.map((item: any) => <tr key={item.id}><td className="px-5 py-4 font-bold">{item.title}</td><td className="px-5 py-4">{item.clientCompany?.name || '-'}</td><td className="px-5 py-4">{item.severity}</td><td className="px-5 py-4">{item.status}</td><td className="px-5 py-4">{item.assignedUser?.name || '-'}</td><td className="px-5 py-4">{new Date(item.updatedAt).toLocaleString()}</td></tr>)}</DataTable></div>;
}

export function PentestWorkspace() {
  const { data, refresh } = useData<any[]>('/admin/pentests', []);
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await api.post('/admin/pentests', Object.fromEntries(new FormData(event.currentTarget).entries()));
    toast.success('Pentest project created');
    refresh();
  }
  return <div className="space-y-6"><h1 className="flex items-center gap-2 text-2xl font-black"><Briefcase className="text-shield-glow" />Pentest Workspace</h1><form onSubmit={create} className="glass-card grid gap-3 p-4 md:grid-cols-6"><input className="input" name="clientCompanyId" placeholder="Client ID" required /><input className="input" name="title" placeholder="Project title" required /><select className="input" name="status"><option>SCOPING</option><option>PLANNING</option><option>TESTING</option><option>REPORTING</option><option>DELIVERED</option><option>RETEST</option></select><input className="input" name="assets" placeholder="Assets in scope" /><input className="input" name="deliveryDate" type="date" /><button className="btn-primary" type="submit">Create</button></form><DataTable headers={['Project', 'Client', 'Status', 'Assets', 'Delivery', 'Assignee']}>{data.map((item: any) => <tr key={item.id}><td className="px-5 py-4 font-bold">{item.title}</td><td className="px-5 py-4">{item.clientCompany?.name}</td><td className="px-5 py-4">{item.status}</td><td className="px-5 py-4">{item.scope?.assets?.join(', ')}</td><td className="px-5 py-4">{item.deliveryDate ? new Date(item.deliveryDate).toLocaleDateString() : '-'}</td><td className="px-5 py-4">{item.assignedUser?.name || '-'}</td></tr>)}</DataTable></div>;
}

export function ComplianceDashboard() {
  return <div className="space-y-6"><h1 className="flex items-center gap-2 text-2xl font-black"><Stethoscope className="text-shield-glow" />Compliance Dashboard</h1><div className="grid gap-4 md:grid-cols-3"><MetricCard label="ISO27001" value="72%" /><MetricCard label="SOC2" value="68%" /><MetricCard label="NDPR" value="88%" /></div><p className="glass-card p-5 text-sm text-slate-300">Compliance readiness is linked to client evidence uploads, checklist progress, audit logs, and report storage.</p></div>;
}
