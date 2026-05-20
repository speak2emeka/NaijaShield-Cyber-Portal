import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CreditCard, RotateCcw } from 'lucide-react';
import { DataTable } from '../../components/DataTable';
import { MetricCard } from '../../components/MetricCard';
import { api } from '../../services/api';

export function AdminBilling() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  async function refresh() {
    const { data } = await api.get('/billing/admin/subscriptions');
    setSubscriptions(Array.isArray(data) ? data : data.items || []);
  }

  useEffect(() => { refresh(); }, []);

  async function changePlan(id: string, plan: string) {
    await api.patch(`/billing/admin/subscriptions/${id}/plan`, { plan, billingInterval: 'monthly' });
    toast.success('Plan updated');
    refresh();
  }

  async function updateStatus(id: string, status: string) {
    await api.patch(`/billing/admin/subscriptions/${id}/status`, { status });
    toast.success('Subscription status updated');
    refresh();
  }

  async function retry(invoiceId: string) {
    await api.post(`/billing/admin/invoices/${invoiceId}/retry`);
    toast.success('Payment retry queued');
  }

  const invoices = subscriptions.flatMap(subscription => subscription.invoices || []);

  return (
    <div className="space-y-6">
      <h1 className="flex items-center gap-2 text-2xl font-black"><CreditCard className="text-shield-glow" />Billing Management</h1>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Subscriptions" value={subscriptions.length} />
        <MetricCard label="Active" value={subscriptions.filter(item => item.status === 'ACTIVE').length} />
        <MetricCard label="Trials" value={subscriptions.filter(item => item.status === 'TRIAL').length} />
        <MetricCard label="Invoices" value={invoices.length} />
      </div>
      <DataTable headers={['Client', 'Plan', 'Status', 'Interval', 'Renewal', 'Actions']}>
        {subscriptions.map(subscription => <tr key={subscription.id}><td className="px-5 py-4 font-bold">{subscription.clientCompany?.name}</td><td className="px-5 py-4">{subscription.plan}</td><td className="px-5 py-4">{subscription.status}</td><td className="px-5 py-4">{subscription.billingInterval || 'monthly'}</td><td className="px-5 py-4">{subscription.renewalDate ? new Date(subscription.renewalDate).toLocaleDateString() : '-'}</td><td className="px-5 py-4"><div className="flex flex-wrap gap-2"><button className="btn-secondary py-1" onClick={() => changePlan(subscription.id, subscription.plan === 'enterprise' ? 'pro' : 'enterprise')}>Change plan</button><button className="btn-secondary py-1" onClick={() => updateStatus(subscription.id, subscription.status === 'CANCELLED' ? 'ACTIVE' : 'CANCELLED')}>Toggle status</button></div></td></tr>)}
      </DataTable>
      <section>
        <h2 className="mb-3 text-xl font-bold">Recent Invoices</h2>
        <DataTable headers={['Subscription', 'Amount', 'Currency', 'Status', 'Date', 'Retry']}>
          {invoices.map(invoice => <tr key={invoice.id}><td className="px-5 py-4">{invoice.subscriptionId || '-'}</td><td className="px-5 py-4">{invoice.amount}</td><td className="px-5 py-4">{invoice.currency}</td><td className="px-5 py-4">{invoice.status}</td><td className="px-5 py-4">{new Date(invoice.createdAt).toLocaleDateString()}</td><td className="px-5 py-4"><button className="btn-secondary py-1" onClick={() => retry(invoice.id)}><RotateCcw size={14} />Retry</button></td></tr>)}
        </DataTable>
      </section>
    </div>
  );
}
