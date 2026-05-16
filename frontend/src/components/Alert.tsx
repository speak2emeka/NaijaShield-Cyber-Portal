import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { ReactNode } from 'react';

const icons = {
  info: Info,
  success: CheckCircle2,
  error: AlertCircle
};

export function Alert({ tone = 'info', title, children }: { tone?: keyof typeof icons; title: string; children?: ReactNode }) {
  const Icon = icons[tone];
  const toneClass = tone === 'error' ? 'border-red-500/30 text-red-200' : tone === 'success' ? 'border-shield-green/30 text-shield-green' : 'border-blue-500/30 text-blue-200';
  return (
    <div className={`glass-card flex items-start gap-3 p-4 ${toneClass}`} role="status">
      <Icon size={20} className="mt-0.5 flex-shrink-0" />
      <div>
        <p className="font-bold">{title}</p>
        {children && <div className="mt-1 text-sm text-slate-400">{children}</div>}
      </div>
    </div>
  );
}
