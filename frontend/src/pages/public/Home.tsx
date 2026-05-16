import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, LifeBuoy, BarChart3, ArrowRight } from 'lucide-react';

const features = [
  ['Security posture', 'Track score history, risks, and compliance readiness.', ShieldCheck],
  ['Reports vault', 'Download assessment and incident reports from one secure place.', FileText],
  ['Tickets', 'Open support cases and follow remediation progress.', LifeBuoy],
  ['Executive metrics', 'Give leadership a clear view of cyber maturity.', BarChart3]
];

export function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section className="mx-auto grid min-h-[720px] max-w-7xl items-center gap-10 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-4 text-sm font-black uppercase tracking-widest text-shield-glow">Cybersecurity service platform</p>
          <h1 className="max-w-4xl text-5xl font-black leading-tight md:text-7xl">Protecting Africa's digital future with a secure client portal.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">NaijaShield Cyber Portal helps organizations request services, manage tickets, receive reports, and monitor cybersecurity posture in real-time.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/register" className="btn-primary">
              Get Started <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link to="/services" className="btn-secondary">
              Explore Services
            </Link>
          </div>
        </div>
        
        {/* Live SOC Card */}
        <div className="glass-card p-7">
          <div className="mb-5 flex items-center justify-between text-slate-300">
            <span className="text-sm font-semibold">Live SOC Snapshot</span>
            <span className="badge badge-success">ShieldOps</span>
          </div>
          <div className="grid place-items-center rounded-full bg-[conic-gradient(#00ff99_84%,rgba(255,255,255,0.1)_0)] p-8">
            <div className="grid aspect-square w-56 place-items-center rounded-full bg-shield-navy">
              <div className="text-center">
                <strong className="block text-6xl font-black text-shield-glow">84</strong>
                <span className="text-slate-400 text-sm font-semibold">Security Score</span>
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { label: 'Open tickets', value: '12' },
              { label: 'Reports', value: '38' },
              { label: 'SLA', value: '99.9%' }
            ].map(({ label, value }) => (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors" key={label}>
                <strong className="block text-xl text-shield-glow">{value}</strong>
                <span className="text-xs text-slate-400 font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 text-center">
          <p className="text-sm font-black uppercase tracking-widest text-shield-glow">Platform features</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-black">Everything clients and analysts need to work together.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map(([title, copy, Icon]) => (
            <article className="glass-card p-6 hover:shadow-lg hover:border-white/30 transition-all duration-200 group" key={title as string}>
              <div className="mb-4 inline-block rounded-lg bg-shield-green/10 p-3 group-hover:bg-shield-green/20 transition-colors duration-200">
                <Icon className="text-shield-glow" size={24} aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold">{title as string}</h3>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">{copy as string}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="glass-card p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Ready to secure your organization?</h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">Join hundreds of African organizations protecting their digital assets with NaijaShield.</p>
          <Link to="/register" className="btn-primary inline-flex">
            Start Your Journey <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
