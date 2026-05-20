import { useEffect, useState } from 'react';
import { DataTable } from '../../components/DataTable';
import { api } from '../../services/api';
import { Report } from '../../types';
import { Download, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ClientReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    api.get('/client/reports')
      .then(({ data }) => setReports(data))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  if (error) {
    return (
      <div className="glass-card border-red-500/30 p-6 flex items-center gap-4">
        <AlertCircle className="text-red-400 flex-shrink-0" size={24} />
        <div>
          <h3 className="font-bold text-red-300">Failed to load reports</h3>
          <p className="text-sm text-slate-400 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-card p-4 animate-pulse h-16"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black mb-2">Reports Vault</h1>
        <p className="text-slate-300">Download your security assessment and incident reports</p>
      </div>
      
      {reports.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-slate-400">No reports available yet</p>
          <p className="text-sm text-slate-500 mt-2">Reports will appear here once assessments are completed</p>
        </div>
      ) : (
        <DataTable headers={['Report', 'Description', 'Date', 'Action']}>
          {reports.map(report => (
            <tr key={report.id} className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4 font-bold"><Link className="text-shield-glow hover:underline" to={`/client/reports/${report.id}`}>{report.title}</Link></td>
              <td className="px-6 py-4 text-slate-300 text-sm">{report.description}</td>
              <td className="px-6 py-4 text-sm">{new Date(report.createdAt).toLocaleDateString()}</td>
              <td className="px-6 py-4">
                <a 
                  href={report.filePath} 
                  className="inline-flex items-center gap-2 text-shield-glow hover:text-shield-glow/80 transition-colors font-bold text-sm"
                  download
                >
                  <Download size={16} aria-hidden="true" />Download
                </a>
              </td>
            </tr>
          ))}
        </DataTable>
      )}
    </div>
  );
}
