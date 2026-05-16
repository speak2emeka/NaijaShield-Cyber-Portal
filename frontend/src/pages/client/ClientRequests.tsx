import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { DataTable } from '../../components/DataTable';
import { api } from '../../services/api';
import { ServiceRequest } from '../../types';
import { AlertCircle, Plus } from 'lucide-react';

const serviceTypes = {
  'PENTEST': 'Penetration Testing',
  'INCIDENT_RESPONSE': 'Incident Response',
  'SECURITY_ASSESSMENT': 'Security Assessment',
  'CLOUD_SECURITY_AUDIT': 'Cloud Security Audit',
  'COMPLIANCE_REVIEW': 'Compliance Review',
  'TRAINING': 'Security Training'
};

const statusColors = {
  'PENDING': 'bg-yellow-500/10 text-yellow-300',
  'IN_PROGRESS': 'bg-blue-500/10 text-blue-300',
  'COMPLETED': 'bg-shield-green/10 text-shield-green',
  'CANCELLED': 'bg-slate-500/10 text-slate-300'
};

export function ClientRequests() {
  const [items, setItems] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const { data } = await api.get('/client/requests');
      setItems(data);
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
      await api.post('/client/requests', Object.fromEntries(new FormData(event.currentTarget).entries()));
      toast.success('Service request created successfully');
      event.currentTarget.reset();
      await load();
    } catch (error) {
      toast.error('Failed to create request');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Request Form */}
      <form onSubmit={submit} className="glass-card p-6 md:p-8">
        <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
          <Plus size={24} className="text-shield-glow" />
          Request a Cybersecurity Service
        </h2>
        <div className="grid gap-5">
          <div>
            <label htmlFor="type" className="label">Service Type</label>
            <select 
              id="type"
              className="input" 
              name="type"
              aria-required="true"
            >
              <option value="">Select a service...</option>
              {Object.entries(serviceTypes).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="description" className="label">Description</label>
            <textarea 
              id="description"
              className="input min-h-32 resize-none" 
              name="description" 
              placeholder="What should NaijaShield help with? Provide as much detail as possible..." 
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
            {isLoading ? <><span className="loading-spinner">⏳</span>Creating...</> : <>Submit Request</>}
          </button>
        </div>
      </form>

      {/* Requests List */}
      <div>
        <h2 className="text-2xl font-black mb-4">Your Service Requests</h2>

        {error ? (
          <div className="glass-card border-red-500/30 p-6 flex items-center gap-4">
            <AlertCircle className="text-red-400 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-bold text-red-300">Failed to load requests</h3>
              <p className="text-sm text-slate-400 mt-1">{error}</p>
            </div>
          </div>
        ) : isTableLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card p-4 animate-pulse h-16"></div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-slate-400">No service requests yet</p>
            <p className="text-sm text-slate-500 mt-2">Create one above to request our cybersecurity services</p>
          </div>
        ) : (
          <DataTable headers={['Service Type', 'Status', 'Description', 'Updated']}>
            {items.map(item => (
              <tr key={item.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-bold">{serviceTypes[item.type as keyof typeof serviceTypes] || item.type}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColors[item.status as keyof typeof statusColors] || ''}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-300 line-clamp-2">{item.description}</td>
                <td className="px-6 py-4 text-sm text-slate-400">{new Date(item.updatedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </DataTable>
        )}
      </div>
    </div>
  );
}
