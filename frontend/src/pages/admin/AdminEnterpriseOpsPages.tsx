import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Briefcase, CalendarClock, HeartHandshake, MonitorCog, ShieldAlert, Stethoscope } from 'lucide-react';
import { DataTable } from '../../components/DataTable';
import { MetricCard } from '../../components/MetricCard';
import { api } from '../../services/api';

function useData<T>(url: string, fallback: T) {
  const [data, setData] = useState<T>(fallback);
  const refresh = () => api.get(url).then(({ data }) => setData(data));
  useEffect(() => { refresh(); }, [url]);
  return { data, refresh };
}

export function ManagementOverview() {
  const { data } = useData<any>('/admin/management/overview', null);
  return <div className="space-y-6"><h1 className="flex items-center gap-2 text-2xl font-black"><MonitorCog className="text-shield-glow" />System Health</h1><div className="grid gap-4 md:grid-cols-6"><MetricCard label="Staff" value={data?.staff ?? 0} /><MetricCard label="Shifts" value={data?.shifts ?? 0} /><MetricCard label="Meetings" value={data?.meetings ?? 0} /><MetricCard label="CSR Buckets" value={data?.csr?.length ?? 0} /><MetricCard label="SOC States" value={data?.soc?.length ?? 0} /><MetricCard label="Pentest States" value={data?.pentests?.length ?? 0} /></div></div>;
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
  const { data, refresh } = useData<any[]>('/admin/csr', []);
  async function update(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await api.post('/admin/csr', Object.fromEntries(new FormData(event.currentTarget).entries()));
    toast.success('CSR record updated');
    refresh();
  }
  return <div className="space-y-6"><h1 className="flex items-center gap-2 text-2xl font-black"><HeartHandshake className="text-shield-glow" />CSR Dashboard</h1><form onSubmit={update} className="glass-card grid gap-3 p-4 md:grid-cols-6"><input className="input" name="clientCompanyId" placeholder="Client ID" required /><select className="input" name="health"><option>GREEN</option><option>AMBER</option><option>RED</option></select><input className="input" name="onboardingStage" placeholder="Onboarding stage" /><input className="input" name="slaStatus" placeholder="SLA status" /><input className="input" name="feedbackScore" type="number" placeholder="Feedback" /><button className="btn-primary" type="submit">Update</button></form><DataTable headers={['Client', 'Health', 'Stage', 'SLA', 'Feedback', 'Renewal']}>{data.map((item: any) => <tr key={item.id}><td className="px-5 py-4 font-bold">{item.clientCompany?.name}</td><td className="px-5 py-4">{item.health}</td><td className="px-5 py-4">{item.onboardingStage}</td><td className="px-5 py-4">{item.slaStatus}</td><td className="px-5 py-4">{item.feedbackScore}</td><td className="px-5 py-4">{item.renewalDate ? new Date(item.renewalDate).toLocaleDateString() : '-'}</td></tr>)}</DataTable></div>;
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
