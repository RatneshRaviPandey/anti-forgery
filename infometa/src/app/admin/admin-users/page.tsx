"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "../layout";
import { Badge } from "@/components/ui/badge";
import { Shield, UserPlus, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface AdminUser {
  id: string; name: string; email: string; isActive: boolean;
  isSuperAdmin: boolean; lastLoginAt: string | null; createdAt: string;
}

export default function AdminUsersManagement() {
  const { token } = useAdminAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", brandId: "" });

  function loadAdmins() {
    fetch("/api/superadmin/admins", { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.success) setAdmins(d.data); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { if (token) loadAdmins(); }, [token]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/superadmin/admins", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Super admin created!");
        setShowCreate(false);
        setForm({ name: "", email: "", password: "", brandId: "" });
        loadAdmins();
      } else toast.error(data.error || "Failed");
    } catch { toast.error("Network error"); }
    finally { setCreating(false); }
  }

  async function toggleActive(id: string, isActive: boolean) {
    const res = await fetch(`/api/superadmin/admins/${id}`, {
      method: "PUT", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    const data = await res.json();
    if (data.success) { toast.success(isActive ? "Admin deactivated" : "Admin activated"); loadAdmins(); }
    else toast.error(data.error || "Failed");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <Shield size={24} /> Super Admin Users
          </h1>
          <p className="text-sm text-secondary">{admins.length} admin accounts</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition">
          <UserPlus size={16} /> New Admin
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700" /></div>
      ) : (
        <div className="rounded-xl border border-border bg-white divide-y divide-border">
          {admins.map(admin => (
            <div key={admin.id} className="flex items-center justify-between p-4 hover:bg-surface-tint/30">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                  {admin.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{admin.name}</p>
                  <p className="text-xs text-secondary">{admin.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={admin.isActive ? "authentic" : "invalid"}>
                  {admin.isActive ? "Active" : "Inactive"}
                </Badge>
                <span className="text-xs text-secondary">
                  {admin.lastLoginAt ? `Last: ${new Date(admin.lastLoginAt).toLocaleDateString()}` : "Never logged in"}
                </span>
                <button onClick={() => toggleActive(admin.id, admin.isActive)}
                  className={`text-xs px-3 py-1.5 rounded-lg border ${admin.isActive ? "text-red-600 border-red-200 hover:bg-red-50" : "text-green-600 border-green-200 hover:bg-green-50"}`}>
                  {admin.isActive ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Create Super Admin</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input required type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password (min 12 chars)</label>
                <input required type="password" minLength={12} value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Associated Brand ID</label>
                <input required value={form.brandId} onChange={e => setForm(f => ({...f, brandId: e.target.value}))}
                  placeholder="UUID of the brand" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                <button type="submit" disabled={creating} className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-teal-700 rounded-lg hover:bg-teal-800 disabled:opacity-50">
                  {creating && <Loader2 size={16} className="animate-spin" />}
                  {creating ? "Creating..." : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
