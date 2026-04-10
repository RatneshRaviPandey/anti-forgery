'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePortalAuth } from '../../layout';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewBatch() {
  const { token } = usePortalAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    productId: '', batchCode: '', totalUnits: '',
    manufactureDate: '', expiryDate: '', notes: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          totalUnits: parseInt(form.totalUnits, 10),
        }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || 'Failed'); setLoading(false); return; }
      router.push('/portal/batches');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <Link href="/portal/batches" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> Back to Batches
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Batch</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Batch Code</label>
          <input
            required value={form.batchCode}
            onChange={e => setForm(f => ({ ...f, batchCode: e.target.value }))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none font-mono"
            placeholder="BATCH-2026-001"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Units</label>
            <input
              type="number" min="1" max="100000" required
              value={form.totalUnits}
              onChange={e => setForm(f => ({ ...f, totalUnits: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product ID</label>
            <input
              required value={form.productId}
              onChange={e => setForm(f => ({ ...f, productId: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none font-mono text-sm"
              placeholder="Product UUID"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manufacture Date</label>
            <input
              type="date" value={form.manufactureDate}
              onChange={e => setForm(f => ({ ...f, manufactureDate: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
            <input
              type="date" value={form.expiryDate}
              onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
          </div>
        </div>
        <button
          type="submit" disabled={loading}
          className="bg-teal-700 hover:bg-teal-800 text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          Create Batch
        </button>
      </form>
    </div>
  );
}
