import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import { Upload, Users } from 'lucide-react';
import { DataTable } from '../../components/DataTable';
import { MetricCard } from '../../components/MetricCard';
import { api } from '../../services/api';

function useApiData<T>(url: string, fallback: T) {
  const [data, setData] = useState<T>(fallback);
  useEffect(() => {
    api.get(url).then(({ data }) => setData(data));
  }, [url]);
  return data;
}

export function AdminClientDetail() {
  const { id } = useParams();
  const client = useApiData<any>(`/admin/clients/${id}`, null);
  if (!client) return <div className="glass-card p-6">Loading client...</div>;

  return (
    <div className="space-y-6">
      <Link to="/admin/clients" className="text-sm font-bold text-shield-glow">Back to clients</Link>
      <h1 className="text-2xl font-black">{client.name}</h1>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Industry" value={client.industry} />
        <MetricCard label="Size" value={client.size} />
        <MetricCard label="Users" value={client.users?.length || 0} />
        <MetricCard label="Reports" value={client.reports?.length || 0} />
      </div>
      <DataTable headers={['User', 'Email', 'Role']}>
        {(client.users || []).map((user: any) => <tr key={user.id}><td className="px-5 py-4 font-bold">{user.name}</td><td className="px-5 py-4">{user.email}</td><td className="px-5 py-4">{user.role}</td></tr>)}
      </DataTable>
    </div>
  );
}

export function AdminTicketDetail() {
  const { id } = useParams();
  const tickets = useApiData<any[]>('/admin/tickets', []);
  const ticket = tickets.find(item => item.id === id) || tickets[0];
  if (!ticket) return <div className="glass-card p-6">Ticket not found.</div>;

  return (
    <div className="space-y-6">
      <Link to="/admin/tickets" className="text-sm font-bold text-shield-glow">Back to tickets</Link>
      <section className="glass-card p-6">
        <p className="text-xs font-black uppercase tracking-widest text-shield-glow">Ticket Triage</p>
        <h1 className="mt-2 text-3xl font-black">{ticket.title}</h1>
        <p className="mt-3 text-slate-300">{ticket.description}</p>
        <div className="mt-5 flex gap-3"><span className="badge badge-warning">{ticket.priority}</span><span className="badge badge-info">{ticket.status}</span></div>
      </section>
    </div>
  );
}

export function AdminReportsUpload() {
  const clients = useApiData<any[]>('/admin/clients', []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const clientId = String(formData.get('clientId'));
    formData.delete('clientId');
    await api.post(`/admin/clients/${clientId}/reports`, formData);
    toast.success('Report uploaded');
    form.reset();
  }

  return (
    <form onSubmit={submit} className="glass-card p-6 md:p-8 space-y-5">
      <h1 className="text-2xl font-black flex items-center gap-2"><Upload className="text-shield-glow" />Reports Upload</h1>
      <div>
        <label className="label" htmlFor="clientId">Client</label>
        <select className="input" id="clientId" name="clientId" required>
          {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
        </select>
      </div>
      <div><label className="label" htmlFor="title">Title</label><input className="input" id="title" name="title" required /></div>
      <div><label className="label" htmlFor="description">Description</label><textarea className="input min-h-28" id="description" name="description" required /></div>
      <div><label className="label" htmlFor="report">PDF Report</label><input className="input" id="report" name="report" type="file" accept="application/pdf" required /></div>
      <button type="submit" className="btn-primary">Upload PDF</button>
    </form>
  );
}

export function AdminStaffManagement() {
  const clients = useApiData<any[]>('/admin/clients', []);
  const [staff, setStaff] = useState<any[]>([]);
  useEffect(() => { api.get('/admin/staff-assignments').then(({ data }) => setStaff(data)); }, []);
  async function assign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    await api.post('/admin/staff-assignments', Object.fromEntries(new FormData(form).entries()));
    toast.success('Staff role assigned');
    form.reset();
    const { data } = await api.get('/admin/staff-assignments');
    setStaff(data);
  }
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black flex items-center gap-2"><Users className="text-shield-glow" />Staff Management</h1>
      <div className="grid gap-4 md:grid-cols-2"><MetricCard label="Staff Roles" value={staff.length} /><MetricCard label="Managed Clients" value={clients.length} /></div>
      <form onSubmit={assign} className="glass-card grid gap-3 p-4 md:grid-cols-6">
        <input className="input" name="name" placeholder="Name" required />
        <input className="input" name="email" type="email" placeholder="Email" required />
        <select className="input" name="scope"><option>ADMIN</option><option>CLIENT</option></select>
        <select className="input" name="role"><option>ADMIN</option><option>ANALYST</option><option>SUPERVISOR</option><option>AUDITOR</option><option>CLIENT</option></select>
        <select className="input" name="clientCompanyId"><option value="">No client scope</option>{clients.map((client: any) => <option key={client.id} value={client.id}>{client.name}</option>)}</select>
        <button className="btn-primary" type="submit">Assign</button>
      </form>
      <DataTable headers={['Name', 'Email', 'Scope', 'Role', 'Permissions']}>
        {staff.map(item => <tr key={item.id}><td className="px-5 py-4 font-bold">{item.user?.name}</td><td className="px-5 py-4">{item.user?.email}</td><td className="px-5 py-4">{item.scope}</td><td className="px-5 py-4">{item.role}</td><td className="px-5 py-4">{item.permissions?.join(', ')}</td></tr>)}
      </DataTable>
    </div>
  );
}
