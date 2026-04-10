'use client';

import { useEffect, useState } from 'react';
import { usePortalAuth } from '../layout';
import { Package, Layers, QrCode, BarChart3, AlertTriangle, ShieldCheck } from 'lucide-react';

interface DashboardData {
  totalScans: number;
  authenticRate: number;
  activeAlerts: number;
  dailyScans: { date: string; count: number }[];
}

export default function PortalDashboard() {
  const { token, brand } = usePortalAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [products, setProducts] = useState<number>(0);
  const [batches, setBatches] = useState<number>(0);

  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch('/api/reports/summary', { headers }).then(r => r.json()),
      fetch('/api/products?limit=1', { headers }).then(r => r.json()),
      fetch('/api/batches?limit=1', { headers }).then(r => r.json()),
    ]).then(([summary, prods, batch]) => {
      if (summary.success) setData(summary.data);
      if (prods.meta) setProducts(prods.meta.total);
      if (batch.meta) setBatches(batch.meta.total);
    }).catch(() => {});
  }, [token]);

  const stats = [
    { label: 'Products', value: products, icon: Package, color: 'bg-blue-50 text-blue-600' },
    { label: 'Batches', value: batches, icon: Layers, color: 'bg-purple-50 text-purple-600' },
    { label: 'Total Scans', value: data?.totalScans ?? 0, icon: QrCode, color: 'bg-teal-50 text-teal-600' },
    { label: 'Authentic Rate', value: `${(data?.authenticRate ?? 0).toFixed(1)}%`, icon: ShieldCheck, color: 'bg-green-50 text-green-600' },
    { label: 'Active Alerts', value: data?.activeAlerts ?? 0, icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back{brand ? `, ${brand.name}` : ''}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Daily scans chart placeholder */}
      {data?.dailyScans && data.dailyScans.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Scan Activity (Last 30 Days)</h3>
          <div className="flex items-end gap-1 h-40">
            {data.dailyScans.map((day, i) => {
              const max = Math.max(...data.dailyScans.map(d => d.count), 1);
              const height = (day.count / max) * 100;
              return (
                <div
                  key={i}
                  className="flex-1 bg-teal-500 rounded-t hover:bg-teal-600 transition cursor-pointer relative group"
                  style={{ height: `${Math.max(height, 2)}%` }}
                  title={`${day.date}: ${day.count} scans`}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 whitespace-nowrap">
                    {day.count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
