'use client';

import { useEffect, useState } from 'react';
import { usePortalAuth } from '../layout';
import { QrCode, MapPin, Clock } from 'lucide-react';

interface Scan {
  id: string; token: string; resultStatus: string;
  city: string | null; country: string | null;
  scannedAt: string; userAgent: string | null;
}

export default function PortalScans() {
  const { token } = usePortalAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch('/api/scans?limit=100', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { if (d.success) setScans(d.data); })
      .finally(() => setLoading(false));
  }, [token]);

  const statusColors: Record<string, string> = {
    authentic: 'bg-green-50 text-green-700',
    suspicious: 'bg-yellow-50 text-yellow-700',
    invalid: 'bg-red-50 text-red-700',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Scan History</h1>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="text-left px-4 py-3">Token</th>
              <th className="text-left px-4 py-3">Result</th>
              <th className="text-left px-4 py-3">Location</th>
              <th className="text-left px-4 py-3">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-400">Loading...</td></tr>
            ) : scans.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-400">No scans recorded</td></tr>
            ) : scans.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <QrCode size={14} className="text-gray-400" />
                    <span className="text-sm font-mono text-gray-700 truncate max-w-[200px]">
                      {s.token.slice(0, 24)}...
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                    statusColors[s.resultStatus] ?? 'bg-gray-100 text-gray-500'
                  }`}>
                    {s.resultStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    {s.city ?? 'Unknown'}, {s.country ?? ''}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(s.scannedAt).toLocaleString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
