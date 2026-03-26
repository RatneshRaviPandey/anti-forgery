'use client';

import { usePortalAuth } from '../../layout';
import { Key } from 'lucide-react';

export default function ApiKeysSettings() {
  const { brand } = usePortalAuth();

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Key size={20} className="text-teal-600" />
          <h3 className="font-semibold text-gray-900">REST API Access</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Use API keys to integrate Infometa verification into your own applications.
        </p>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">Brand ID</p>
          <code className="text-sm font-mono text-gray-700">{brand?.id ?? 'N/A'}</code>
        </div>
        <p className="text-xs text-gray-400 mt-4">
          Full API documentation coming soon. Contact support for early access.
        </p>
      </div>
    </div>
  );
}
