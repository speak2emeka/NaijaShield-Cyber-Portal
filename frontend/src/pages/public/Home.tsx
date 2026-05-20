import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, FileText, LifeBuoy, BarChart3, ArrowRight } from 'lucide-react';
import { ScoreChart } from '../../components/ScoreChart';

const features = [
  ['Security posture', 'Track score history, risks, and compliance readiness.', ShieldCheck],
  ['Reports vault', 'Download assessment and incident reports from one secure place.', FileText],
  ['Tickets', 'Open support cases and follow remediation progress.', LifeBuoy],
  ['Executive metrics', 'Give leadership a clear view of cyber maturity.', BarChart3]
];

export function Home() {
  const initialTrend = useMemo(
    () => [
      { score: 72, calculatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { score: 76, calculatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
      { score: 79, calculatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      { score: 81, calculatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { score: 83, calculatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      { score: 84, calculatedAt: new Date().toISOString() }
    ],
    []
  );

  const [liveScores, setLiveScores] = useState(initialTrend);
  const [liveScore, setLiveScore] = useState(initialTrend[initialTrend.length - 1].score);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setLiveScores(prev => {
        const next = Math.min(100, Math.max(65, prev[prev.length - 1].score + (Math.random() > 0.4 ? 1 : -1) * Math.ceil(Math.random() * 3)));
        const nextPoint = {
          score: next,
          calculatedAt: new Date().toISOString()
        };
        const updated = [...prev.slice(1), nextPoint];
        setLiveScore(next);
        return updated;
      });
    }, 4200);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <main>
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm uppercase tracking-[0.35em] text-slate-300 shadow-glow/5">
              <span className="h-2 w-2 rounded-full bg-shield-glow" />
              NaijaShield Technologies
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-[-0.04em] text-white md:text-6xl">Enterprise cybersecurity, optimized for African organisations.</h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">NaijaShield combines posture scoring, incident visibility, compliance readiness, and live SOC workflows in a modern portal built to protect, detect, and defend.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glow/10 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Managed security</p>
                <p className="mt-3 text-2xl font-black text-white">24/7 SOC visibility</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glow/10 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Compliance trust</p>
                <p className="mt-3 text-2xl font-black text-shield-glow">Audit ready controls</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link to="/register" className="btn-primary">
                Get Started <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link to="/services" className="btn-secondary">
                Explore Services
              </Link>
              <span className="text-sm uppercase tracking-[0.35em] text-slate-400">Protect • Detect • Defend</span>
            </div>
          </div>

          <div className="hero-illustration p-8">
            <div className="relative z-10 grid gap-6 animate-fade-in">
              <div className="rounded-[2rem] border border-white/10 bg-shield-navy/95 p-6 shadow-glow-lg animate-glow-pulse">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Live security score</p>
                    <p className="mt-2 text-5xl font-black text-shield-glow">{liveScore}%</p>
                  </div>
                  <div className="rounded-3xl bg-white/5 px-5 py-3 text-center">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">ShieldOps</p>
                    <p className="mt-2 text-xl font-black text-white">SOC ready</p>
                  </div>
                </div>
                <div className="mt-8">
                  <ScoreChart data={liveScores} />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: 'Assets monitored', value: '124' },
                  { label: 'Remediation tasks', value: '18' },
                  { label: 'Client interactions', value: '42' }
                ].map(info => (
                  <div key={info.label} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{info.label}</p>
                    <p className="mt-3 text-2xl font-black text-white">{info.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute -right-8 bottom-0 h-[360px] w-[360px] rounded-full bg-shield-glow/10 blur-3xl" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 text-center animate-slide-in">
          <p className="text-sm font-black uppercase tracking-widest text-shield-glow">Platform features</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-black">Everything clients and analysts need to work together.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map(([title, copy, Icon]) => (
            <article className="glass-card p-6 hover:-translate-y-1 hover:shadow-glow-lg transition-all duration-200 group" key={title as string}>
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-shield-green/10 text-shield-glow transition-colors duration-200 group-hover:bg-shield-glow/15">
                <Icon className="text-2xl" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-black">{title as string}</h3>
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
