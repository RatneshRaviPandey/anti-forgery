'use client';

import { usePortalAuth } from '../layout';

export default function PortalSettings() {
  const { brand, user } = usePortalAuth();

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Brand Settings</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
          <input
            readOnly value={brand?.name ?? ''}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
          <input
            readOnly value={brand?.plan ?? 'starter'}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 capitalize"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Role</label>
          <input
            readOnly value={user?.role ?? 'viewer'}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 capitalize"
          />
        </div>
      </div>
    </div>
  );
}
