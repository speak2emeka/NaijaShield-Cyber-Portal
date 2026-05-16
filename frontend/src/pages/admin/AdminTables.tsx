import { useEffect, useState } from 'react';
import { DataTable } from '../../components/DataTable';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';

export function AdminClients() {
  const [clients, setClients] = useState<any[]>([]);
  useEffect(() => { api.get('/admin/clients').then(({ data }) => setClients(data)); }, []);
  return <DataTable headers={['Company', 'Industry', 'Users', 'Plan']} >{clients.map(client => <tr key={client.id}><td className="px-5 py-4 font-bold"><Link className="text-shield-glow hover:underline" to={`/admin/clients/${client.id}`}>{client.name}</Link></td><td className="px-5 py-4">{client.industry}</td><td className="px-5 py-4">{client.users.length}</td><td className="px-5 py-4">{client.subscription?.plan}</td></tr>)}</DataTable>;
}

export function AdminTickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  useEffect(() => { api.get('/admin/tickets').then(({ data }) => setTickets(data)); }, []);
  return <DataTable headers={['Title', 'Client', 'Priority', 'Status']} >{tickets.map(ticket => <tr key={ticket.id}><td className="px-5 py-4 font-bold"><Link className="text-shield-glow hover:underline" to={`/admin/tickets/${ticket.id}`}>{ticket.title}</Link></td><td className="px-5 py-4">{ticket.clientCompany?.name}</td><td className="px-5 py-4">{ticket.priority}</td><td className="px-5 py-4">{ticket.status}</td></tr>)}</DataTable>;
}

export function AdminRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  useEffect(() => { api.get('/admin/requests').then(({ data }) => setRequests(data)); }, []);
  return <DataTable headers={['Type', 'Client', 'Status', 'Description']} >{requests.map(item => <tr key={item.id}><td className="px-5 py-4 font-bold">{item.type}</td><td className="px-5 py-4">{item.clientCompany?.name}</td><td className="px-5 py-4">{item.status}</td><td className="px-5 py-4 text-slate-300">{item.description}</td></tr>)}</DataTable>;
}

export function AdminAuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [query, setQuery] = useState({ action: '', entityType: '', userId: '' });
  useEffect(() => {
    const params = new URLSearchParams(Object.entries(query).filter(([, value]) => value));
    api.get(`/admin/audit-logs?${params.toString()}`).then(({ data }) => setLogs(data));
  }, [query]);
  return <div className="space-y-4"><div className="glass-card grid gap-3 p-4 md:grid-cols-4"><input className="input" placeholder="Action" value={query.action} onChange={event => setQuery({ ...query, action: event.target.value })} /><input className="input" placeholder="Entity type" value={query.entityType} onChange={event => setQuery({ ...query, entityType: event.target.value })} /><input className="input" placeholder="User ID" value={query.userId} onChange={event => setQuery({ ...query, userId: event.target.value })} /><a className="btn-secondary" href="/api/enterprise/audit-logs/export.csv">Export CSV</a></div><DataTable headers={['Action', 'User', 'Entity', 'IP', 'Correlation', 'Date']} >{logs.map(log => <tr key={log.id}><td className="px-5 py-4 font-bold">{log.action}</td><td className="px-5 py-4">{log.user?.email}</td><td className="px-5 py-4">{log.entityType}</td><td className="px-5 py-4">{log.ipAddress || '-'}</td><td className="px-5 py-4">{log.correlationId || '-'}</td><td className="px-5 py-4">{new Date(log.createdAt).toLocaleString()}</td></tr>)}</DataTable></div>;
}
