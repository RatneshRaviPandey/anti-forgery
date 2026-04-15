"use client";

import { useEffect, useState } from "react";
import { usePortalAuth } from "../layout";
import { Download } from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface Summary {
  totalScans: number; authenticScans: number; suspiciousScans: number;
  invalidScans: number; authenticRate: number; openAlerts: number; products: number;
}
interface Analytics {
  scansByDay: { date: string; scans: number; suspicious: number }[];
  scansByCity: { city: string; count: number }[];
}

const COLORS = { authentic: "#16A34A", suspicious: "#F59E0B", invalid: "#DC2626" };
const PERIODS = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
];

export default function PortalReports() {
  const { token } = usePortalAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [period, setPeriod] = useState("30d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      fetch("/api/reports/summary", { credentials: "include" }).then(r => r.json()),
      fetch(`/api/reports/analytics?period=${period}`, { credentials: "include" }).then(r => r.json()),
    ]).then(([s, a]) => {
      if (s.success) setSummary(s.data);
      if (a.success) setAnalytics(a.data);
    }).finally(() => setLoading(false));
  }, [token, period]);

  function exportCSV() {
    if (!analytics?.scansByDay) return;
    const header = "Date,Total Scans,Suspicious";
    const rows = analytics.scansByDay.map(d => `${d.date},${d.scans},${d.suspicious}`);
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `report-${period}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const pieData = [
    { name: "Authentic", value: summary?.authenticScans ?? 0, color: COLORS.authentic },
    { name: "Suspicious", value: summary?.suspiciousScans ?? 0, color: COLORS.suspicious },
    { name: "Invalid", value: summary?.invalidScans ?? 0, color: COLORS.invalid },
  ].filter(d => d.value > 0);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-700" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
            {PERIODS.map(p => (
              <button key={p.value} onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                  period === p.value ? "bg-teal-700 text-white" : "text-gray-600 hover:bg-gray-100"
                }`}>{p.label}</button>
            ))}
          </div>
          <button onClick={exportCSV}
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:text-gray-900">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Scans", value: (summary?.totalScans ?? 0).toLocaleString() },
          { label: "Authentic Rate", value: `${(summary?.authenticRate ?? 0).toFixed(1)}%` },
          { label: "Active Alerts", value: String(summary?.openAlerts ?? 0) },
          { label: "Products", value: String(summary?.products ?? 0) },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-2xl font-bold text-gray-900">{k.value}</p>
            <p className="text-sm text-gray-500">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Volume Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Daily Scan Volume</h3>
          {analytics?.scansByDay && analytics.scansByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analytics.scansByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94A3B8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94A3B8" />
                <Tooltip />
                <Legend />
                <Bar dataKey="scans" fill="#0F766E" name="Total" radius={[4,4,0,0]} />
                <Bar dataKey="suspicious" fill="#F59E0B" name="Suspicious" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-[280px] flex items-center justify-center text-sm text-gray-400">No data</div>}
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Verification Results</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-[280px] flex items-center justify-center text-sm text-gray-400">No data</div>}
        </div>
      </div>

      {/* Top Cities */}
      {analytics?.scansByCity && analytics.scansByCity.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Top Scanning Cities</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.scansByCity.slice(0, 10)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94A3B8" />
              <YAxis type="category" dataKey="city" tick={{ fontSize: 11 }} stroke="#94A3B8" width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#0F766E" radius={[0,4,4,0]} name="Scans" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}