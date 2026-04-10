'use client';

import { useState } from 'react';
import { usePortalAuth } from '../../layout';
import { Shield, Loader2 } from 'lucide-react';

export default function SecuritySettings() {
  const { token, user } = usePortalAuth();
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaData, setMfaData] = useState<{
    otpauthUrl: string; secret: string; backupCodes: string[];
  } | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState('');

  async function setupMFA() {
    if (!token) return;
    setMfaLoading(true);
    try {
      const res = await fetch('/api/auth/mfa', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setMfaData(data.data);
    } finally {
      setMfaLoading(false);
    }
  }

  async function confirmMFA(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    const res = await fetch('/api/auth/mfa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ code: mfaCode }),
    });
    const data = await res.json();
    if (data.success) {
      setMfaData(null);
      setMfaCode('');
      window.location.reload();
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setPwLoading(true);
    setPwMessage('');
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(pwForm),
      });
      const data = await res.json();
      setPwMessage(data.success ? 'Password changed!' : data.error);
      if (data.success) setPwForm({ currentPassword: '', newPassword: '' });
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>

      {/* MFA Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield size={20} className="text-teal-600" />
          <h3 className="font-semibold text-gray-900">Two-Factor Authentication</h3>
        </div>

        {user?.mfaEnabled ? (
          <p className="text-sm text-green-600 font-medium">MFA is enabled on your account.</p>
        ) : !mfaData ? (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              Add an extra layer of security to your account with TOTP-based MFA.
            </p>
            <button
              onClick={setupMFA} disabled={mfaLoading}
              className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center gap-2"
            >
              {mfaLoading && <Loader2 size={16} className="animate-spin" />}
              Set Up MFA
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Scan this code with your authenticator app (Google Authenticator, Authy, etc.):
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="font-mono text-sm text-gray-700 break-all mb-2">{mfaData.secret}</p>
              <p className="text-xs text-gray-400">Or use the OTPAuth URL in your app</p>
            </div>
            <form onSubmit={confirmMFA} className="flex gap-3">
              <input
                type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6}
                required value={mfaCode}
                onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none font-mono text-center text-lg tracking-widest"
                placeholder="000000"
              />
              <button
                type="submit"
                className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition"
              >
                Verify
              </button>
            </form>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm font-medium text-yellow-800 mb-2">Backup Codes — Save These!</p>
              <div className="grid grid-cols-2 gap-1 font-mono text-sm text-yellow-700">
                {mfaData.backupCodes.map(code => (
                  <span key={code}>{code}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Password Change */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Change Password</h3>
        {pwMessage && (
          <div className={`text-sm px-3 py-2 rounded mb-4 ${
            pwMessage.includes('changed') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>{pwMessage}</div>
        )}
        <form onSubmit={changePassword} className="space-y-4">
          <input
            type="password" required placeholder="Current password"
            value={pwForm.currentPassword}
            onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          />
          <input
            type="password" required placeholder="New password (min 12 characters)"
            value={pwForm.newPassword}
            onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          />
          <button
            type="submit" disabled={pwLoading}
            className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center gap-2"
          >
            {pwLoading && <Loader2 size={16} className="animate-spin" />}
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}
