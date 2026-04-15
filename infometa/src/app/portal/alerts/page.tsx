"use client";

import { useEffect, useState } from "react";
import { usePortalAuth } from "../layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

export default function PortalAlerts() {
  const { token } = usePortalAuth();
  const [alerts, setAlerts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!token) return;
    const resolved = filter === "active" ? "false" : filter === "resolved" ? "true" : undefined;
    const params = new URLSearchParams({ limit: "200" });
    if (resolved) params.set("resolved", resolved);
    fetch(`/api/alerts?${params}`, { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.success) setAlerts(d.data); })
      .finally(() => setLoading(false));
  }, [token, filter]);

  async function resolveAlert(id: string) {
    await fetch(`/api/alerts/${id}/resolve`, { method: "POST", credentials: "include" });
    setAlerts(prev => prev.map(a => String(a.id) === id ? { ...a, resolved: true } : a));
  }

  const filtered = alerts.filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    return String(a.type ?? "").includes(q) || String(a.token ?? "").includes(q) || String(a.severity ?? "").includes(q);
  });

  const typeLabel = (t: string) => t.replace(/_/g, " ");
  const typeBadge = (t: string) => {
    if (t === "duplicate_scan" || t === "recall" || t === "deactivated_use") return "invalid" as const;
    if (t === "scan_spike" || t === "geo_anomaly") return "suspicious" as const;
    return "info" as const;
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-700" /></div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
          {["all", "active", "resolved"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition", filter === f ? "bg-teal-700 text-white" : "text-gray-600 hover:bg-gray-100")}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="search" placeholder="Search alerts..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-9 rounded-lg border border-gray-200 pl-9 pr-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center text-sm text-gray-400">No alerts</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(alert => (
            <div key={String(alert.id)} className={cn("rounded-xl border bg-white p-5", alert.resolved ? "border-gray-200" : "border-amber-200")}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={typeBadge(String(alert.type ?? ""))}>{typeLabel(String(alert.type ?? ""))}</Badge>
                    <span className="text-xs font-medium capitalize text-gray-500">{String(alert.severity ?? "medium")}</span>
                    {Boolean(alert.resolved) && <Badge variant="authentic">resolved</Badge>}
                    <span className="text-xs text-gray-400">{alert.createdAt ? new Date(alert.createdAt as string).toLocaleString() : ""}</span>
                  </div>
                  {Boolean(alert.token) && (
                    <p className="text-xs text-gray-500 font-mono">Token: {String(alert.token).slice(0, 40)}…</p>
                  )}
                  {Boolean(alert.scanCount) && <p className="text-xs text-gray-500">{String(alert.scanCount)} scans detected</p>}
                </div>
                {!alert.resolved && (
                  <Button size="sm" variant="secondary" onClick={() => resolveAlert(String(alert.id))}>Resolve</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}