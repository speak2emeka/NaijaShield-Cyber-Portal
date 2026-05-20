export function ScoreChart({ data }: { data: { score: number; calculatedAt: string }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-slate-400">No score history available</p>
      </div>
    );
  }

  const points = data.map((item, index) => {
    const x = data.length <= 1 ? 0 : (index / (data.length - 1)) * 300;
    const y = 120 - (item.score / 100) * 110;
    return { x, y, score: item.score, date: item.calculatedAt };
  });

  const latestScore = points[points.length - 1]?.score || 0;
  const previousScore = points[points.length - 2]?.score || 0;
  const scoreChange = latestScore - previousScore;
  const isImproving = scoreChange >= 0;

  const bestScore = Math.max(...points.map(p => p.score));
  const worstScore = Math.min(...points.map(p => p.score));

  const smoothPath = points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }
    return `${path} T ${point.x} ${point.y}`;
  }, '');

  const areaPath = `${smoothPath} L 300 120 L 0 120 Z`;
  const firstDate = new Date(points[0].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const lastDate = new Date(points[points.length - 1].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <div className="glass-card p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="font-black text-lg">Security Score History</h3>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="rounded-3xl bg-white/5 px-4 py-3 shadow-glow/10">
              <span className="block text-xs uppercase tracking-wide text-slate-400">Current score</span>
              <span className="mt-1 text-3xl font-black text-shield-glow">{latestScore}%</span>
            </div>
            <span className={`rounded-full px-3 py-1 text-sm font-semibold ${isImproving ? 'bg-shield-green/10 text-shield-green' : 'bg-red-500/10 text-red-300'}`}>
              {isImproving ? 'Improving' : 'Declining'} {Math.abs(scoreChange)} pts
            </span>
          </div>
        </div>
        <div className="grid gap-2 text-xs text-slate-400">
          <span className="uppercase tracking-wide">Last {data.length} readings</span>
          <span>{firstDate} → {lastDate}</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Best</p>
          <p className="mt-2 text-xl font-black text-white">{bestScore}%</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Worst</p>
          <p className="mt-2 text-xl font-black text-white">{worstScore}%</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Trend</p>
          <p className="mt-2 text-xl font-black text-white">{isImproving ? 'Upward' : 'Downward'}</p>
        </div>
      </div>

      <svg viewBox="0 0 300 130" className="h-56 w-full" role="img" aria-label="Security score trend chart">
        <defs>
          <linearGradient id="scoreGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,255,153,0.32)" />
            <stop offset="100%" stopColor="rgba(0,255,153,0.02)" />
          </linearGradient>
        </defs>
        {[20, 40, 60, 80, 100].map(value => {
          const y = 120 - (value / 100) * 110;
          return (
            <line key={value} x1="0" y1={y} x2="300" y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          );
        })}
        {points.map((point, index) => (
          <line key={`tick-${index}`} x1={point.x} y1="120" x2={point.x} y2="124" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
        ))}
        <path d={areaPath} fill="url(#scoreGradient)" opacity="0.85" />
        <path d={smoothPath} fill="none" stroke="#00ff99" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="chart-path" vectorEffect="non-scaling-stroke" />
        {points.map((point, index) => (
          <g key={point.date}>
            <circle cx={point.x} cy={point.y} r="6" fill="#081120" stroke="#00ff99" strokeWidth="2" className="score-point" />
            {index === points.length - 1 && (
              <text x={point.x} y={point.y - 12} textAnchor="middle" className="text-[10px] font-semibold text-shield-glow">
                {point.score}%
              </text>
            )}
          </g>
        ))}
        <text x="10" y="16" className="text-[10px] font-semibold text-slate-400">Score</text>
        <text x="290" y="128" textAnchor="end" className="text-[10px] font-semibold text-slate-400">Time</text>
      </svg>

      <div className="mt-4 flex flex-col gap-2 text-xs text-slate-400 md:flex-row md:justify-between">
        <span>Score Range: 0-100</span>
        <span>{new Date(data[data.length - 1].calculatedAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
