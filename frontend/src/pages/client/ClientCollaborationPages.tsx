import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CalendarClock, MessageSquare } from 'lucide-react';
import { DataTable } from '../../components/DataTable';
import { api } from '../../services/api';

function useData<T>(url: string, fallback: T) {
  const [data, setData] = useState<T>(fallback);
  const refresh = () => api.get(url).then(({ data }) => setData(data));
  useEffect(() => { refresh(); }, [url]);
  return { data, refresh };
}

export function ClientMessaging() {
  const { data, refresh } = useData<any[]>('/client/messages', []);
  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await api.post('/client/messages', Object.fromEntries(new FormData(event.currentTarget).entries()));
    toast.success('Message sent');
    refresh();
  }
  return <div className="space-y-6"><h1 className="flex items-center gap-2 text-2xl font-black"><MessageSquare className="text-shield-glow" />Messaging</h1><form onSubmit={send} className="glass-card grid gap-3 p-4"><input className="input" name="subject" placeholder="Subject" required /><textarea className="input min-h-28" name="body" placeholder="Message" required /><button className="btn-primary" type="submit">Send</button></form><DataTable headers={['Subject', 'From', 'Channel', 'Date']}>{data.map((item: any) => <tr key={item.id}><td className="px-5 py-4 font-bold">{item.subject}</td><td className="px-5 py-4">{item.sender?.name || 'NaijaShield'}</td><td className="px-5 py-4">{item.channel}</td><td className="px-5 py-4">{new Date(item.createdAt).toLocaleString()}</td></tr>)}</DataTable></div>;
}

export function ClientMeetings() {
  const { data, refresh } = useData<any[]>('/client/meetings', []);
  async function schedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await api.post('/client/meetings', Object.fromEntries(new FormData(event.currentTarget).entries()));
    toast.success('Meeting requested');
    refresh();
  }
  return <div className="space-y-6"><h1 className="flex items-center gap-2 text-2xl font-black"><CalendarClock className="text-shield-glow" />Meetings</h1><form onSubmit={schedule} className="glass-card grid gap-3 p-4 md:grid-cols-5"><input className="input" name="title" placeholder="Title" required /><select className="input" name="type"><option>CLIENT</option><option>QBR</option><option>COMPLIANCE_AUDIT</option><option>INCIDENT_REVIEW</option></select><input className="input" name="startsAt" type="datetime-local" required /><input className="input" name="endsAt" type="datetime-local" required /><button className="btn-primary" type="submit">Request</button></form><DataTable headers={['Title', 'Type', 'Starts', 'Provider', 'Notes']}>{data.map((item: any) => <tr key={item.id}><td className="px-5 py-4 font-bold">{item.title}</td><td className="px-5 py-4">{item.type}</td><td className="px-5 py-4">{new Date(item.startsAt).toLocaleString()}</td><td className="px-5 py-4">{item.provider || '-'}</td><td className="px-5 py-4">{item.notes || '-'}</td></tr>)}</DataTable></div>;
}
