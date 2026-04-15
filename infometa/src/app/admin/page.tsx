"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "./layout";
import {
  Building2, Users, Package, Layers, QrCode, ScanLine,
  AlertTriangle, ShieldCheck, MessageSquare, TrendingUp,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

interface PlatformStats {
  brands: number;
  users: number;
  products: number;
  batches: number;
  qrCodes: number;
  scans: number;
  alerts: number;
  activeAlerts: number;
  inquiries: number;
  newInquiries: number;
}

export default function AdminDashboard() {
  const { token } = useAdminAuth();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch('/api/superadmin/stats', {
      credentials: 'include',
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) setStats(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const tiles = [
    { label: 'Brands',        value: stats?.brands ?? 0,        icon: Building2,      color: 'bg-blue-50 text-blue-600' },
    { label: 'Users',         value: stats?.users ?? 0,         icon: Users,          color: 'bg-purple-50 text-purple-600' },
    { label: 'Products',      value: stats?.products ?? 0,      icon: Package,        color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Batches',       value: stats?.batches ?? 0,       icon: Layers,         color: 'bg-cyan-50 text-cyan-600' },
    { label: 'QR Codes',      value: stats?.qrCodes ?? 0,       icon: QrCode,         color: 'bg-teal-50 text-teal-600' },
    { label: 'Total Scans',   value: stats?.scans ?? 0,         icon: ScanLine,       color: 'bg-green-50 text-green-600' },
    { label: 'Active Alerts', value: stats?.activeAlerts ?? 0,  icon: AlertTriangle,  color: 'bg-red-50 text-red-600' },
    { label: 'New Inquiries', value: stats?.newInquiries ?? 0,   icon: MessageSquare,  color: 'bg-pink-50 text-pink-600' },
    { label: 'Total Alerts',  value: stats?.alerts ?? 0,        icon: ShieldCheck,    color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Super Admin Dashboard</h1>
        <p className="text-sm text-secondary">Platform-wide overview of all brands and activity.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700" />
        </div>
      ) : (
        <>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {tiles.map(tile => (
            <div key={tile.label} className="rounded-xl border border-border bg-white p-5">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${tile.color}`}>
                <tile.icon size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{tile.value.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">{tile.label}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Entity Distribution */}
          <div className="rounded-xl border border-border bg-white p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Platform Overview</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[
                { name: 'Brands', count: stats?.brands ?? 0 },
                { name: 'Users', count: stats?.users ?? 0 },
                { name: 'Products', count: stats?.products ?? 0 },
                { name: 'Batches', count: stats?.batches ?? 0 },
                { name: 'QR Codes', count: stats?.qrCodes ?? 0 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <Tooltip />
                <Bar dataKey="count" fill="#0F766E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Alerts & Inquiries Pie */}
          <div className="rounded-xl border border-border bg-white p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Activity Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Total Scans', value: stats?.scans ?? 0, color: '#0F766E' },
                    { name: 'Active Alerts', value: stats?.activeAlerts ?? 0, color: '#DC2626' },
                    { name: 'New Inquiries', value: stats?.newInquiries ?? 0, color: '#EC4899' },
                    { name: 'Total Alerts', value: stats?.alerts ?? 0, color: '#F59E0B' },
                  ].filter(d => d.value > 0)}
                  dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label
                >
                  {[
                    { color: '#0F766E' },
                    { color: '#DC2626' },
                    { color: '#EC4899' },
                    { color: '#F59E0B' },
                  ].map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-border bg-white p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <a href="/admin/brands" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-50 text-teal-700 text-sm font-medium hover:bg-teal-100 transition">
              <Building2 size={16} /> View All Brands
            </a>
            <a href="/admin/live-feed" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition">
              <TrendingUp size={16} /> Live Scan Feed
            </a>
            <a href="/admin/inquiries" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-50 text-pink-700 text-sm font-medium hover:bg-pink-100 transition">
              <MessageSquare size={16} /> Inquiries ({stats?.newInquiries ?? 0} new)
            </a>
            <a href="/admin/admin-users" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-50 text-purple-700 text-sm font-medium hover:bg-purple-100 transition">
              <Users size={16} /> Manage Admins
            </a>
          </div>
        </div>
        </>
      )}
    </div>
  );
}
