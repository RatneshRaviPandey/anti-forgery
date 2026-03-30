'use client';

import { useEffect, useState } from 'react';
import { usePortalAuth } from '../layout';
import Link from 'next/link';
import { Plus, Layers, Search } from 'lucide-react';

interface Batch {
  id: string; batchCode: string; productId: string;
  totalUnits: number; generatedUnits: number;
  isActive: boolean; manufactureDate: string | null;
  expiryDate: string | null; createdAt: string;
}

export default function PortalBatches() {
  const { token } = usePortalAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch('/api/batches?limit=50', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { if (d.success) setBatches(d.data); })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Batches</h1>
        <Link
          href="/portal/batches/new"
          className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
        >
          <Plus size={16} /> New Batch
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="text-left px-4 py-3">Batch Code</th>
              <th className="text-left px-4 py-3">Units</th>
              <th className="text-left px-4 py-3">Generated</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Expiry</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading...</td></tr>
            ) : batches.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">No batches found</td></tr>
            ) : batches.map(b => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/portal/batches/${b.id}`} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded flex items-center justify-center">
                      <Layers size={16} />
                    </div>
                    <span className="font-medium text-gray-900 font-mono">{b.batchCode}</span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{b.totalUnits.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{(b.generatedUnits ?? 0).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    b.isActive ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                  }`}>
                    {b.isActive ? 'Activated' : 'Pending'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {b.expiryDate ? new Date(b.expiryDate).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
