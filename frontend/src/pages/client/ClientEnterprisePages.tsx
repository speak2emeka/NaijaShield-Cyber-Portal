import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CreditCard, KeyRound, MonitorSmartphone, ShieldCheck } from 'lucide-react';
import { DataTable } from '../../components/DataTable';
import { MetricCard } from '../../components/MetricCard';
import { api } from '../../services/api';

export function ClientSecuritySettings() {
  const [mfa, setMfa] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    api.get('/enterprise/sessions').then(({ data }) => setSessions(data));
  }, []);

  async function setupMfa() {
    const { data } = await api.post('/enterprise/mfa/totp/setup');
    setMfa(data);
  }

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await api.post('/enterprise/mfa/totp/verify', Object.fromEntries(new FormData(event.currentTarget).entries()));
    toast.success('MFA enabled');
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black flex items-center gap-2"><ShieldCheck className="text-shield-glow" />Security Settings</h1>
      <section className="glass-card p-6">
        <h2 className="text-xl font-bold flex items-center gap-2"><KeyRound size={20} />Multi-factor Authentication</h2>
        <p className="mt-2 text-sm text-slate-400">Use TOTP with Google Authenticator, 1Password, Authy, or any compatible app.</p>
        <button onClick={setupMfa} className="btn-secondary mt-4">Generate TOTP Secret</button>
        {mfa && <form onSubmit={verify} className="mt-5 grid gap-4"><code className="rounded-lg bg-black/30 p-3 text-sm">{mfa.secret}</code><input className="input" name="token" placeholder="6-digit code" required /><button className="btn-primary" type="submit">Verify and enable</button></form>}
      </section>
      <section>
        <h2 className="mb-4 text-xl font-bold flex items-center gap-2"><MonitorSmartphone size={20} />Device Sessions</h2>
        <DataTable headers={['Device', 'IP', 'Last Seen', 'Status']}>{sessions.map((session: any) => <tr key={session.id}><td className="px-5 py-4">{session.deviceLabel || session.userAgent || 'Browser'}</td><td className="px-5 py-4">{session.ipAddress || 'Unknown'}</td><td className="px-5 py-4">{new Date(session.lastSeenAt || session.createdAt).toLocaleString()}</td><td className="px-5 py-4">{session.revokedAt ? 'Revoked' : 'Active'}</td></tr>)}</DataTable>
      </section>
    </div>
  );
}

export function ClientBilling() {
  const [plans, setPlans] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    api.get('/enterprise/billing/plans').then(({ data }) => setPlans(data));
    api.get('/enterprise/billing/invoices').then(({ data }) => setInvoices(data));
  }, []);

  async function checkout(planId: string) {
    const { data } = await api.post('/enterprise/billing/checkout', { planId, provider: 'STRIPE' });
    toast.success('Checkout session prepared');
    if (data.checkoutUrl) window.location.href = data.checkoutUrl;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black flex items-center gap-2"><CreditCard className="text-shield-glow" />Billing</h1>
      <div className="grid gap-4 lg:grid-cols-3">{plans.map(plan => <section key={plan.id} className="glass-card p-5"><h2 className="text-xl font-black">{plan.name}</h2><p className="mt-2 text-3xl font-black text-shield-glow">₦{plan.priceMonthly.toLocaleString()}</p><ul className="mt-4 grid gap-2 text-sm text-slate-300">{plan.features.map((feature: string) => <li key={feature}>{feature}</li>)}</ul><button onClick={() => checkout(plan.id)} className="btn-primary mt-5 w-full">Choose plan</button></section>)}</div>
      <div className="grid gap-4 md:grid-cols-3"><MetricCard label="Invoices" value={invoices.length} /><MetricCard label="Provider" value="Stripe / Paystack" /><MetricCard label="Trial Support" value="Enabled" /></div>
      <DataTable headers={['Amount', 'Currency', 'Status', 'Date']}>{invoices.map(invoice => <tr key={invoice.id}><td className="px-5 py-4">{invoice.amount}</td><td className="px-5 py-4">{invoice.currency}</td><td className="px-5 py-4">{invoice.status}</td><td className="px-5 py-4">{new Date(invoice.createdAt).toLocaleDateString()}</td></tr>)}</DataTable>
    </div>
  );
}
