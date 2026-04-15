"use client";

import { useState } from "react";
import { useAlerts } from "@/hooks/use-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AlertsPage() {
  const [filter, setFilter] = useState<string>("all");
  const resolved = filter === "active" ? "false" : filter === "resolved" ? "true" : undefined;
  const { data: apiData, error, isLoading, mutate } = useAlerts(1, 100, resolved);
  const alerts = Array.isArray(apiData) ? apiData : [];

  const filtered = alerts.filter((a: Record<string, unknown>) => {
    if (filter === "active") return !a.resolved;
    if (filter === "resolved") return a.resolved;
    return true;
  });

  async function resolveAlert(id: string) {
    await fetch(`/api/alerts/${id}/resolve`, {
      method: 'POST',
      credentials: 'include',
    });
    mutate();
  }

  const typeVariant = (type: string) => {
    if (type === "duplicate_scan" || type === "recall" || type === "deactivated_use") return "invalid" as const;
    if (type === "scan_spike") return "suspicious" as const;
    return "info" as const;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Alerts</h1>
        <p className="text-sm text-secondary">
          Monitor and resolve clone detection, scan spikes, and geographic anomalies.
        </p>
      </div>

      <div className="flex gap-2">
        {["all", "active", "resolved"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              filter === f
                ? "bg-primary text-white"
                : "bg-white text-secondary border border-border hover:bg-surface-tint"
            )}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700" /></div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">Failed to load alerts</div>
      ) : (
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-white p-8 text-center">
            <p className="text-sm text-secondary">No alerts match your filter.</p>
          </div>
        ) : (
          filtered.map((alert: Record<string, unknown>) => (
            <div
              key={String(alert.id)}
              className={cn(
                "rounded-xl border bg-white p-5 transition-colors",
                alert.resolved ? "border-border" : "border-warning/30"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={typeVariant(String(alert.type ?? ""))}>
                      {String(alert.type ?? "").replace("_", " ")}
                    </Badge>
                    {Boolean(alert.resolved) && <Badge variant="authentic">resolved</Badge>}
                    <span className="text-xs text-secondary">
                      {alert.createdAt ? new Date(alert.createdAt as string).toLocaleString() : ""}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">
                    {String(alert.severity ?? "medium")} severity alert
                    {alert.scanCount ? ` — ${alert.scanCount} scans` : ""}
                  </p>
                  {Boolean(alert.token) && (
                    <p className="text-xs text-secondary">Token: <code className="rounded bg-background px-1 py-0.5 font-mono">{String(alert.token).slice(0, 30)}…</code></p>
                  )}
                </div>
                {!alert.resolved && (
                  <Button size="sm" variant="secondary" onClick={() => resolveAlert(String(alert.id))}>
                    Resolve
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      )}
    </div>
  );
}
