import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { DataTable } from '../../components/DataTable';
import { api } from '../../services/api';
import { Ticket } from '../../types';
import { AlertCircle, Ticket as TicketIcon } from 'lucide-react';

const priorityColors = {
  'LOW': 'badge-info',
  'MEDIUM': 'badge-warning',
  'HIGH': 'badge-error',
  'CRITICAL': 'badge-error'
};

const statusColors = {
  'OPEN': 'bg-blue-500/10 text-blue-300',
  'IN_PROGRESS': 'bg-yellow-500/10 text-yellow-300',
  'RESOLVED': 'bg-shield-green/10 text-shield-green',
  'CLOSED': 'bg-slate-500/10 text-slate-300'
};

export function ClientTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const { data } = await api.get('/client/tickets');
      setTickets(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsTableLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/client/tickets', Object.fromEntries(new FormData(event.currentTarget).entries()));
      toast.success('Support ticket opened successfully');
      event.currentTarget.reset();
      await load();
    } catch (error) {
      toast.error('Failed to create ticket');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Create Ticket Form */}
      <form onSubmit={submit} className="glass-card p-6 md:p-8">
        <h2 className="text-2xl font-black mb-6">Open a Support Ticket</h2>
        <div className="grid gap-5">
          <div>
            <label htmlFor="title" className="label">Ticket Title</label>
            <input 
              id="title"
              className="input" 
              name="title" 
              placeholder="Brief description of your issue" 
              required 
              aria-required="true"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="priority" className="label">Priority Level</label>
              <select 
                id="priority"
                className="input" 
                name="priority"
                aria-required="true"
              >
                <option value="LOW">Low - Can wait</option>
                <option value="MEDIUM">Medium - Soon</option>
                <option value="HIGH">High - Urgent</option>
                <option value="CRITICAL">Critical - Emergency</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="description" className="label">Description</label>
            <textarea 
              id="description"
              className="input min-h-32 resize-none" 
              name="description" 
              placeholder="Describe the issue in detail..." 
              required 
              aria-required="true"
            />
          </div>
          <button 
            type="submit"
            className="btn-primary" 
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? <><span className="loading-spinner">⏳</span>Creating...</> : <>Submit Ticket</>}
          </button>
        </div>
      </form>

      {/* Tickets List */}
      <div>
        <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
          <TicketIcon size={24} className="text-shield-glow" />
          Support Tickets
        </h2>

        {error ? (
          <div className="glass-card border-red-500/30 p-6 flex items-center gap-4">
            <AlertCircle className="text-red-400 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-bold text-red-300">Failed to load tickets</h3>
              <p className="text-sm text-slate-400 mt-1">{error}</p>
            </div>
          </div>
        ) : isTableLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card p-4 animate-pulse h-16"></div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-slate-400">No tickets yet</p>
            <p className="text-sm text-slate-500 mt-2">Create one above to get support from our team</p>
          </div>
        ) : (
          <DataTable headers={['Title', 'Priority', 'Status', 'Updated']}>
            {tickets.map(ticket => (
              <tr key={ticket.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-bold">{ticket.title}</td>
                <td className="px-6 py-4">
                  <span className={`badge ${priorityColors[ticket.priority as keyof typeof priorityColors] || 'badge-info'}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColors[ticket.status as keyof typeof statusColors] || ''}`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">{new Date(ticket.updatedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </DataTable>
        )}
      </div>
    </div>
  );
}
