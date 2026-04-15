'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePortalAuth } from '../../layout';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const INDUSTRIES = [
  'dairy', 'pharma', 'cosmetics', 'fmcg', 'agro_products',
  'electronics', 'auto_parts', 'lubricants', 'supplements',
  'beverages', 'luxury', 'industrial_chemicals',
];

export default function NewProduct() {
  const { token } = usePortalAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', sku: '', industry: '', description: '', category: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/products', { credentials: 'include', method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          },
        body: JSON.stringify(form), });
      const data = await res.json();
      if (!data.success) { setError(data.error || 'Failed'); setLoading(false); return; }
      toast.success('Product created successfully!');
      router.push('/portal/products');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <Link href="/portal/products" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> Back to Products
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
          <input
            required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
            <input
              required value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
            <select
              required value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
            >
              <option value="">Select</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none"
          />
        </div>
        <button
          type="submit" disabled={loading}
          className="bg-teal-700 hover:bg-teal-800 text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          Create Product
        </button>
      </form>
    </div>
  );
}
