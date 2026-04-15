"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "../layout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface BrandData {
  id: string; name: string; status: string; plan: string;
  _scanCount: number; _productCount: number; _batchCount: number;
  _authRate: number; _activeAlerts: number; _healthScore: number;
}

export default function BrandComparisonPage() {
  const { token } = useAdminAuth();
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch("/api/superadmin/brands?limit=50", { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.success) setBrands(d.data); })
      .finally(() => setLoading(false));
  }, [token]);

  const toggleBrand = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  };

  const selectedBrands = brands.filter(b => selected.includes(b.id));

  const chartData = [
    { metric: "Scans", ...Object.fromEntries(selectedBrands.map(b => [b.name, b._scanCount])) },
    { metric: "Products", ...Object.fromEntries(selectedBrands.map(b => [b.name, b._productCount])) },
    { metric: "Batches", ...Object.fromEntries(selectedBrands.map(b => [b.name, b._batchCount])) },
    { metric: "Alerts", ...Object.fromEntries(selectedBrands.map(b => [b.name, b._activeAlerts])) },
    { metric: "Health", ...Object.fromEntries(selectedBrands.map(b => [b.name, b._healthScore])) },
  ];

  const COLORS = ["#0F766E", "#7C3AED", "#EA580C", "#2563EB"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Brand Comparison</h1>
        <p className="text-sm text-secondary">Select up to 4 brands to compare side-by-side.</p>
      </div>

      {/* Brand Selector */}
      <div className="flex flex-wrap gap-2">
        {brands.map(b => (
          <button
            key={b.id}
            onClick={() => toggleBrand(b.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
              selected.includes(b.id)
                ? "bg-teal-700 text-white border-teal-700"
                : "bg-white text-gray-700 border-gray-200 hover:border-teal-300"
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      {selectedBrands.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
          <p className="text-5xl mb-4">📊</p>
          <p className="text-gray-500">Click on brands above to start comparing.</p>
        </div>
      ) : (
        <>
          {/* Comparison Table */}
          <div className="rounded-xl border border-border bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="px-4 py-3 text-left text-secondary font-medium">Metric</th>
                  {selectedBrands.map((b, i) => (
                    <th key={b.id} className="px-4 py-3 text-left font-medium" style={{ color: COLORS[i] }}>
                      {b.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                <tr><td className="px-4 py-3 text-secondary">Health Score</td>
                  {selectedBrands.map(b => <td key={b.id} className="px-4 py-3 font-bold">{b._healthScore}/100</td>)}
                </tr>
                <tr><td className="px-4 py-3 text-secondary">Total Scans</td>
                  {selectedBrands.map(b => <td key={b.id} className="px-4 py-3">{b._scanCount.toLocaleString()}</td>)}
                </tr>
                <tr><td className="px-4 py-3 text-secondary">Auth Rate</td>
                  {selectedBrands.map(b => <td key={b.id} className="px-4 py-3">{b._authRate}%</td>)}
                </tr>
                <tr><td className="px-4 py-3 text-secondary">Products</td>
                  {selectedBrands.map(b => <td key={b.id} className="px-4 py-3">{b._productCount}</td>)}
                </tr>
                <tr><td className="px-4 py-3 text-secondary">Batches</td>
                  {selectedBrands.map(b => <td key={b.id} className="px-4 py-3">{b._batchCount}</td>)}
                </tr>
                <tr><td className="px-4 py-3 text-secondary">Active Alerts</td>
                  {selectedBrands.map(b => <td key={b.id} className="px-4 py-3">{b._activeAlerts}</td>)}
                </tr>
                <tr><td className="px-4 py-3 text-secondary">Status</td>
                  {selectedBrands.map(b => <td key={b.id} className="px-4 py-3 capitalize">{b.status}</td>)}
                </tr>
                <tr><td className="px-4 py-3 text-secondary">Plan</td>
                  {selectedBrands.map(b => <td key={b.id} className="px-4 py-3 capitalize">{b.plan}</td>)}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Comparison Chart */}
          <div className="rounded-xl border border-border bg-white p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Visual Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="metric" tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <Tooltip />
                <Legend />
                {selectedBrands.map((b, i) => (
                  <Bar key={b.id} dataKey={b.name} fill={COLORS[i]} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
