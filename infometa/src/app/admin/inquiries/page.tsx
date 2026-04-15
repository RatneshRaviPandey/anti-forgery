"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "../layout";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MessageSquare, ChevronDown, ChevronUp, X } from "lucide-react";
import toast from "react-hot-toast";

interface Inquiry {
  id: string;
  type: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  industry: string | null;
  subject: string | null;
  message: string;
  token: string | null;
  status: string;
  priority: string;
  notes: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

const typeColors: Record<string, string> = {
  contact: "bg-blue-100 text-blue-700",
  demo_request: "bg-purple-100 text-purple-700",
  counterfeit_report: "bg-red-100 text-red-700",
  feedback: "bg-green-100 text-green-700",
  support: "bg-yellow-100 text-yellow-700",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

const statusColors: Record<string, string> = {
  new: "bg-teal-100 text-teal-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-600",
};

export default function InquiriesPage() {
  const { token } = useAdminAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  function loadInquiries() {
    const params = new URLSearchParams();
    if (typeFilter) params.set("type", typeFilter);
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/superadmin/inquiries?limit=100&${params}`, { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.success) setInquiries(d.data); })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!token) return;
    loadInquiries();
  }, [token, typeFilter, statusFilter]);

  async function updateInquiry(id: string, updates: Record<string, string>) {
    setSaving(id);
    try {
      const res = await fetch(`/api/superadmin/inquiries/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Inquiry updated");
        loadInquiries();
      } else {
        toast.error(data.error || "Update failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(null);
    }
  }

  const newCount = inquiries.filter(i => i.status === "new").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <MessageSquare size={24} /> Inquiries & Reports
          </h1>
          <p className="text-sm text-secondary">
            {inquiries.length} total{newCount > 0 && <span className="ml-2 text-teal-700 font-medium">({newCount} new)</span>}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="h-9 rounded-lg border border-border bg-white px-3 text-sm">
          <option value="">All Types</option>
          <option value="contact">Contact</option>
          <option value="demo_request">Demo Request</option>
          <option value="counterfeit_report">Counterfeit Report</option>
          <option value="feedback">Feedback</option>
          <option value="support">Support</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="h-9 rounded-lg border border-border bg-white px-3 text-sm">
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700" /></div>
      ) : inquiries.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-secondary">No inquiries found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map(inq => (
            <div key={inq.id} className={cn(
              "rounded-xl border bg-white transition-all",
              inq.status === "new" ? "border-teal-300 shadow-sm" : "border-border"
            )}>
              {/* Header row */}
              <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpanded(expanded === inq.id ? null : inq.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", typeColors[inq.type] || "bg-gray-100")}>
                      {inq.type.replace("_", " ")}
                    </span>
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", priorityColors[inq.priority] || "bg-gray-100")}>
                      {inq.priority}
                    </span>
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", statusColors[inq.status] || "bg-gray-100")}>
                      {inq.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground truncate">
                    {inq.subject || inq.type.replace("_", " ")} — {inq.name}
                  </p>
                  <p className="text-xs text-secondary">{inq.email} • {new Date(inq.createdAt).toLocaleString()}</p>
                </div>
                {expanded === inq.id ? <ChevronUp size={18} className="text-secondary" /> : <ChevronDown size={18} className="text-secondary" />}
              </div>

              {/* Expanded detail */}
              {expanded === inq.id && (
                <div className="border-t border-border p-4 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div><span className="text-secondary">Name:</span> <span className="font-medium">{inq.name}</span></div>
                    <div><span className="text-secondary">Email:</span> <span className="font-medium">{inq.email}</span></div>
                    {inq.phone && <div><span className="text-secondary">Phone:</span> <span className="font-medium">{inq.phone}</span></div>}
                    {inq.company && <div><span className="text-secondary">Company:</span> <span className="font-medium">{inq.company}</span></div>}
                    {inq.industry && <div><span className="text-secondary">Industry:</span> <span className="font-medium">{inq.industry}</span></div>}
                  </div>

                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{inq.message}</p>
                  </div>

                  {inq.token && (
                    <div className="text-xs text-secondary">
                      <span className="font-medium">QR Token:</span>{" "}
                      <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">{inq.token.slice(0, 50)}…</code>
                    </div>
                  )}

                  {inq.notes && (
                    <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3">
                      <p className="text-xs font-medium text-yellow-800 mb-1">Admin Notes</p>
                      <p className="text-sm text-yellow-900">{inq.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                    {inq.status === "new" && (
                      <button onClick={() => updateInquiry(inq.id, { status: "in_progress" })} disabled={saving === inq.id}
                        className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                        Mark In Progress
                      </button>
                    )}
                    {(inq.status === "new" || inq.status === "in_progress") && (
                      <button onClick={() => updateInquiry(inq.id, { status: "resolved" })} disabled={saving === inq.id}
                        className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                        Resolve
                      </button>
                    )}
                    {inq.status === "resolved" && (
                      <button onClick={() => updateInquiry(inq.id, { status: "closed" })} disabled={saving === inq.id}
                        className="text-xs px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50">
                        Close
                      </button>
                    )}
                    {inq.priority !== "urgent" && inq.type === "counterfeit_report" && (
                      <button onClick={() => updateInquiry(inq.id, { priority: "urgent" })} disabled={saving === inq.id}
                        className="text-xs px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                        Escalate to Urgent
                      </button>
                    )}
                    <button onClick={() => {
                      const note = prompt("Enter admin note:");
                      if (note) updateInquiry(inq.id, { notes: (inq.notes ? inq.notes + "\n" : "") + `[${new Date().toLocaleString()}] ${note}` });
                    }} className="text-xs px-3 py-1.5 border border-border rounded-lg hover:bg-gray-50">
                      Add Note
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
