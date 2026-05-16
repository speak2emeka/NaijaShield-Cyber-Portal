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
    return `${x},${y}`;
  }).join(' ');

  const latestScore = data[data.length - 1]?.score || 0;
  const previousScore = data[data.length - 2]?.score || 0;
  const scoreChange = latestScore - previousScore;
  const isImproving = scoreChange >= 0;

  return (
    <div className="glass-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-black text-lg">Security Score History</h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-3xl font-black text-shield-glow">{latestScore}%</span>
            <span className={`text-sm font-bold ${isImproving ? 'text-shield-green' : 'text-red-400'}`}>
              {isImproving ? '↑' : '↓'} {Math.abs(scoreChange)}
            </span>
          </div>
        </div>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Last {data.length} readings</span>
      </div>
      <svg viewBox="0 0 300 130" className="h-48 w-full" role="img" aria-label="Security score trend chart">
        {/* Grid lines */}
        <line x1="0" y1="120" x2="300" y2="120" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <line x1="0" y1="60" x2="300" y2="60" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        
        {/* Chart line and points */}
        <polyline fill="none" stroke="#00ff99" strokeWidth="3" points={points} vectorEffect="non-scaling-stroke" />
        {data.map((item, index) => {
          const x = data.length <= 1 ? 0 : (index / (data.length - 1)) * 300;
          const y = 120 - (item.score / 100) * 110;
          return (
            <g key={item.calculatedAt}>
              <circle cx={x} cy={y} r="4" fill="#081120" stroke="#00ff99" strokeWidth="2" />
            </g>
          );
        })}
      </svg>
      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <span>Score Range: 0-100</span>
        <span>{new Date(data[data.length - 1].calculatedAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
