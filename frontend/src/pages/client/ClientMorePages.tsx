import { FormEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Bell, BookOpen, Building2, CreditCard, History, Send, ShieldCheck, Users } from 'lucide-react';
import { DataTable } from '../../components/DataTable';
import { MetricCard } from '../../components/MetricCard';
import { ScoreChart } from '../../components/ScoreChart';
import { api } from '../../services/api';

function useApiData<T>(url: string, fallback: T) {
  const [data, setData] = useState<T>(fallback);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.get(url)
      .then(({ data }) => setData(data))
      .finally(() => setIsLoading(false));
  }, [url]);

  return { data, isLoading };
}

export function ClientReportDetail() {
  const { id } = useParams();
  const { data: report, isLoading } = useApiData<any>(`/client/reports/${id}`, null);

  if (isLoading) return <div className="glass-card p-6">Loading report...</div>;
  if (!report) return <div className="glass-card p-6">Report not found.</div>;

  return (
    <div className="space-y-6">
      <Link to="/client/reports" className="text-sm font-bold text-shield-glow">Back to reports</Link>
      <section className="glass-card p-6">
        <p className="text-xs font-black uppercase tracking-widest text-shield-glow">Report Detail</p>
        <h1 className="mt-2 text-3xl font-black">{report.title}</h1>
        <p className="mt-3 text-slate-300">{report.description}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href={report.filePath} download className="btn-primary">Download PDF</a>
          <span className="badge badge-info">{new Date(report.createdAt).toLocaleDateString()}</span>
        </div>
      </section>
    </div>
  );
}

export function ClientTicketDetail() {
  const { id } = useParams();
  const { data: tickets } = useApiData<any[]>('/client/tickets', []);
  const ticket = tickets.find(item => item.id === id) || tickets[0];

  async function addComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    await api.post(`/client/tickets/${id}/comment`, Object.fromEntries(new FormData(form).entries()));
    toast.success('Comment added');
    form.reset();
  }

  if (!ticket) return <div className="glass-card p-6">Ticket not found.</div>;

  return (
    <div className="space-y-6">
      <Link to="/client/tickets" className="text-sm font-bold text-shield-glow">Back to tickets</Link>
      <section className="glass-card p-6">
        <p className="text-xs font-black uppercase tracking-widest text-shield-glow">Ticket Detail</p>
        <h1 className="mt-2 text-3xl font-black">{ticket.title}</h1>
        <p className="mt-3 text-slate-300">{ticket.description}</p>
        <div className="mt-5 flex gap-3">
          <span className="badge badge-warning">{ticket.priority}</span>
          <span className="badge badge-info">{ticket.status}</span>
        </div>
      </section>
      <form onSubmit={addComment} className="glass-card p-6">
        <label htmlFor="message" className="label">Add Comment</label>
        <textarea id="message" name="message" required className="input min-h-28" placeholder="Add remediation notes or a response..." />
        <button className="btn-primary mt-4" type="submit"><Send size={16} />Post Comment</button>
      </form>
    </div>
  );
}

export function ClientCompanyProfile() {
  const { data: company } = useApiData<any>('/client/company', null);
  if (!company) return <div className="glass-card p-6">Loading company profile...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black flex items-center gap-2"><Building2 className="text-shield-glow" />Company Profile</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard label="Company" value={company.name} />
        <MetricCard label="Industry" value={company.industry} />
        <MetricCard label="Size" value={company.size} />
        <MetricCard label="Security Contact" value={company.contactEmail} />
      </div>
    </div>
  );
}

export function ClientTeamManagement() {
  const { data: company } = useApiData<any>('/client/company', { users: [] });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black flex items-center gap-2"><Users className="text-shield-glow" />Team Management</h1>
      <DataTable headers={['Name', 'Email', 'Role']}>
        {company.users.map((user: any) => (
          <tr key={user.id}><td className="px-5 py-4 font-bold">{user.name}</td><td className="px-5 py-4">{user.email}</td><td className="px-5 py-4">{user.role}</td></tr>
        ))}
      </DataTable>
    </div>
  );
}

export function ClientSubscription() {
  const { data: subscription } = useApiData<any>('/client/subscription', null);
  if (!subscription) return <div className="glass-card p-6">No subscription found.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black flex items-center gap-2"><CreditCard className="text-shield-glow" />Subscription</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Plan" value={subscription.plan} />
        <MetricCard label="Status" value={subscription.status} />
        <MetricCard label="Renewal" value={subscription.renewalDate ? new Date(subscription.renewalDate).toLocaleDateString() : 'Pending'} />
      </div>
    </div>
  );
}

export function ClientNotifications() {
  const { data: notifications } = useApiData<any[]>('/client/notifications', []);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black flex items-center gap-2"><Bell className="text-shield-glow" />Notifications</h1>
      <div className="grid gap-3">
        {notifications.map(item => (
          <article key={item.id} className="glass-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div><p className="font-bold">{item.message}</p><p className="mt-1 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p></div>
              <span className={`badge ${item.read ? 'badge-info' : 'badge-warning'}`}>{item.type}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function ClientAuditLogs() {
  const { data: logs } = useApiData<any[]>('/client/audit-logs', []);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black flex items-center gap-2"><History className="text-shield-glow" />Audit Logs</h1>
      <DataTable headers={['Action', 'Entity', 'Date']}>
        {logs.map(log => <tr key={log.id}><td className="px-5 py-4 font-bold">{log.action}</td><td className="px-5 py-4">{log.entityType}</td><td className="px-5 py-4">{new Date(log.createdAt).toLocaleString()}</td></tr>)}
      </DataTable>
    </div>
  );
}

export function ClientKnowledgeBase() {
  const { data: articles } = useApiData<any[]>('/client/knowledge-base', []);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black flex items-center gap-2"><BookOpen className="text-shield-glow" />Knowledge Base</h1>
      <div className="grid gap-4 lg:grid-cols-3">
        {articles.map(article => (
          <article key={article.id} className="glass-card p-5">
            <span className="badge badge-info">{article.category}</span>
            <h2 className="mt-4 text-lg font-black">{article.title}</h2>
            <p className="mt-3 text-sm text-slate-300">{article.content}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export function ClientScoreHistory() {
  const { data: scores } = useApiData<any[]>('/client/security-score/history', []);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black flex items-center gap-2"><ShieldCheck className="text-shield-glow" />Security Score History</h1>
      <ScoreChart data={scores} />
      <DataTable headers={['Score', 'Date', 'Notes']}>
        {scores.map(item => <tr key={item.id}><td className="px-5 py-4 font-bold">{item.score}%</td><td className="px-5 py-4">{new Date(item.calculatedAt).toLocaleDateString()}</td><td className="px-5 py-4">{item.notes}</td></tr>)}
      </DataTable>
    </div>
  );
}
