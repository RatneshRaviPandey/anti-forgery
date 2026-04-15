"use client";

import { useEffect, useState } from "react";
import { usePortalAuth } from "../layout";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { SkeletonTable, EmptyState } from "@/components/ui/skeleton";
import Link from "next/link";
import { Plus, Pencil, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface BatchForm {
  batchCode: string;
  manufactureDate: string;
  expiryDate: string;
  totalUnits: number;
  notes: string;
}

export default function PortalBatches() {
  const { token, user } = usePortalAuth();
  const canEdit = user?.role === 'owner' || user?.role === 'admin';
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editBatch, setEditBatch] = useState<Record<string, unknown> | null>(null);
  const [editForm, setEditForm] = useState<BatchForm>({ batchCode: "", manufactureDate: "", expiryDate: "", totalUnits: 0, notes: "" });
  const [saving, setSaving] = useState(false);

  const fetchBatches = () => {
    fetch("/api/batches?limit=200", { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.success) setBatches(d.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!token) return;
    fetchBatches();
  }, [token]);

  const toDateInput = (val: unknown): string => {
    if (!val) return "";
    const d = new Date(val as string);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  };

  const openEdit = (item: Record<string, unknown>) => {
    setEditBatch(item);
    setEditForm({
      batchCode: (item.batchCode as string) ?? "",
      manufactureDate: toDateInput(item.manufactureDate),
      expiryDate: toDateInput(item.expiryDate),
      totalUnits: Number(item.totalUnits ?? 0),
      notes: (item.notes as string) ?? "",
    });
  };

  const handleSave = async () => {
    if (!editBatch) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/batches/${editBatch.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          manufactureDate: editForm.manufactureDate || null,
          expiryDate: editForm.expiryDate || null,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Batch updated");
        setEditBatch(null);
        fetchBatches();
      } else {
        toast.error(data.error ?? "Failed to update batch");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: "batchCode", header: "Batch Code", sortable: true, filterable: true },
    {
      key: "totalUnits", header: "Total Units", sortable: true,
      render: (item: Record<string, unknown>) => Number(item.totalUnits ?? 0).toLocaleString(),
    },
    {
      key: "generatedUnits", header: "Generated", sortable: true,
      render: (item: Record<string, unknown>) => {
        const gen = Number(item.generatedUnits ?? 0);
        const total = Number(item.totalUnits ?? 1);
        const pct = total > 0 ? Math.round((gen / total) * 100) : 0;
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-teal-600 rounded-full" style={{ width: pct + "%" }} />
            </div>
            <span className="text-xs text-gray-500">{pct}%</span>
          </div>
        );
      },
    },
    { key: "manufactureDate", header: "Mfg Date", sortable: true },
    {
      key: "expiryDate", header: "Expiry", sortable: true,
      render: (item: Record<string, unknown>) => {
        if (!item.expiryDate) return "—";
        const exp = new Date(item.expiryDate as string);
        const isExpired = exp < new Date();
        const isSoon = !isExpired && exp < new Date(Date.now() + 30 * 86400000);
        return (
          <span className={isExpired ? "text-red-600 font-medium" : isSoon ? "text-amber-600 font-medium" : ""}>
            {exp.toLocaleDateString()}{isExpired ? " (Expired)" : isSoon ? " (Soon)" : ""}
          </span>
        );
      },
    },
    {
      key: "isActive", header: "Status", sortable: true, filterable: true,
      filterOptions: ["true", "false"],
      render: (item: Record<string, unknown>) => (
        <Badge variant={item.isActive ? "authentic" : "suspicious"}>
          {item.isActive ? "Active" : "Pending"}
        </Badge>
      ),
    },
    {
      key: "createdAt", header: "Created", sortable: true,
      render: (item: Record<string, unknown>) =>
        item.createdAt ? new Date(item.createdAt as string).toLocaleDateString() : "—",
    },
    ...(canEdit ? [{
      key: "_actions", header: "Actions", width: 80,
      render: (item: Record<string, unknown>) => (
        <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-teal-700 transition">
          <Pencil size={15} />
        </button>
      ),
    }] : []),
  ];

  if (loading) return <SkeletonTable rows={5} cols={5} className="mt-6" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Batches</h1>
          <p className="text-sm text-gray-500">{batches.length} batches</p>
        </div>
        {canEdit && (
          <Link href="/portal/batches/new" className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition">
            <Plus size={16} /> New Batch
          </Link>
        )}
      </div>
      {batches.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No batches yet"
          description="Create your first batch to start generating QR codes for your products."
          action="Create Your First Batch"
          actionHref="/portal/batches/new"
        />
      ) : (
        <DataTable data={batches} columns={columns as never} pageSize={25} exportFilename="batches-export" searchable />
      )}

      {editBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditBatch(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Edit Batch</h2>
              <button onClick={() => setEditBatch(null)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch Code</label>
                <input type="text" value={editForm.batchCode} onChange={e => setEditForm(f => ({ ...f, batchCode: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manufacture Date</label>
                  <input type="date" value={editForm.manufactureDate} onChange={e => setEditForm(f => ({ ...f, manufactureDate: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input type="date" value={editForm.expiryDate} onChange={e => setEditForm(f => ({ ...f, expiryDate: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Units</label>
                <input type="number" min={0} value={editForm.totalUnits} onChange={e => setEditForm(f => ({ ...f, totalUnits: parseInt(e.target.value) || 0 }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setEditBatch(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-teal-700 hover:bg-teal-800 text-white rounded-lg transition disabled:opacity-50">
                {saving && <Loader2 size={16} className="animate-spin" />}
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}