import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

export function DataTable({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left" role="table">
          <thead className="bg-white/[0.04] text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-white/10">
            <tr>
              {headers.map(header => (
                <th className="px-6 py-4" key={header} role="columnheader">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-sm">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
}
