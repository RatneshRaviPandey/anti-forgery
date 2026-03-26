'use client';

import { useEffect, useState } from 'react';
import { usePortalAuth } from '../layout';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface Alert {
  id: string; type: string; severity: string;
  resolved: boolean; createdAt: string;
  details: Record<string, unknown>;
}

export default function PortalAlerts() {
  const { token } = usePortalAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch('/api/alerts?limit=50', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { if (d.success) setAlerts(d.data); })
      .finally(() => setLoading(false));
  }, [token]);

  async function resolveAlert(id: string) {
    if (!token) return;
    await fetch(`/api/alerts/${id}/resolve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
  }

  const sevColors: Record<string, string> = {
    low: 'bg-blue-50 text-blue-700',
    medium: 'bg-yellow-50 text-yellow-700',
    high: 'bg-orange-50 text-orange-700',
    critical: 'bg-red-50 text-red-700',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>

      <div className="space-y-3">
        {loading ? (
          <p className="text-gray-400 text-center py-8">Loading...</p>
        ) : alerts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
            No alerts — your products are safe!
          </div>
        ) : alerts.map(alert => (
          <div key={alert.id} className={`bg-white rounded-xl border ${
            alert.resolved ? 'border-gray-200' : 'border-orange-200'
          } p-4 flex items-start gap-4`}>
            <div className={`mt-0.5 ${alert.resolved ? 'text-green-500' : 'text-orange-500'}`}>
              {alert.resolved ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900 capitalize">
                  {alert.type.replace('_', ' ')}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  sevColors[alert.severity] ?? 'bg-gray-100 text-gray-500'
                }`}>
                  {alert.severity}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {new Date(alert.createdAt).toLocaleString()}
              </p>
            </div>
            {!alert.resolved && (
              <button
                onClick={() => resolveAlert(alert.id)}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium whitespace-nowrap"
              >
                Resolve
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
