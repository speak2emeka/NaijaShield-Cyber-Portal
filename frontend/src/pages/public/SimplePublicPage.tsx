import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';

export function SimplePublicPage({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <main>
      {/* Hero Section */}
      <section className="mx-auto max-w-5xl px-6 py-20 md:py-24">
        <p className="mb-4 text-sm font-black uppercase tracking-widest text-shield-glow">NaijaShield Services</p>
        <h1 className="text-4xl md:text-5xl font-black leading-tight">{title}</h1>
        <p className="mt-6 text-lg leading-8 text-slate-300 max-w-3xl">{subtitle}</p>
      </section>

      {/* Plans Section */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              name: 'ShieldStart',
              description: 'Perfect for small businesses starting their security journey',
              features: ['Security assessments', 'Basic compliance reports', 'Email support', 'Monthly reviews']
            },
            {
              name: 'ShieldOps',
              description: 'Comprehensive security operations for growing organizations',
              features: ['24/7 SOC monitoring', 'Advanced threat detection', 'Incident response', 'Priority support']
            },
            {
              name: 'ShieldEnterprise',
              description: 'Enterprise-grade security operations and strategic guidance',
              features: ['Dedicated security team', 'Custom compliance', 'Advanced analytics', '24/7 phone support']
            }
          ].map((plan) => (
            <article className="glass-card p-6 hover:shadow-lg hover:border-white/30 transition-all duration-200 group" key={plan.name}>
              <h3 className="text-xl font-black text-shield-glow group-hover:text-shield-glow/80 transition-colors">{plan.name}</h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">{plan.description}</p>
              
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li className="flex items-start gap-3" key={feature}>
                    <Check size={18} className="text-shield-glow flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-sm text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link 
                to="/contact" 
                className="btn-secondary mt-6 w-full text-center text-sm"
              >
                Learn More <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
