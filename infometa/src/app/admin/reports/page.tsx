"use client";

import { useDashboardSummary, useAnalytics } from "@/hooks/use-api";
import { KPITile } from "@/components/ui/kpi-tile";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function ReportsPage() {
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics('30d');

  const totalScans = summary?.totalScans ?? 0;
  const authenticScans = summary?.authenticScans ?? 0;
  const suspiciousScans = summary?.suspiciousScans ?? 0;
  const invalidScans = summary?.invalidScans ?? 0;

  const pieData = [
    { name: "Authentic", value: authenticScans, color: "#16A34A" },
    { name: "Suspicious", value: suspiciousScans, color: "#F59E0B" },
    { name: "Invalid", value: invalidScans, color: "#DC2626" },
  ];

  // Top cities from API analytics
  const topCities = analytics?.scansByCity ?? [];

  const dailyData = analytics?.scansByDay ?? [];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Reports & Analytics</h1>
        <p className="text-sm text-secondary">Aggregated insights from your verification data.</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Total Scans" value={totalScans.toLocaleString()} trend="+12%" trendUp />
        <KPITile label="Authentic Rate" value={totalScans > 0 ? `${((authenticScans / totalScans) * 100).toFixed(1)}%` : '0%'} trend="+0.5%" trendUp />
        <KPITile label="Active Alerts" value={String(summary?.openAlerts ?? 0)} trend="" trendUp={false} />
        <KPITile label="Products Monitored" value={String(summary?.products ?? 0)} trend="" trendUp />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Scan Status Pie */}
        <div className="rounded-xl border border-border bg-white p-5">
          <h2 className="mb-4 text-base font-semibold text-foreground">Verification Results Breakdown</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Cities Bar */}
        <div className="rounded-xl border border-border bg-white p-5">
          <h2 className="mb-4 text-base font-semibold text-foreground">Top Scanning Cities</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topCities} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94A3B8" />
              <YAxis type="category" dataKey="city" tick={{ fontSize: 11 }} stroke="#94A3B8" width={90} />
              <Tooltip />
              <Bar dataKey="count" fill="#0F766E" radius={[0, 4, 4, 0]} name="Scans" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Volume Chart */}
      <div className="rounded-xl border border-border bg-white p-5">
        <h2 className="mb-4 text-base font-semibold text-foreground">Daily Scan Volume</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94A3B8" />
            <YAxis tick={{ fontSize: 11 }} stroke="#94A3B8" />
            <Tooltip />
            <Legend />
            <Bar dataKey="scans" fill="#0F766E" name="Total" radius={[4, 4, 0, 0]} />
            <Bar dataKey="suspicious" fill="#F59E0B" name="Suspicious" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
