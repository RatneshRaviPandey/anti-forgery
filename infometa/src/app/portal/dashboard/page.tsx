'use client';

import { useEffect, useState } from 'react';
import { usePortalAuth } from '../layout';
import { Package, Layers, QrCode, AlertTriangle, ShieldCheck, TrendingUp } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

interface DashboardData {
  totalScans: number;
  recentScans: number;
  authenticScans: number;
  suspiciousScans: number;
  invalidScans: number;
  authenticRate: number;
  openAlerts: number;
  products: number;
  batches: number;
  dailyScans: { date: string; count: number }[];
}

interface AnalyticsData {
  scansByDay: { date: string; scans: number; suspicious: number }[];
  scansByResult: { result: string; count: number }[];
  scansByCity: { city: string; count: number }[];
}

const COLORS = { authentic: '#16A34A', suspicious: '#F59E0B', invalid: '#DC2626' };
const PERIOD_OPTIONS = [
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' },
];

export default function PortalDashboard() {
  const { token, brand } = usePortalAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);

    Promise.all([
      fetch('/api/reports/summary', { credentials: 'include' }).then(r => r.json()),
      fetch(`/api/reports/analytics?period=${period}`, { credentials: 'include' }).then(r => r.json()),
    ]).then(([summary, anal]) => {
      if (summary.success) setData(summary.data);
      if (anal.success) setAnalytics(anal.data);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, [token, period]);

  const kpis = [
    { label: 'Products', value: data?.products ?? 0, icon: Package, color: 'bg-blue-50 text-blue-600' },
    { label: 'Batches', value: data?.batches ?? 0, icon: Layers, color: 'bg-purple-50 text-purple-600' },
    { label: 'Total Scans', value: data?.totalScans ?? 0, icon: QrCode, color: 'bg-teal-50 text-teal-600' },
    { label: 'This Month', value: data?.recentScans ?? 0, icon: TrendingUp, color: 'bg-cyan-50 text-cyan-600' },
    { label: 'Authentic Rate', value: `${(data?.authenticRate ?? 0).toFixed(1)}%`, icon: ShieldCheck, color: 'bg-green-50 text-green-600' },
    { label: 'Active Alerts', value: data?.openAlerts ?? 0, icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
  ];

  const pieData = [
    { name: 'Authentic', value: data?.authenticScans ?? 0, color: COLORS.authentic },
    { name: 'Suspicious', value: data?.suspiciousScans ?? 0, color: COLORS.suspicious },
    { name: 'Invalid', value: data?.invalidScans ?? 0, color: COLORS.invalid },
  ].filter(d => d.value > 0);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-700" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + period toggle */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back{brand ? `, ${brand.name}` : ''}</p>
        </div>
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
          {PERIOD_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                period === opt.value ? 'bg-teal-700 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >{opt.label}</button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Scan Trend Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Scan Trend</h3>
          {analytics?.scansByDay && analytics.scansByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={analytics.scansByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94A3B8" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="scans" name="Total" stroke="#0F766E" fill="#0F766E" fillOpacity={0.15} />
                <Area type="monotone" dataKey="suspicious" name="Suspicious" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-sm text-gray-400">No scan data yet</div>
          )}
        </div>

        {/* Verification Breakdown Pie */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Verification Results</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-sm text-gray-400">No verification data</div>
          )}
        </div>
      </div>

      {/* Top Cities Bar Chart */}
      {analytics?.scansByCity && analytics.scansByCity.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Top Scanning Cities</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.scansByCity.slice(0, 10)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94A3B8" />
              <YAxis type="category" dataKey="city" tick={{ fontSize: 11 }} stroke="#94A3B8" width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#0F766E" radius={[0, 4, 4, 0]} name="Scans" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
