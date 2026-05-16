export function MetricCard({ label, value, tone = 'green' }: { label: string; value: string | number; tone?: 'green' | 'red' | 'gold' }) {
  const colorMap = {
    'green': 'text-shield-glow bg-shield-glow/10',
    'red': 'text-red-300 bg-red-500/10',
    'gold': 'text-yellow-300 bg-yellow-500/10'
  };
  const [textColor, bgColor] = colorMap[tone].split(' ');
  
  return (
    <div className="glass-card p-6 hover:shadow-lg hover:border-white/30 transition-all duration-200" role="region" aria-label={label}>
      <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">{label}</p>
      <div className={`mt-3 inline-block rounded-lg px-3 py-1 ${bgColor}`}>
        <strong className={`text-3xl font-black ${textColor}`}>{value}</strong>
      </div>
    </div>
  );
}
