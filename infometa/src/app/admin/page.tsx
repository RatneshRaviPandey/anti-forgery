"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "./layout";
import {
  Building2,
  Users,
  Package,
  Layers,
  QrCode,
  ScanLine,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";

interface PlatformStats {
  brands: number;
  users: number;
  products: number;
  batches: number;
  qrCodes: number;
  scans: number;
  alerts: number;
  activeAlerts: number;
}

export default function AdminDashboard() {
  const { token } = useAdminAuth();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch('/api/superadmin/stats', {
      headers: { Authorization: `Bearer ${token}` },
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
      )}
    </div>
  );
}
