'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '../layout';
import { Key, Plus, Ban, Download, Copy, Check } from 'lucide-react';

interface BrandKeyItem {
  id: string;
  keyId: string;
  brandId: string;
  brandName: string;
  version: number;
  isActive: boolean;
  issuedAt: string;
  expiresAt: string;
  revokedAt: string | null;
  lastUsedAt: string | null;
  verifyCount: number;
  notes: string | null;
}

interface BrandOption {
  id: string;
  name: string;
}

interface CreatedKeyFile {
  keyId: string;
  brandName: string;
  brandCode: string;
  encryptionKey: string;
  version: number;
  issuedAt: string;
  expiresAt: string;
}

export default function AdminBrandKeysPage() {
  const { token } = useAdminAuth();
  const [keys, setKeys] = useState<BrandKeyItem[]>([]);
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [expiryDays, setExpiryDays] = useState(365);
  const [notes, setNotes] = useState('');
  const [creating, setCreating] = useState(false);
  const [createdKey, setCreatedKey] = useState<CreatedKeyFile | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchKeys();
    fetchBrands();
  }, [token]);

  async function fetchKeys() {
    setLoading(true);
    const res = await fetch('/api/superadmin/brand-keys', {
      credentials: 'include',
    });
    const data = await res.json();
    if (data.success) setKeys(data.data);
    setLoading(false);
  }

  async function fetchBrands() {
    const res = await fetch('/api/superadmin/brands?limit=100', {
      credentials: 'include',
    });
    const data = await res.json();
    if (data.success) setBrands(data.data.map((b: { id: string; name: string }) => ({ id: b.id, name: b.name })));
  }

  async function handleCreate() {
    if (!selectedBrand) return;
    setCreating(true);
    const res = await fetch('/api/superadmin/brand-keys', { credentials: 'include', method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brandId: selectedBrand, expiryDays, notes: notes || undefined }),
    });
    const data = await res.json();
    if (data.success) {
      setCreatedKey(data.data.keyFile);
      setShowCreate(false);
      fetchKeys();
    }
    setCreating(false);
  }

  async function handleRevoke(id: string) {
    if (!confirm('Revoke this key? Brands using it will no longer generate valid codes.')) return;
    await fetch(`/api/superadmin/brand-keys/${id}`, { credentials: 'include', method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'revoke' }),
    });
    fetchKeys();
  }

  function downloadKeyFile(key: CreatedKeyFile) {
    const content = JSON.stringify(key, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `infometa-key-${key.brandCode}-v${key.version}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function copyKeyFile(key: CreatedKeyFile) {
    navigator.clipboard.writeText(JSON.stringify(key, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function isExpired(dateStr: string) {
    return new Date(dateStr) < new Date();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Brand Keys</h1>
          <p className="text-sm text-secondary">Manage encryption keys for offline code generation.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-sm font-medium transition"
        >
          <Plus size={16} /> Issue New Key
        </button>
      </div>

      {/* Created key display (shown once!) */}
      {createdKey && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
            <Key size={18} /> Key Created — Save This Now!
          </h3>
          <p className="text-sm text-green-700 mb-4">
            This is the only time the encryption key will be shown. Download or copy the key file to distribute to the brand.
          </p>
          <pre className="bg-white border border-green-200 rounded-lg p-4 text-xs font-mono overflow-auto max-h-48">
            {JSON.stringify(createdKey, null, 2)}
          </pre>
          <div className="flex gap-3 mt-4">
            <button onClick={() => downloadKeyFile(createdKey)}
              className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg text-sm font-medium transition">
              <Download size={16} /> Download .json
            </button>
            <button onClick={() => copyKeyFile(createdKey)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-green-300 hover:bg-green-50 text-green-700 rounded-lg text-sm font-medium transition">
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={() => setCreatedKey(null)}
              className="ml-auto px-4 py-2 text-sm text-green-600 hover:text-green-800">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Create form modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Issue Brand Key</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none">
                  <option value="">Select brand...</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Validity (days)</label>
                <input type="number" value={expiryDays} onChange={e => setExpiryDays(Number(e.target.value))}
                  min={30} max={3650}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Annual subscription 2026"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={handleCreate} disabled={!selectedBrand || creating}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition">
                {creating ? 'Creating...' : 'Create Key'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keys table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-700" />
          </div>
        ) : keys.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Key className="mx-auto h-10 w-10 mb-3 text-gray-300" />
            <p>No brand keys issued yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3">Key ID</th>
                  <th className="px-4 py-3">Brand</th>
                  <th className="px-4 py-3">Version</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Verifications</th>
                  <th className="px-4 py-3">Expires</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {keys.map(k => (
                  <tr key={k.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{k.keyId}</td>
                    <td className="px-4 py-3 font-medium">{k.brandName}</td>
                    <td className="px-4 py-3">v{k.version}</td>
                    <td className="px-4 py-3">
                      {k.revokedAt ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">Revoked</span>
                      ) : isExpired(k.expiresAt) ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">Expired</span>
                      ) : k.isActive ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Active</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">Inactive</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{k.verifyCount?.toLocaleString() ?? 0}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(k.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {k.isActive && !k.revokedAt && (
                        <button onClick={() => handleRevoke(k.id)}
                          className="p-1.5 rounded hover:bg-red-50 text-red-600 transition" title="Revoke">
                          <Ban size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
