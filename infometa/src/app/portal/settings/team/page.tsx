'use client';

import { useEffect, useState } from 'react';
import { usePortalAuth } from '../../layout';
import { Users, Plus, Shield } from 'lucide-react';

interface TeamMember {
  id: string; name: string; email: string; role: string;
  isActive: boolean; lastLoginAt: string | null; mfaEnabled: boolean;
}

export default function TeamSettings() {
  const { token, user } = usePortalAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'viewer'>('viewer');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch('/api/portal/team', {
      credentials: 'include',
    })
      .then(r => r.json())
      .then(d => { if (d.success) setMembers(d.data); })
      .finally(() => setLoading(false));
  }, [token]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    try {
      const res = await fetch('/api/portal/team', { credentials: 'include', method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ email: inviteEmail, name: inviteName, role: inviteRole }),
      });
      const data = await res.json();
      if (data.success) {
        setShowInvite(false);
        setInviteEmail('');
        setInviteName('');
        // Refresh list
        window.location.reload();
      }
    } finally {
      setInviting(false);
    }
  }

  const isAdmin = user?.role === 'owner' || user?.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
        {isAdmin && (
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
          >
            <Plus size={16} /> Invite Member
          </button>
        )}
      </div>

      {showInvite && (
        <form onSubmit={handleInvite} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Invite Team Member</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              required placeholder="Name" value={inviteName}
              onChange={e => setInviteName(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
            <input
              type="email" required placeholder="Email" value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-4">
            <select
              value={inviteRole} onChange={e => setInviteRole(e.target.value as 'admin' | 'viewer')}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white"
            >
              <option value="viewer">Viewer (read-only)</option>
              <option value="admin">Admin (full access)</option>
            </select>
            <button
              type="submit" disabled={inviting}
              className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              Send Invite
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="text-left px-4 py-3">Member</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">MFA</th>
              <th className="text-left px-4 py-3">Last Login</th>
              <th className="text-left px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading...</td></tr>
            ) : members.map(m => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{m.name}</p>
                    <p className="text-sm text-gray-500">{m.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm capitalize text-gray-700">{m.role}</span>
                </td>
                <td className="px-4 py-3">
                  {m.mfaEnabled ? (
                    <Shield size={16} className="text-green-500" />
                  ) : (
                    <span className="text-xs text-gray-400">Off</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {m.lastLoginAt ? new Date(m.lastLoginAt).toLocaleDateString() : 'Never'}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    m.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>{m.isActive ? 'Active' : 'Inactive'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
