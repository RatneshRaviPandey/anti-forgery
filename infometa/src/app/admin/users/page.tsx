'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '../layout';
import { Users, Search, ChevronLeft, ChevronRight, Ban, CheckCircle, Unlock, KeyRound } from 'lucide-react';

interface UserItem {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  isSuperAdmin: boolean;
  brandId: string | null;
  brandName: string | null;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  emailVerified: boolean;
  mfaEnabled: boolean;
  failedAttempts: number;
  lockedUntil: string | null;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { token } = useAdminAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [resetModal, setResetModal] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const limit = 15;

  useEffect(() => {
    if (!token) return;
    fetchUsers();
  }, [token, page, search]);

  function fetchUsers() {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set('search', search);

    fetch(`/api/superadmin/users?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setUsers(data.data);
          setTotal(data.meta?.total ?? 0);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  async function updateUser(id: string, updates: Record<string, unknown>) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/superadmin/users/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) fetchUsers();
    } catch { /* ignore */ }
    setActionLoading(null);
  }

  async function handleResetPassword() {
    if (!resetModal || newPassword.length < 12) return;
    await updateUser(resetModal, { resetPassword: newPassword });
    setResetModal(null);
    setNewPassword('');
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">All Users</h1>
        <p className="text-sm text-secondary">Manage all users across all brands.</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-700" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="mx-auto h-10 w-10 mb-3 text-gray-300" />
            <p>No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Brand</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">MFA</th>
                  <th className="px-4 py-3">Last Login</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold">
                          {user.name?.charAt(0).toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {user.isSuperAdmin ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">Super Admin</span>
                      ) : (
                        user.brandName ?? <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 capitalize">{user.role}</td>
                    <td className="px-4 py-3">
                      {user.lockedUntil && new Date(user.lockedUntil) > new Date() ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">Locked</span>
                      ) : user.isActive ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Active</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">Disabled</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {user.mfaEnabled ? (
                        <span className="text-xs text-green-600 font-medium">Enabled</span>
                      ) : (
                        <span className="text-xs text-gray-400">Off</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {user.isActive ? (
                          <button
                            onClick={() => updateUser(user.id, { isActive: false })}
                            disabled={actionLoading === user.id || user.isSuperAdmin}
                            className="p-1.5 rounded hover:bg-red-50 text-red-600 transition disabled:opacity-30"
                            title="Disable"
                          >
                            <Ban size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => updateUser(user.id, { isActive: true })}
                            disabled={actionLoading === user.id}
                            className="p-1.5 rounded hover:bg-green-50 text-green-600 transition disabled:opacity-30"
                            title="Enable"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        {user.lockedUntil && new Date(user.lockedUntil) > new Date() && (
                          <button
                            onClick={() => updateUser(user.id, { lockedUntil: null, failedAttempts: 0 })}
                            disabled={actionLoading === user.id}
                            className="p-1.5 rounded hover:bg-yellow-50 text-yellow-600 transition disabled:opacity-30"
                            title="Unlock"
                          >
                            <Unlock size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => setResetModal(user.id)}
                          disabled={user.isSuperAdmin}
                          className="p-1.5 rounded hover:bg-blue-50 text-blue-600 transition disabled:opacity-30"
                          title="Reset Password"
                        >
                          <KeyRound size={16} />
                        </button>
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
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={16} /></button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Reset Password Modal */}
      {resetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Reset User Password</h3>
            <p className="text-sm text-gray-500 mb-4">
              Set a new password for this user. They will be required to change it on next login. All their sessions will be revoked.
            </p>
            <input
              type="text"
              placeholder="New password (min 12 characters)"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setResetModal(null); setNewPassword(''); }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                disabled={newPassword.length < 12}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
