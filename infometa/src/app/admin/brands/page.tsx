'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '../layout';
import { Building2, Search, ChevronLeft, ChevronRight, Eye, Ban, CheckCircle } from 'lucide-react';

interface Brand {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  plan: string;
  status: string;
  isActive: boolean;
  country: string;
  createdAt: string;
  _userCount: number;
  _productCount: number;
  _batchCount: number;
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  trial: 'bg-blue-100 text-blue-700',
  suspended: 'bg-red-100 text-red-700',
  churned: 'bg-gray-100 text-gray-600',
  pending_verification: 'bg-yellow-100 text-yellow-700',
};

export default function AdminBrandsPage() {
  const { token } = useAdminAuth();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const limit = 15;

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);

    fetch(`/api/superadmin/brands?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setBrands(data.data);
          setTotal(data.meta?.total ?? 0);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, page, search, statusFilter]);

  async function updateBrand(id: string, updates: Record<string, unknown>) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/superadmin/brands/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        setBrands(prev => prev.map(b => b.id === id ? { ...b, ...updates } as Brand : b));
      }
    } catch { /* ignore */ }
    setActionLoading(null);
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">All Brands</h1>
        <p className="text-sm text-secondary">Manage all registered brands on the platform.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search brands..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="trial">Trial</option>
          <option value="suspended">Suspended</option>
          <option value="churned">Churned</option>
          <option value="pending_verification">Pending</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-700" />
          </div>
        ) : brands.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Building2 className="mx-auto h-10 w-10 mb-3 text-gray-300" />
            <p>No brands found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3">Brand</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Users</th>
                  <th className="px-4 py-3">Products</th>
                  <th className="px-4 py-3">Batches</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {brands.map(brand => (
                  <tr key={brand.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{brand.name}</p>
                      <p className="text-xs text-gray-500">{brand.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[brand.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {brand.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 capitalize">{brand.plan}</td>
                    <td className="px-4 py-3">{brand._userCount}</td>
                    <td className="px-4 py-3">{brand._productCount}</td>
                    <td className="px-4 py-3">{brand._batchCount}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {brand.createdAt ? new Date(brand.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {brand.status === 'suspended' ? (
                          <button
                            onClick={() => updateBrand(brand.id, { status: 'active' })}
                            disabled={actionLoading === brand.id}
                            className="p-1.5 rounded hover:bg-green-50 text-green-600 transition"
                            title="Activate"
                          >
                            <CheckCircle size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => updateBrand(brand.id, { status: 'suspended' })}
                            disabled={actionLoading === brand.id}
                            className="p-1.5 rounded hover:bg-red-50 text-red-600 transition"
                            title="Suspend"
                          >
                            <Ban size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
