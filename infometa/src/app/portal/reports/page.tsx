'use client';

import { useEffect, useState } from 'react';
import { usePortalAuth } from '../layout';
import { BarChart3, TrendingUp, Download } from 'lucide-react';

interface ReportSummary {
  totalScans: number;
  authenticRate: number;
  activeAlerts: number;
  dailyScans: { date: string; count: number }[];
}

export default function PortalReports() {
  const { token } = usePortalAuth();
  const [data, setData] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch('/api/reports/summary', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <button className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
          <Download size={16} /> Export CSV
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-center py-8">Loading report data...</p>
      ) : data ? (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 size={18} className="text-teal-600" />
                <span className="text-sm text-gray-500">Total Scans</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{data.totalScans.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={18} className="text-green-600" />
                <span className="text-sm text-gray-500">Authentic Rate</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{data.authenticRate.toFixed(1)}%</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 size={18} className="text-red-600" />
                <span className="text-sm text-gray-500">Active Alerts</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{data.activeAlerts}</p>
            </div>
          </div>

          {data.dailyScans.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Daily Scan Volume</h3>
              <div className="flex items-end gap-1 h-48">
                {data.dailyScans.map((day, i) => {
                  const max = Math.max(...data.dailyScans.map(d => d.count), 1);
                  const height = (day.count / max) * 100;
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-teal-500 rounded-t hover:bg-teal-600 transition cursor-pointer relative group"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 whitespace-nowrap">
                        {day.date}: {day.count}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-400 text-center py-8">No report data available</p>
      )}
    </div>
  );
}
